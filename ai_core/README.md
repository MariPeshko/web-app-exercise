# StudAI
The Game to study it all. Challenge yourself and others. Learn anything anytime.

## AI Core Microservice

This service handles the intelligence logic: RAG (Reading documents), Question Generation, Answer Validation, and Chat.

### 🚀 Setup & Run (Local)

1.  **Navigate to the folder:**
    ```bash
    cd ai_core
    ```
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Configure Environment:**
    Create a `.env` file in `ai_core/` with your API key:
    ```ini
    OPENAI_API_KEY=sk-your-key-here
    ```
4.  **Run the Server:**
    ```bash
    uvicorn main:app --reload
    ```
5.  **View Documentation:**
    Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to test the endpoints.

### 🐳 Run with Docker

1.  **Build the image:**
    ```bash
    docker build -t studai-core ./ai_core
    ```
2.  **Run the container:**
    ```bash
    docker run -p 8000:8000 --env-file ai_core/.env studai-core
    ```

### 📡 API Endpoints

-   **POST /upload**: Upload a PDF file + `game_id` to initialize the game data.
-   **POST /generate-questions**: Generate a quiz for a specific `game_id`.
-   **POST /validate-answer**: Check if an open-ended answer is correct.
-   **POST /chat**: Chat with the AI about the uploaded document.
