import base64
import os
import secrets
import sqlite3

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from fastapi import Header, HTTPException, status

from app.db import get_connection

_KDF_ITERATIONS = 390_000

_hasher = PasswordHasher()

# Maps session token -> derived Fernet key, in memory only for the life of
# the process. Never persisted and never returned to the client.
_sessions: dict[str, bytes] = {}


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=_KDF_ITERATIONS)
    return base64.urlsafe_b64encode(kdf.derive(password.encode("utf-8")))


def _fetch_secret(conn: sqlite3.Connection) -> tuple[str, bytes] | None:
    row = conn.execute("SELECT password_hash, kdf_salt FROM auth_secret WHERE id = 1").fetchone()
    if row is None:
        return None
    return row[0], row[1]


def is_password_set() -> bool:
    with get_connection() as conn:
        return _fetch_secret(conn) is not None


def set_password(password: str) -> None:
    with get_connection() as conn:
        if _fetch_secret(conn) is not None:
            raise ValueError("password already set")
        salt = os.urandom(16)
        password_hash = _hasher.hash(password)
        conn.execute(
            "INSERT INTO auth_secret (id, password_hash, kdf_salt) VALUES (1, ?, ?)",
            (password_hash, salt),
        )


def create_session(password: str) -> str:
    with get_connection() as conn:
        secret = _fetch_secret(conn)
    if secret is None:
        raise PermissionError("no password set")
    password_hash, salt = secret
    try:
        _hasher.verify(password_hash, password)
    except VerifyMismatchError as exc:
        raise PermissionError("invalid password") from exc

    token = secrets.token_urlsafe(32)
    _sessions[token] = _derive_key(password, salt)
    return token


def get_session_key(token: str) -> bytes | None:
    return _sessions.get(token)


def require_session(authorization: str | None = Header(default=None)) -> bytes:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing session token"
        )
    key = get_session_key(authorization.removeprefix("Bearer "))
    if key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session"
        )
    return key
