Main database of this application is PostgreSQL.

Name of database: quiz_game_db
User of database: quiz_admin

We don't need a Dockerfile for PostreSQL, we use the official image directly in `docker-compose.yml`. The official `postgres` image on Docker Hub is already configured and ready to go. We change almost everything (user, password, database name) using environment variables in the `docker-compose.yml` file.