# main.py
from fastapi import FastAPI

app = FastAPI()
import os

port = int(os.environ.get("PORT", 10000))

@app.get("/")
def root():
    return {"message": "OrcaX 6000 backend running."}
