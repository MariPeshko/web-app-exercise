# how to run it
# uvicorn uvi:app --reload

# If you see Uvicorn running on http://127.0.0.1:8000, open that link
# in your Windows browser. If you see a JSON response there, congratulations, 
# you've set up a professional workspace!

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from Python 3.12 and WSL2!"}
