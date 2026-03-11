import os
import tempfile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from config import OPENAI_API_KEY
from pypdf import PdfReader

DB_FOLDER = "data"
os.makedirs(DB_FOLDER, exist_ok=True)

def save_vectorstore(vectorstore, game_id):
    path = os.path.join(DB_FOLDER, game_id)
    vectorstore.save_local(path)
    return path

def load_vectorstore(game_id):
    path = os.path.join(DB_FOLDER, game_id)
    if not os.path.exists(path):
        return None
    embeddings = get_embeddings()
    return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)

def get_llm():
    return ChatOpenAI(
        model="gpt-4o",
        api_key=OPENAI_API_KEY,
        temperature=0.7,
    )

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

def process_pdf(uploaded_file, game_id):
    """
    Saves uploaded file to temp, loads it and splits it.
    Returns the list of document chunks and the FAISS vector store.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        tmp_path = tmp_file.name

    try:
        # check page count
        reader = PdfReader(tmp_path)
        if (len(reader.pages) > 200):
            raise ValueError(f"Document has {len(reader.pages)} pages. Please upload a document with 200 pages or fewer.")

        loader = PyPDFLoader(tmp_path)
        docs = loader.load()

        # Split Documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # Create vector store
        embeddings = get_embeddings()
        vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
        save_vectorstore(vectorstore, game_id)

        return vectorstore
    except Exception as e:
        raise ValueError(f"Error processing PDF: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)