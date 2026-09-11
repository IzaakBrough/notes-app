from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel

from app import auth
from app.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(title="Notes Server", lifespan=lifespan)


class SetupRequest(BaseModel):
    password: str


class UnlockRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    token: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/setup", status_code=status.HTTP_201_CREATED)
def setup(payload: SetupRequest) -> dict[str, str]:
    try:
        auth.set_password(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return {"status": "ok"}


@app.post("/unlock", response_model=TokenResponse)
def unlock(payload: UnlockRequest) -> TokenResponse:
    try:
        token = auth.create_session(payload.password)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return TokenResponse(token=token)


@app.get("/session")
def session_status(_: bytes = Depends(auth.require_session)) -> dict[str, bool]:
    return {"active": True}
