from ingestion.vector_store import get_store
from core.exceptions import NoStoreError
from core.logger import get_logger

logger = get_logger(__name__)

def get_retriever(session_id: str, top_k: int = 4, hybrid: bool = False):
    store = get_store(session_id)
    if store is None:
        raise NoStoreError(
            f"No documents indexed for session '{session_id}'. "
            "Please upload documents first."
        )

    # MMR (Max Marginal Relevance) reduces redundancy in results
    retriever = store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": top_k, "fetch_k": top_k * 3},
    )

    return retriever
