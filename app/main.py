from fastapi import FastAPI
from app.routes import auth
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB 연결
mongo_url = os.getenv("MONGO_URL")

if not mongo_url:
    print("❌ MONGO_URL 환경변수가 설정되지 않았습니다.")
else:
    try:
        client = MongoClient(mongo_url)
        db = client["orcax"]
        print("✅ MongoDB 연결 성공")
    except Exception as e:
        print("❌ MongoDB 연결 실패:", e)

app = FastAPI()

# 라우터 등록
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "OrcaX 감자 농장 서버 가동 중!"}
