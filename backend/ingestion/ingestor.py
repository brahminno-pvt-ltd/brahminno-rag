import os, tempfile
from fastapi import UploadFile
from langchain_community.document_loaders import (
    PyPDFLoader, Docx2txtLoader, TextLoader, WebBaseLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ingestion.vector_store import get_or_create_store
from core.config import get_settings
from core.exceptions import UnsupportedFileError
from core.logger import get_logger
from datetime import datetime

logger = get_logger(__name__)

LOADERS = {
    ".pdf": PyPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": TextLoader,
}

def _get_splitter():
    s = get_settings()
    return RecursiveCharacterTextSplitter(
        chunk_size=s.chunk_size,
        chunk_overlap=s.chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )

async def ingest_file(file: UploadFile, session_id: str) -> dict:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in LOADERS:
        raise UnsupportedFileError(
            f"Unsupported file type: {ext}. Supported: PDF, DOCX, TXT"
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        loader = LOADERS[ext](tmp_path)
        docs = loader.load()
    finally:
        os.unlink(tmp_path)

    for doc in docs:
        doc.metadata.update({
            "source": file.filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "session_id": session_id,
        })

    chunks = _get_splitter().split_documents(docs)
    store = get_or_create_store(session_id)
    store.add_documents(chunks)
    logger.info(f"Ingested {file.filename}: {len(chunks)} chunks for session {session_id}")
    return {"chunks": len(chunks)}

async def ingest_url(url: str, session_id: str) -> dict:
    loader = WebBaseLoader(url)
    docs = loader.load()

    for doc in docs:
        doc.metadata.update({
            "source": url,
            "uploaded_at": datetime.utcnow().isoformat(),
            "session_id": session_id,
        })

    chunks = _get_splitter().split_documents(docs)
    store = get_or_create_store(session_id)
    store.add_documents(chunks)
    logger.info(f"Ingested URL {url}: {len(chunks)} chunks for session {session_id}")
    return {"chunks": len(chunks)}
