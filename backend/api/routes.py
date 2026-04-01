from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ingestion.ingestor import ingest_file, ingest_url
from ingestion.vector_store import persist_store, reset_store, get_store
from retrieval.retriever import get_retriever
from chains.rag_chain import build_rag_chain
from chains.memory import get_history, add_exchange, reset_memory
from core.guardrails import sanitize_query
from core.logger import get_logger
import json

logger = get_logger(__name__)
router = APIRouter()


class QueryRequest(BaseModel):
    session_id: str
    query: str
    top_k: int = 4
    hybrid: bool = False


class URLRequest(BaseModel):
    url: str
    session_id: str


class ResetRequest(BaseModel):
    session_id: str


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Query(default="default"),
):
    logger.info(f"Upload: {file.filename} for session {session_id}")
    result = await ingest_file(file, session_id)
    persist_store(session_id)
    return {"status": "success", "chunks": result["chunks"], "filename": file.filename}


@router.post("/upload-url")
async def upload_url(req: URLRequest):
    logger.info(f"URL ingest: {req.url} for session {req.session_id}")
    result = await ingest_url(req.url, req.session_id)
    persist_store(req.session_id)
    return {"status": "success", "chunks": result["chunks"], "url": req.url}


@router.post("/query")
async def query_documents(req: QueryRequest):
    async def event_stream():
        full_response = ""
        try:
            safe_query = sanitize_query(req.query)
            retriever = get_retriever(req.session_id, req.top_k, req.hybrid)

            # Fetch source docs for citations
            raw_docs = retriever.invoke(safe_query)
            sources = [
                {
                    "source": d.metadata.get("source", "unknown"),
                    "page": d.metadata.get("page", 0),
                    "snippet": d.page_content[:250],
                }
                for d in raw_docs
                if not d.metadata.get("init")
            ]

            # Build chain and inject chat history
            chain = build_rag_chain(retriever)
            history = get_history(req.session_id)

            async for token in chain.astream({
                "question": safe_query,
                "chat_history": history,
            }):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            # Persist exchange to memory
            add_exchange(req.session_id, safe_query, full_response)

            yield f"data: {json.dumps({'type': 'sources', 'content': sources})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Query error: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/reset")
async def reset_session(req: ResetRequest):
    reset_memory(req.session_id)
    reset_store(req.session_id)
    logger.info(f"Session reset: {req.session_id}")
    return {"status": "reset", "session_id": req.session_id}


@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@router.get("/sessions/{session_id}/docs")
async def list_documents(session_id: str):
    store = get_store(session_id)
    if not store:
        return {"documents": []}
    docs = list(store.docstore._dict.values())
    seen: set = set()
    unique = []
    for d in docs:
        src = d.metadata.get("source")
        if src and src not in seen and not d.metadata.get("init"):
            seen.add(src)
            unique.append({
                "source": src,
                "uploaded_at": d.metadata.get("uploaded_at"),
            })
    return {"documents": unique}
