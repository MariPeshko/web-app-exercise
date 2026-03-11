## interact with the database through Docker
## TO LOGIN as quiz_admin

```bash
docker exec -it db psql -U quiz_admin -d quiz_game_db
```

- `psql`: The command to open the PostgreSQL interactive terminal.
- `-U quiz_admin`: Specifies the User you want to log in as.
- `-d quiz_game_db`: Specifies the database you want to connect to.

Check tables:
```SQL
# quiz_game_db=#
SELECT * FROM users;
```

To list all databases in PostgreSQL, you can use the psql meta-command:
```PSQL
\l
```
or standard SQL query:
```SQL
SELECT datname FROM pg_database;
```

To list all tables in the current database, use the psql meta-command:
```PSQL
\dt
```

If you want to use a standard SQL query instead of a psql meta-command, you can run:
```SQL
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Clear table:
```SQL
TRUNCATE TABLE users RESTART IDENTITY;
```

## for the local PostgreSQL: from Terminal

To connect to a local PostgreSQL instance, you can use the following commands:

```bash
psql -U quiz_admin -d quiz_game_db -h localhost
```
This command connects as the `quiz_admin` user to the `quiz_game_db` database on `localhost`. You will be prompted for the password.

Alternatively, you can connect as the `postgres` superuser:
```bash
sudo -i -u postgres psql -d quiz_game_db
```

**Check a socket (port)**
```bash
sudo ss -tlpn | grep 5432
```