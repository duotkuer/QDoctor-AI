# main.py
import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Import Groq client
from groq import Groq

# Import knowledge base functions
from knowledge_base import (
    add_document_to_knowledge_base,
    get_document_content,
    get_all_documents,
    extract_text_from_pdf,
    DOCUMENT_UPLOAD_DIR,
    initialize_knowledge_base # Ensure this is called to create the directory
)

# Lifespan event to initialize the knowledge base
@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_knowledge_base()
    yield

# Initialize FastAPI app
app = FastAPI(lifespan=lifespan)

# Configure CORS to allow communication from your React frontend
origins = [
    "http://localhost:3000", # React development server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Groq API key from environment variables
from dotenv import load_dotenv
load_dotenv()

grok_api_key = os.getenv("GROQ_API_KEY")
if not grok_api_key:
    raise ValueError("GROQ_API_KEY environment variable not set.")
groq_client = Groq(api_key=grok_api_key)

# Pydantic models for request and response bodies
class QueryRequest(BaseModel):
    document_id: str
    query: str

class DocumentInfo(BaseModel):
    id: str
    name: str

class QueryResponse(BaseModel):
    answer: str

# Ensure the upload directory exists on startup
async def startup_event():
    initialize_knowledge_base()
    # knowledge_base.load_documents_from_folder(knowledge_base.DOCUMENT_UPLOAD_DIR)
    # The initialize_knowledge_base() function already calls load_documents_from_folder
    # for the default DOCUMENT_UPLOAD_DIR.

@app.get("/documents", response_model=List[DocumentInfo])
async def get_documents():
    """
    Returns a list of all available documents in the knowledge base.
    """
    docs = get_all_documents()
    # Return as a list of document names (or objects if you want more info)
    return docs

@app.post("/upload_documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Uploads one or more PDF documents, extracts text, and adds to the knowledge base.
    """
    uploaded_count = 0
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        # Create a unique filename to avoid conflicts
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(DOCUMENT_UPLOAD_DIR, unique_filename)

        try:
            # Save the uploaded file
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())

            # Extract text and add to knowledge base
            document_content = extract_text_from_pdf(file_path)
            if document_content:
                # Use the original filename as the document name, and a unique ID
                add_document_to_knowledge_base(str(uuid.uuid4()), file.filename, document_content)
                uploaded_count += 1
            else:
                print(f"Warning: Could not extract text from uploaded file {file.filename}. It will not be available for querying.")
                os.remove(file_path) # Remove empty file
        except Exception as e:
            print(f"Error processing uploaded file {file.filename}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to process file {file.filename}: {e}")

    return JSONResponse(content={"message": f"Successfully uploaded and processed {uploaded_count} document(s)."}, status_code=200)

@app.post("/query_ai")
async def query_ai(request: QueryRequest):
    """
    Queries the AI about a specific document.
    """
    document_content = get_document_content(request.document_id)

    if not document_content:
        raise HTTPException(status_code=404, detail="Document not found or content is empty.")

    # For simplicity, we'll send the entire document content to the LLM.
    # For very large documents, implement RAG (Retrieval-Augmented Generation)
    # to find relevant chunks of text.
    # Truncate content if it's too long for the model's context window
    max_content_length = 10000 # Adjust based on Groq model's context window
    truncated_content = document_content[:max_content_length]

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content":"You are a helpful AI assistant specialized in healthcare. "
                               "Answer questions using only the information provided in the document content. "
                                "Rephrase your response in the same tone as the user's question. "
                                "Keep the response concise and well-organized. "
                                "Use the same words or phrases found in the document where appropriate. "
                                "If the answer is not found in the document, say: 'The answer to your question "
                                "is not found in the selected document.",
                },
                {
                    "role": "user",
                    "content": f"Document Content:\n{truncated_content}\n\nQuestion: {request.query}",
                },
            ],
            model="llama3-8b-8192", 
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        ai_response = chat_completion.choices[0].message.content
        return {"response": ai_response}
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail=f"Error communicating with AI: {e}")

@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """
    Queries the document and returns the answer using the AI model.
    """
    document_content = get_document_content(request.document_id)

    if not document_content:
        raise HTTPException(status_code=404, detail="Document not found or content is empty.")

    # Truncate content if it's too long for the model's context window
    max_content_length = 10000  # Adjust based on Groq model's context window
    truncated_content = document_content[:max_content_length]

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant specialized in healthcare."
                    "Respond to salutations and enquire on how you may be of help."
                    " Answer questions based on the provided document content. If the answer"
                    "is not in the document, indicate the question asked is not in the document selected.",
                },
                {
                    "role": "user",
                    "content": f"Document Content:\n{truncated_content}\n\nQuestion: {request.query}",
                },
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        ai_response = chat_completion.choices[0].message.content
        return {"answer": ai_response}
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail=f"Error communicating with AI: {e}")

