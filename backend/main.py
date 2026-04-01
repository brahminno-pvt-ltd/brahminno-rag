from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from core.exceptions import NoStoreError, UnsupportedFileError, no_store_handler, unsupported_file_handler
from core.config import get_settings

settings = get_settings()

app = FastAPI(title="Brahminno RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(NoStoreError, no_store_handler)
app.add_exception_handler(UnsupportedFileError, unsupported_file_handler)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
