# PostgreSQL Database

This document explains how the PostgreSQL database is configured and managed within our project using Docker.

## Configuration

-   **Database Name:** `quiz_game_db`
-   **Username:** `quiz_admin`
-   **Password:** `secure_pass`

These values are set in the `.env` file and passed to the database container at runtime.

## How It Works

We use the official `postgres:15-alpine` image directly from Docker Hub, which is defined as the `db` service in our `docker-compose.yml` file. We don't need a separate `Dockerfile` for the database.

The configuration (user, password, database name) is injected into the container using environment variables. Docker Compose reads these values from the `.env` file in the project's root directory.

## Data Persistence

**Yes, your data is persistent.**

The data is stored in a **Docker volume** named `postgres_data`. This is configured in the `docker-compose.yml` file:

```yaml
services:
  db:
    # ...
    volumes: 
      - postgres_data:/var/lib/postgresql/data

volumes: 
   postgres_data:
```

-   `/var/lib/postgresql/data` is the path inside the container where PostgreSQL stores its data.
-   `postgres_data` is the named Docker volume that "maps" to that path.

This means that even if you stop or remove the database container (e.g., with `docker compose down`), the `postgres_data` volume remains on your host machine, managed by Docker. When you run `docker compose up` again, a new container is created, but it re-attaches to the existing volume, and all your previous data is still there.

## Data Locality

**Data is local to each machine.**

The `postgres_data` volume is created and managed by Docker on the specific computer where you run `docker compose up`. It is **not** shared between different developers' machines. Each team member will have their own local copy of the database, which will be populated as they use the application.

---

## Troubleshooting

### Error: "address already in use"

If you see an error like `failed to bind host port 0.0.0.0:5432/tcp: address already in use`, it means another process is already using port `5432` on your machine. This is often a locally installed instance of PostgreSQL.

To fix this, you need to stop the local PostgreSQL service.

**On Ubuntu (Unix):**
```bash
sudo service postgresql stop
```

After stopping the local service, try running `docker compose up` again.
