import logging
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()


def get_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extract the raw JWT token from the Authorization header."""
    return credentials.credentials


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extract and validate the Supabase JWT from the Authorization header.

    Returns the Supabase user_id (the ``sub`` claim).
    """
    token = credentials.credentials
    payload = None
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if not payload or not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )

    return user_id


def get_user_supabase(
    token: str = Depends(get_token),
) -> Client:
    """Build a user-scoped Supabase client that respects RLS policies."""
    from app.services.supabase_client import get_user_client

    return get_user_client(token)
