import os
from datetime import datetime, timedelta, timezone
from argon2 import PasswordHasher
import argon2
import jwt
from fastapi.security import OAuth2PasswordBearer

# -----------------------------------------------------------------------------
# Constants and Global Instances
# -----------------------------------------------------------------------------

# JWT signing key, algorithm, and token lifetime (for access tokens).
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_for_testing")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

ph = PasswordHasher() 

# OAuth2 scheme dependency. 
# It tells FastAPI which URL to use to get the token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------


def get_password_hash(password: str) -> str:
    """Hashes a password for secure database storage."""
    return ph.hash(password)


def verify_password(inserted_password: str, hashed_password: str) -> bool:
    """Checks if a provided password matches the hashed database passowrd"""
    try:
        ph.verify(hashed_password, inserted_password)
        return True
    except argon2.exceptions.VerifyMismatchError:
        return False
    except argon2.exceptions.InvalidHashError:
        return False


def create_access_token(data: dict) -> str:
    """Generates a JSON Web Token for user sessions."""
    to_encode = data.copy()
   
    # Set expiration time using timezone-aware UTC
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
   
    # Encode into a jwt string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt
