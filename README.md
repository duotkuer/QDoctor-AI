# QDoctor AI – Healthcare Document Question Answering Agent

## Overview

QDoctor AI is an intelligent healthcare assistant that enables users to upload, manage, and query healthcare-related PDF documents using advanced AI language models. The system consists of a **FastAPI backend** and a **React frontend**. Users can upload documents, select any document, and ask natural language questions; the AI will answer based on the content of the selected document.

---

## Features

- **Document Upload:** Upload one or more PDF documents to build your document base.
- **Document Management:** View and select from all uploaded documents.
- **AI-Powered Q&A:** Ask questions about any document and get context-aware, concise answers.
- **Modern UI:** Clean, responsive React interface with a chat-style conversation flow.
- **Scrolling Chat:** Chat area supports scrolling for long conversations, with a fixed input bar and header.
- **Error Handling:** User-friendly error messages for upload, backend, and AI issues.

---

## Tech Stack

- **Backend:** Python, FastAPI, Groq LLM API, Pydantic, Uvicorn, python-dotenv
- **Frontend:** React (with hooks), CSS (custom or Tailwind CSS if you added it), Axios or Fetch API

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/qdoctor-ai.git
cd qdoctor-ai
```

### 2. Backend Setup

#### a. Create and activate a virtual environment

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate  # On Windows
# Or: source .venv/bin/activate  # On Mac/Linux
```

#### b. Install dependencies

```bash
pip install -r requirements.txt
```

#### c. Set up environment variables

Create a `.env` file in the `Backend` directory:

```
GROQ_API_KEY=your_groq_api_key_here
```

#### d. Run the backend server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at [http://localhost:8000](http://localhost:8000) and API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 3. Frontend Setup

```bash
cd ../healthcare-ai-frontend
npm install
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Upload Documents:** Click the "Upload" button in the sidebar to add PDF documents.
2. **Select a Document:** Click on any document in the sidebar to activate it.
3. **Ask Questions:** Type your question in the chat input and press Enter or click Send.
4. **View Answers:** The AI will respond in the chat area, referencing only the selected document.

---

## Project Structure

```
qdoctor-ai/
│
├── Backend/
│   ├── main.py                # FastAPI app and endpoints
│   ├── knowledge_base.py      # Document storage and PDF extraction logic
│   ├── requirements.txt
│   └── ... (other backend files)
│
├── healthcare-ai-frontend/
│   ├── src/
│   │   ├── App.js             # Main React app
│   │   ├── App.css            # Styles
│   │   └── ... (other frontend files)
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## API Endpoints

### `POST /upload_documents`
Upload one or more PDF files.

### `GET /documents`
Get a list of all uploaded documents.

### `POST /query`
Ask a question about a specific document.
- **Request:** `{ "document_id": "<id>", "query": "<your question>" }`
- **Response:** `{ "answer": "<AI's answer>" }`

---

## Customization

- **Model:** The backend uses Groq's `llama3-8b-8192` model by default. You can change this in `main.py`.
- **Document Storage:** Documents are stored and indexed in the backend; see `knowledge_base.py` for details.
- **Styling:** The frontend uses custom CSS. You can further customize in `App.css`.

---

## Troubleshooting

- **CORS Issues:** Ensure both frontend and backend are running on the correct ports and CORS is enabled in `main.py`.
- **API Key Errors:** Make sure your `.env` file is present and contains a valid `GROQ_API_KEY`.
- **PDF Extraction Issues:** Only PDF files are supported. Ensure your PDFs are not encrypted or corrupted.

---

## License

MIT License

---

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Groq](https://groq.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [python-dotenv](https://pypi.org/project/python-dotenv/)
- [Pydantic](https://docs.pydantic.dev/)

---

## Contact

For questions or contributions, open an issue or pull request on [GitHub](https://github.com/yourusername/qdoctor-ai)
