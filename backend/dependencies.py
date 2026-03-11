from typing import Annotated
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import select
import jwt
import os

from database import get_db
from auth_utils import oauth2_scheme
from models import User

# This file's responsibility is to define dependencies that can be reused 
# in different parts of the application.

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_for_testing")
ALGORITHM = "HS256"


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Session = Depends(get_db),
) -> User:
    """Decode the JWT and return the full User from the database."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.execute(select(User).where(User.email == email)).scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
