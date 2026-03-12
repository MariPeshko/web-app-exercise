## SQLAlchemy explainer

To connect **FastAPI** to **PostgreSQL** in a Docker Compose environment, the best approach is to use **SQLAlchemy** (an **ORM** — a library that allows you to work with a database through Python objects) and the **asyncpg** driver for asynchronous work.

**Pydantic** is a popular Python library for data validation and settings management, using Python type hints to ensure data conforms to expected structures at runtime.

## How does it work (SQLAlchemy + Pydantic)

1. The client (frontend) sends `JSON { "email": "...", "nickname": "...", "password": "..." }` to FastAPI.

2. FastAPI receives this data via a **Pydantic schema** (`schemas.py`) which checks if all the fields are in place. Is the JSON correct?

	The `main.py` "sees" `schemas.py` using this line `import models, schemas`.

	The `signup` function has an argument `user_data: schemas.UserCreate`, and so Python knows to look in the `schemas.py` file and find the `class UserCreate` there.

	Error handling: If the user sends a simple number instead of an email, FastAPI will automatically throw a `422 (Unprocessable Entity)` error before the code even reaches the database.

3. **SQLAlchemy** converts this Python data into an SQL command: `INSERT INTO users (email, nickname, ...) VALUES (...)`.

4. Through the Docker network, this command is sent to a container named `db`.

5. **PostgreSQL** executes the query and stores the data on Docker Volume.

---

## File schemas.py

Here we describe what data the backend expects from the frontend.

## File models.py

Here we tell SQLAlchemy what the table looks like in Postgres.

## How to connect backend to database

