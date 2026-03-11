## SQLModel 

**SQLModel** is a library for interacting with SQL databases from Python code, with Python objects. SQLModel is based on Python type annotations, and powered by **Pydantic** and **SQLAlchemy**.

## SQLAlchemy explainer

To connect **FastAPI** to **PostgreSQL** in a Docker Compose environment, the best approach is to use **SQLAlchemy** (ORM).

**SQLAlchemy** is the Python SQL toolkit and Object Relational Mapper that gives application developers the full power and flexibility of SQL.

**Pydantic** is a popular Python library for data validation and settings management, using Python type hints to ensure data conforms to expected structures at runtime.

An **ORM** — a library that allows you to work with a database through Python objects

## How does it work in our backend server

This is a general overview of how a user signup request is processed:

1.  **Client Request**: The client (e.g., a web browser) sends a `POST` request with user data (email, nickname, password) in JSON format to a specific API endpoint (like `/api/auth/signup`).

2.  **API Endpoint & Data Validation**:
    *   FastAPI receives the request at the designated endpoint.
    *   It uses a Pydantic/SQLModel model (e.g., `UserCreate`) to automatically parse and validate the incoming JSON. If the data is malformed (like an invalid email address), FastAPI returns an error.

3.  **Database Session**: The endpoint function uses a dependency to get a database session. This session manages the connection to the database for this specific request.

4.  **Business Logic**:
    *   The code checks if a user with the same email or nickname already exists in the database to prevent duplicates.
    *   It securely hashes the user's plain-text password. **Never store plain-text passwords.**

5.  **Object Creation**: An ORM model instance (e.g., `User`) is created using the validated data.

6.  **Saving to Database**:
    *   The new user object is added to the database session (staged for saving).
    *   The session is "committed," which tells the ORM (SQLAlchemy) to generate the appropriate `INSERT` SQL command and execute it, saving the new user to the database.

7.  **HTTP Response**: The server sends a response back to the client, typically a JSON object confirming that the user was created successfully.

