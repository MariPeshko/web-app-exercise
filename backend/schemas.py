# Data validation (Pydantic) - for data coming from the user.

# Here we describe what data the backend expects from the frontend.
# Here we describe the data structure using the Pydantic library.

from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
	email: EmailStr
	nickname: str

# schema for signing up
class UserCreate(UserBase):
	password: str
	
# schema for the response (we send it to frontend)
class UserResponse(UserBase):
	id: int

class SignupMessage(BaseModel):
	message: str
	user_id: int

class Config:
	from_attributes = True # Allows working with SQLAlchemy models
