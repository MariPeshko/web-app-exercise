# How to Move Rootless Docker Storage to Local Goinfre at 42

This fixes the "no space left on device" error when building large Docker images (like AI/RAG projects) by pointing Docker to the 120GB+ `/goinfre` partition instead of your limited `$HOME` directly.

**NOTE:** `/sgoinfre` is NFS (network storage) and causes permission/UID mapping errors with rootless Docker. Use `/goinfre` (local storage) instead. Run these commands line by line:

### 1. Create a directory for Docker on local goinfre
```bash
mkdir -p /goinfre/$(whoami)/.docker_data
```

### 2. Create the Docker daemon config directory
```bash
mkdir -p ~/.config/docker
```

### 3. Create the configuration file mapping the new storage location
```bash
cat > ~/.config/docker/daemon.json << 'EOF'
{
  "data-root": "/goinfre/spitul/.docker_data",
  "registry-mirrors": ["https://nexus.42berlin.de:5000"]
}
EOF
```
*(Optionally change `spitul` in the path above to `$(whoami)` before running)*

### 4. Restart the user-level rootless Docker daemon
```bash
systemctl --user restart docker
```

### 5. Verify the new location is active
```bash
sleep 2 && docker info | grep "Docker Root Dir"
```

**Expected Output:**
> `Docker Root Dir: /goinfre/your_username/.docker_data`

### 6. Verify you have space
```bash
df -h /goinfre/$(whoami)/.docker_data
```

You are now ready to run `docker compose up --build` with all the space you need!





---

# Some useful commands

```bash
docker system prune -a --volumes
docker system prune -a
```

check available disk space
```bash
df -h
```

# Check project size (should be small)
```bash
du -sh ~/git_trans --exclude=node_modules --exclude=.next
```
Should be < 200MB

# Check Docker size (should be in goinfre)
```bash
du -sh ~/goinfre/docker-data
```
