# Connection settings

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the URL from the environment (Docker) or use the local one (WSL/Local)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://quiz_admin:secure_pass@localhost:5432/quiz_game_db"
)

# Engine — a "bridge" between Python та Postgres
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal — this is a class for creating new sessions (connections)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — this is the "parent" for all your models in models.py
Base = declarative_base()