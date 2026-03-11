from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from utils import process_pdf, load_vectorstore
from logic import generate_questions, validate_answer
from chat import chat_with_doc

app = FastAPI(title="AI Trivia Game")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GameRequest(BaseModel):
    game_id: str
    num_questions: int = 10

class ValidateRequest(BaseModel):
    user_answer: str
    correct_answer: str
    context: str

class ChatRequest(BaseModel):
    game_id: str
    message: str
    history: List[str] = []

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/upload")
async def upload_document(game_id: str, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        
        import io
        file_obj = io.BytesIO(file_bytes)

        await run_in_threadpool(process_pdf, file_obj, game_id)
        return {"message": "File processed and game initialized", "game_id": game_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-questions")
async def generate_endpoint(req: GameRequest):
    vectorstore = load_vectorstore(req.game_id)
    if not vectorstore:
        raise HTTPException(status_code=404, detail="Game not found")

    questions = generate_questions(vectorstore, req.num_questions)
    return {"questions": questions}

@app.post("/validate-answer")
async def validate_endpoint(req: ValidateRequest):
    result = validate_answer(req.user_answer, req.correct_answer, req.context)
    return result

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    vectorstore = load_vectorstore(req.game_id)
    if not vectorstore:
        raise HTTPException(status_code=404, detail="Game not found")

    response = chat_with_doc(vectorstore, req.message, req.history)
    return {"response": response}

