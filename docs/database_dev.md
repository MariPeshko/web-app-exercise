## TO LOGIN as quiz_admin

```bash
psql -U quiz_admin -d quiz_game_db -h localhost
```

- `psql`: The command to open the PostgreSQL interactive terminal.
- `-U quiz_admin`: Specifies the User you want to log in as.
- `-d quiz_game_db`: Specifies the database you want to connect to.
- `-h localhost`: Tells psql to connect to the server via a network socket on localhost, which will prompt you for the password you set for quiz_admin.

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

## Check tables from Terminal

```bash
sudo -i -u postgres psql -d quiz_game_db
```
```SQL
quiz_game_db=# SELECT * FROM users;
```

Clear table:
```SQL
TRUNCATE TABLE users RESTART IDENTITY;
```