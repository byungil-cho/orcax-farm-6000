# app.py (or main.py)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import farming, user  # <- 여기에 폴더 내 모듈을 import

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(farming.router)
app.include_router(user.router)

# 기본 확인용 엔드포인트
@app.get("/")
def read_root():
    return {"message": "OrcaX Farm Server is Running"}
