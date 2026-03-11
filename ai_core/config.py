import os
from dotenv import load_dotenv


# Load env data
load_dotenv()
os.environ.setdefault("USER_AGENT", "RAG-Trivia-Game")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please add it to your .env file.")