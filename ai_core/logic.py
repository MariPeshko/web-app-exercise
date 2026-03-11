from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from utils import get_llm
from models import TriviaQuiz, AnswerValidation


def generate_questions(vectorstore, num_questions=10):
    """
    Selects random chunks from the document and generates questions.
    """
    llm = get_llm()

    # Use the passed vectorstore
    retriever = vectorstore.as_retriever(search_kwargs={"k": num_questions})
    docs = retriever.invoke("important facts and concepts")
    context_text = "\n\n".join([doc.page_content for doc in docs])

    # Prompt for JSON generation
    parser = JsonOutputParser(pydantic_object=TriviaQuiz)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a trivia master. Generate {num_questions} trivia questions based STRICTLY on the provided text. "
        "Provide the output as a JSON object with a list of questions, where each item has a 'question', 'options' (list of 4 choices), 'answer', and 'context' fields. "
        "Keep answers concise."),
        ("user", "Text:\n{context}\n\n{format_instructions}")
    ])

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "num_questions": num_questions,
            "context": context_text,
            "format_instructions": parser.get_format_instructions()
        })

        # JsonOutputParser may return a dict or a parsed model depending on version/config.
        if isinstance(result, dict):
            questions = result.get("questions", [])
        else:
            questions = getattr(result, "questions", [])

        if not isinstance(questions, list):
            raise ValueError("Invalid questions payload: expected a list")

        return questions
    except Exception as e:
        raise ValueError(f"Error generating questions: {e}")

def validate_answer(user_answer, correct_answer, context):
    """
    Uses LLM to check if the user's answer is semantically correct.
    """
    llm = get_llm()
    parser = JsonOutputParser(pydantic_object=AnswerValidation)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a lenient grade-school teacher grading a quiz. "
        "Determine if the student's USER_ANSWER is factually correct based on the REFERENCE_ANSWER and CONTEXT. "
        "Ignore typos, capitalization, and minor grammatical errors. "
        "If the user's answer contains the core correct value or concept, mark it as correct, even if it is incomplete or missing units (e.g., '3' instead of '3 years'). "
        "Be generous. If the intent is clear, accept it. "
        "Respond with a JSON object: {{'is_correct': boolean, 'explanation': string}}."),
        ("user", "CONTEXT: {context}\nREFERENCE_ANSWER: {correct_answer}\nUSER_ANSWER: {user_answer}\n\n{format_instructions}")
    ])

    chain = prompt | llm | parser

    try:
        response = chain.invoke({
            "context": context,
            "correct_answer": correct_answer,
            "user_answer": user_answer,
            "format_instructions": parser.get_format_instructions()
        })

        if isinstance(response, dict):
            is_correct = bool(response.get("is_correct", False))
            explanation = str(response.get("explanation", "")).strip()
        else:
            is_correct = bool(getattr(response, "is_correct", False))
            explanation = str(getattr(response, "explanation", "")).strip()

        return {"is_correct": is_correct, "explanation": explanation}
    except Exception as e:
        # Fallback to fuzzy string matching if LLM fails
        u_ans = user_answer.lower().strip()
        c_ans = correct_answer.lower().strip()

        # check for exact match or containment
        is_correct = (u_ans == c_ans) or (u_ans in c_ans and len(u_ans) > 2) or (c_ans in u_ans)

        explanation = f"Fallback check (Error: {str(e)}). Expected: {correct_answer}"
        return {"is_correct": is_correct, "explanation": explanation}