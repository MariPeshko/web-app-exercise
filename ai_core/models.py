from pydantic import BaseModel, Field
from typing import List

class TriviaQuestion(BaseModel):
    question: str = Field(description="The trivia question text")
    options: List[str] = Field(description="List of 4 possible answers including the correct one")
    answer: str = Field(description="The correct answer to the question")
    context: str = Field(description="The specific fact or text snippet the question is based on")

class TriviaQuiz(BaseModel):
    questions: List[TriviaQuestion] = Field(description="A list of trivia questions")

class AnswerValidation(BaseModel):
    is_correct: bool = Field(description="True if the user's answer conveys the same meaning as the reference answer, even if phrased differently. False otherwise.")
    explanation: str = Field(description="A brief explanation of why the answer is correct or incorrect.")
