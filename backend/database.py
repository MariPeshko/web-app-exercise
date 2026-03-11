# Connection settings

import os
from sqlmodel import create_engine
from sqlmodel import SQLModel
from sqlalchemy.orm import sessionmaker

# import our files
import models # noqa: F401 - This is necessary to register the models with SQLModel

# Get the URL from the environment (Docker) or use the local one (WSL/Local)
DATABASE_URL = os.getenv(
	"DATABASE_URL", 
	"postgresql://quiz_admin:secure_pass@localhost:5432/quiz_game_db"
)

# Engine — SQLAlchemy Engine - an object that handles the communication with the database
# TODO: delete echo=True for production
engine = create_engine(DATABASE_URL, echo=True)

# Create tables in the database
def create_db_and_tables():
	SQLModel.metadata.create_all(bind=engine)

# Create a session factory
# SessionLocal — this is a class for creating new sessions (connections)
SessionLocal = sessionmaker(bind=engine)

# Function to get database session
# It creates a short-lived database session for a single API request and
# ensures that the session is always closed afterward.
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
