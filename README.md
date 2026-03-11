# StudAI
The Game to study it all. Challenge yourself and others. Learn anything anytime.

## How to run a project (it's not done yet)

```bash
docker compose up --build
```

In case of any error and its solving, it is recommended:
```bash
docker compose down
# warning: it deletes all unused networks
docker network prune
# and then again
docker compose up --build
```

To see what's happening "under the hood" of backend during a request, view the logs in real time:
```bash
docker compose logs -f backend
```
