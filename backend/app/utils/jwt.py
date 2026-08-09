import logging

import httpx
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

# This Supabase project signs access tokens with an asymmetric JWT signing
# key (ECC P-256 → ES256), so tokens are verified against the public keys
# published at the project's JWKS endpoint — the legacy shared JWT secret
# does not work for these tokens.
_ALLOWED_ALGORITHMS = ["ES256"]
_JWKS_URL = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"

# Signing keys cached by ``kid``. They only change on key rotation, so a
# refetch is only needed when a token references an unknown kid.
_jwks_keys: dict[str, dict] = {}


class SigningKeysUnavailable(Exception):
    """The JWKS endpoint could not be reached — a server-side problem,
    not a problem with the caller's token."""


def _fetch_signing_keys() -> dict[str, dict]:
    response = httpx.get(_JWKS_URL, timeout=5.0)
    response.raise_for_status()
    return {k["kid"]: k for k in response.json().get("keys", []) if "kid" in k}


def has_cached_signing_keys() -> bool:
    """True when the JWKS cache is populated (i.e. verification needs no network)."""
    return bool(_jwks_keys)


def warm_signing_keys() -> None:
    """Pre-fetch JWKS at startup so the first authenticated request doesn't
    pay the fetch cost. Best-effort: lazy refetch on demand still applies."""
    global _jwks_keys
    try:
        _jwks_keys = _fetch_signing_keys()
    except Exception as exc:
        logger.warning("JWKS pre-fetch failed (will retry on first request): %s", exc)


def _get_signing_key(kid: str) -> dict:
    global _jwks_keys
    if kid not in _jwks_keys:
        try:
            _jwks_keys = _fetch_signing_keys()
        except httpx.HTTPError as exc:
            raise SigningKeysUnavailable(str(exc)) from exc
    key = _jwks_keys.get(kid)
    if key is None:
        raise JWTError(f"Unknown signing key (kid={kid!r})")
    return key


def decode_access_token(token: str) -> dict:
    """Verify a Supabase access token and return its claims.

    Raises ``JWTError`` for invalid or expired tokens, and
    ``SigningKeysUnavailable`` when the public signing keys cannot be
    fetched from Supabase.
    """
    header = jwt.get_unverified_header(token)
    alg = header.get("alg")
    if alg not in _ALLOWED_ALGORITHMS:
        raise JWTError(f"Unexpected token algorithm: {alg}")
    key = _get_signing_key(header.get("kid", ""))
    return jwt.decode(
        token,
        key,
        algorithms=_ALLOWED_ALGORITHMS,
        # leeway absorbs small clock skew between this server and Supabase
        options={"verify_aud": False, "leeway": 30},
    )


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
    try:
        payload = decode_access_token(token)
    except JWTError as e:
        logger.warning("JWT verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    except SigningKeysUnavailable:
        logger.warning("Could not fetch Supabase signing keys", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable. Please try again.",
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
