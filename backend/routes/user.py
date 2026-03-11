from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
import jwt
import os
from typing import Annotated

from auth_utils import oauth2_scheme

router = APIRouter(prefix="/user", tags=["User"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# decodes the JWT that is provided in the request's Authorization header
@router.get("/me")
async def read_users_me(
	token: Annotated[str, Depends(oauth2_scheme)]
): 
	try: # Here you use your PyJWT for validation
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return {"user_data": payload}
	except jwt.PyJWTError:
		raise HTTPException(status_code=401, detail="Invalid token")
