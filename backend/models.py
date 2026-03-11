from typing import Optional
from pydantic import EmailStr
from sqlmodel import Field, SQLModel

# to do: email: str or email: EmailStr
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    nickname: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)

class UserCreate(SQLModel):
    email: EmailStr
    nickname: str
    password: str

class UserResponse(SQLModel):
    id: int
    email: EmailStr
    nickname: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
