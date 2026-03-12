## 1. Install PostgreSQL on WSL (Ubuntu)

Update your package list:
```bash
sudo apt update
```

Install Postgres and its common tools:
```bash
sudo apt install postgresql postgresql-contrib
```

**Start the Database Service**
WSL doesn't always start services automatically like a full Linux OS does. You have to kickstart it:
```bash
sudo service postgresql start
```

## 2. Accessing the Postgres "Superuser"

By default, Postgres creates a Linux user named postgres. To enter the database console for the first time, you "become" that user:
```bash
sudo -i -u postgres psql
```
You should see a prompt that looks like `postgres=#`. Congratulations, you are inside the database! Type `\q` and hit Enter to exit.

## 3. The "Pro" Setup (Create your Project User)

It is bad practice to use the postgres superuser for your web app. Create a specific user and database for your Quiz Game.

1. While inside the `psql` prompt (`sudo -i -u postgres psql`), run these commands:
```SQL
CREATE USER quiz_admin WITH PASSWORD 'secure_pass';
```

2. Create the Database:
```SQL
CREATE DATABASE quiz_game_db OWNER quiz_admin;
```

3. Exit. Type `\q`

## 4. Connecting from Windows (Optional but Recommended)
Even though Postgres is inside WSL, you might want to see your data visually using a Windows tool like **pgAdmin 4** or **DBeaver**.

- Host: localhost
- Port: 5432
- Maintenance DB: quiz_game_db
- User: quiz_admin
- Password: (The one you set above)

----

[!TIP]
**WSL Network Quirk**: If you restart your computer, you will likely need to run sudo service postgresql start again in your WSL terminal before your web app can connect.

```bash
sudo service postgresql start
sudo service postgresql status
```

To get a definitive status, you should check the status of the specific PostgreSQL cluster. The command for this is usually:
```bash
pg_lsclusters
```
If the status is online, your database is running and ready for connections.


## Configure DATABASE_URL for local operation

The only thing that binds your application to Docker (or your local machine) is the `DATABASE_URL` (connection string).

In Docker networking we use the service name 'db'. To run locally we need to replace it with 'localhost' or '127.0.0.1'.

1. In your configuration file (.env), change the connection string:

For Docker: `postgresql://quiz_admin:secure_pass@db:5432/quiz_game_db`

For local: `postgresql://quiz_admin:secure_pass@localhost:5432/quiz_game_db`

2. Make sure Postgres is running

3. Install the necessary drivers

In order for Python to communicate with PostgreSQL, you need a driver.
The most popular one is `psycopg2`, or, if you are using `SQLModel/SQLAlchemy` asynchronously `asyncpg`.
Install it in your virtual environment:
```bash
pip install psycopg2-binary
pip install asyncpg
```

4. Make sure SQLModel/SQLAlchemy creates tables. This block must be in the backend code.
5. Now you can launch the backend.

## Why might Swagger (`/docs`) throw an error?

If you log into Swagger and try to `POST /signup` and it gives an `"Internal Server Error"`, check the console where uvicorn is running. The most common reasons are:

1. Password authentication failed: You made a mistake in the password or username that you created in `psql`.
2. Connection refused: Postgres is not running or listening on the wrong port.
3. Database "`quiz_game_db`" does not exist: You forgot to create the database itself with the `CREATE DATABASE quiz_game_db;` command inside Postgres.
