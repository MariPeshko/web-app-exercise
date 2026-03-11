from utils import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def chat_with_doc(vectorstore, query, chat_history=[]):
    """
    answers a user query using RAG (Retrieval Augmented Generation).
    
    Args:
        vectorstore: The FAISS vectorstore containing the document chunks.
        query: The user's question string.
        chat_history: Optional list of previous messages (tuples or strings).
    """
    llm = get_llm()

    # Create a retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k":5})

    # Get relevant documents
    docs = retriever.invoke(query)
    context_text = "\n\n".join([doc.page_content for doc in docs])

    # Define prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI tutor assisting a student with a document. "
            "Use the following pieces of context to answer the user's question. "
            "If you don't know the answer based on the context, say so. "
            "Keep answers concise and educational."),
        ("system", "Context:\n{context}"),
        ("system", "Chat History:\n{chat_history}"), 
        ("user", "{question}")
    ])

    # Define chain
    chain = prompt | llm | StrOutputParser()

    # Run the chain
    response = chain.invoke({
        "context": context_text,
        "chat_history": chat_history,
        "question": query
    })

    return response

