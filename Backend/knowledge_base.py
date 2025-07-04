# knowledge_base.py
import os
import PyPDF2
from typing import Dict, Any

KNOWLEDGE_BASE: Dict[str, Dict[str, str]] = {}
DOCUMENT_UPLOAD_DIR = "C:/Users/HomePC/Desktop/LuxDevHQ Internship/Healthcare AI/Backend/pdfs" # Directory to save uploaded PDFs

def initialize_knowledge_base():
    """
    Initializes the knowledge base by creating the upload directory
    and load pre-existing documents.
    """
    os.makedirs(DOCUMENT_UPLOAD_DIR, exist_ok=True)
    print(f"Knowledge base initialized. Document upload directory: {DOCUMENT_UPLOAD_DIR}")
    # Example: Load any PDFs already in the uploaded_documents directory on startup
    load_documents_from_folder(DOCUMENT_UPLOAD_DIR)

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a PDF file.
    """
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def add_document_to_knowledge_base(document_id: str, document_name: str, content: str):
    """
    Adds a document's content to the in-memory knowledge base.
    """
    KNOWLEDGE_BASE[document_id] = {'name': document_name, 'content': content}
    print(f"Document '{document_name}' (ID: {document_id}) added to knowledge base.")

def get_document_content(document_id: str) -> str:
    """
    Retrieves the content of a document from the knowledge base.
    """
    return KNOWLEDGE_BASE.get(document_id, {}).get('content', '')

def get_all_documents() -> list[Dict[str, str]]:
    """
    Returns a list of all documents in the knowledge base (id and name).
    """
    return [{'id': doc_id, 'name': KNOWLEDGE_BASE[doc_id]['name']} for doc_id in KNOWLEDGE_BASE]

def load_documents_from_folder(folder_path: str):
    """
    Loads all PDF documents from a specified folder into the knowledge base.
    """
    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf"):
            file_path = os.path.join(folder_path, filename)
            doc_id = os.path.splitext(filename)[0] # Use filename without extension as ID
            content = extract_text_from_pdf(file_path)
            if content:
                add_document_to_knowledge_base(doc_id, filename, content)
            else:
                print(f"Could not extract content from {filename}. Skipping.")

# Initialize the knowledge base when this module is imported
initialize_knowledge_base()

