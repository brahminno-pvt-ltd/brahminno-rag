import os, shutil
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from core.config import get_settings
from core.logger import get_logger

logger = get_logger(__name__)
_stores: dict = {}

def _get_embeddings():
    s = get_settings()
    return OpenAIEmbeddings(
        model=s.embedding_model,
        api_key=s.openai_api_key,
    )

def get_or_create_store(session_id: str) -> FAISS:
    if session_id not in _stores:
        s = get_settings()
        store_path = os.path.join(s.faiss_persist_dir, session_id)
        if os.path.exists(store_path):
            logger.info(f"Loading persisted store for session {session_id}")
            _stores[session_id] = FAISS.load_local(
                store_path,
                _get_embeddings(),
                allow_dangerous_deserialization=True,
            )
        else:
            logger.info(f"Creating new store for session {session_id}")
            _stores[session_id] = FAISS.from_texts(
                ["__init__"],
                _get_embeddings(),
                metadatas=[{"init": True}],
            )
    return _stores[session_id]

def persist_store(session_id: str):
    if session_id in _stores:
        s = get_settings()
        store_path = os.path.join(s.faiss_persist_dir, session_id)
        os.makedirs(store_path, exist_ok=True)
        _stores[session_id].save_local(store_path)
        logger.info(f"Persisted store for session {session_id}")

def get_store(session_id: str):
    return _stores.get(session_id)

def reset_store(session_id: str):
    s = get_settings()
    _stores.pop(session_id, None)
    store_path = os.path.join(s.faiss_persist_dir, session_id)
    if os.path.exists(store_path):
        shutil.rmtree(store_path)
    logger.info(f"Reset store for session {session_id}")
