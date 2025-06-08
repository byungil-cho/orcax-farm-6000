from fastapi import FastAPI
from app.routes import auth
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_url = os.getenv("MONGO_URL")
client = MongoClient(mongo_url)
db = client["orcax"]

app = FastAPI()

# 라우터 등록
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "OrcaX 감자 농장 서버 가동 중!"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6000, reload=False)
