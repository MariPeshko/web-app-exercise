# Backend - FastAPI

This is the backend module for our project. It uses **Python 3.12**.

## Setup Instructions

**If you don't have Python 3.12, you will need to install it.**

Add the deadsnakes repository (this is the standard for getting new versions of Python on Ubuntu):
```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12 python3.12-venv
```

**Extension for VS Code**

Install this extension:

- `Python` (by `Microsoft`)

## **Сhecklist for launching the project and test files:**

1. **Go to the backend folder**
```bash
cd backend
```

2. **Create a virtual environment**
```bash
python3.12 -m venv .venv
```

3. **Activate the environment**
```bash
source .venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Check version**
```bash
python --version
```

## **Running the Application**

Create a file `uvi.py` if it doesn't exist.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from Python 3.12 and WSL2!"}
```

Run:
```bash
uvicorn uvi:app --reload
```
The API will be available at http://127.0.0.1:8000. Open this link in your Windows browser. If you see a JSON response there, congratulations, you've set up a professional workspace!

Use `CTRL+C` to stop `uvicorn` the server.

-----

### **Configure VS Code**

The project is configured to work with the interpreter located in `backend/.venv`.

After creating the virtual environment (`.venv`), reload the VS Code window (`Ctrl+Shift+P` > "Developer: Reload Window"). VS Code should automatically select the interpreter. You can verify this by checking for "`3.12.x ('.venv')`" in the bottom-right corner. If your VS Code doesn't detect it, please select it manually:

1. Open your project in VS Code.
2. Press `Ctrl + Shift + P` (the command palette will open).
3. Type: `Python: Select Interpreter`.
4. Choose “Use Python from `python.defaultInterpreterPath` setting  `./backend/.venv/bin/python`"
    - If you do not see your venv in the list. Select `Enter interpreter path... -> Find...`. Go to the `backend/.venv/bin/` folder and select the `python` file.
5. Create a file `test.py` in `backend/` folder if it's not there.

```python
# This will only work in Python 3.10+
name: str | None = "FastAPI Developer"
print(f"Hello, {name}!")

import sys
print(f"Current version: {sys.version}")
```

Run it in the `backend/` directory:
```bash
python test.py
```

6. If in the lower right corner of VS Code you see "`3.12.x ('.venv')`", and when you run the `test.py` code in the console, it says `3.12` - congratulations, you have everything set up correctly!

**Automatic environment activation**

Point your Python Interpreter to `backend/.venv/bin/python` to enable automatic environment activation.

1. Create `.vscode` folder in the root of this repository if you don't have it.
2. Create `settings.json` file in that folder.
3. Add the following lines:
```json
{
    "python.defaultInterpreterPath": "./backend/.venv/bin/python",
    "python.terminal.activateEnvInCurrentTerminal": true,
    "python.analysis.extraPaths": ["./backend"]
}
```

### If the environment does not activate

Hint: There is a peculiarity in VS Code: it does not activate venv in the terminal until you **open at least one .py file**. Try opening any file in backend/ and then create a new terminal.