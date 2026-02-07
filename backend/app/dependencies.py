import logging
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from sqlalchemy.orm import Session
from .core.db import get_session

logger = logging.getLogger(__name__)

# Better Auth frontend URL for JWKS endpoint
BETTER_AUTH_URL = os.environ.get("BETTER_AUTH_URL", "http://localhost:3000")
JWKS_URL = f"{BETTER_AUTH_URL}/api/auth/jwks"

security = HTTPBearer()

# Cache the JWKS client to avoid repeated fetches
_jwks_client = None

def get_jwks_client() -> PyJWKClient:
    """Get or create the JWKS client with caching."""
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(JWKS_URL, cache_keys=True, lifespan=3600)
    return _jwks_client

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify JWT token using Better Auth's JWKS endpoint.
    Better Auth uses EdDSA (Ed25519) asymmetric keys by default.
    """
    token = credentials.credentials

    try:
        logger.info(f"[AUTH DEBUG] Validating JWT token: {token[:50]}...")

        # Get the signing key from JWKS
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        # Better Auth uses EdDSA by default, but also support other algorithms
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "ES256", "RS256", "PS256"],
            options={"verify_aud": False}  # Better Auth may not set audience
        )

        logger.info(f"[AUTH DEBUG] JWT payload: {payload}")

        # Extract user ID from 'sub' claim
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("JWT missing sub claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        logger.info(f"User authenticated: {user_id}")
        return user_id

    except jwt.ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during JWT validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
