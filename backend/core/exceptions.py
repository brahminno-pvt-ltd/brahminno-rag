from fastapi import Request
from fastapi.responses import JSONResponse

class NoStoreError(Exception):
    pass

class UnsupportedFileError(Exception):
    pass

async def no_store_handler(request: Request, exc: NoStoreError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

async def unsupported_file_handler(request: Request, exc: UnsupportedFileError):
    return JSONResponse(status_code=415, content={"detail": str(exc)})
