from fastapi import Depends, Header, HTTPException, status
from app.core.config import settings

def require_admin(x_api_key: str | None = Header(default=None)) -> None:
    if not settings.AUTH_ENABLED:
        return

    if not x_api_key or x_api_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key",
        )

def get_request_user(x_user_id: str | None = Header(default=None)) -> str | None:
    return x_user_id