from fastapi import FastAPI
from app.routes import auth

app = FastAPI()

# 라우터 등록
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "OrcaX 감자 농장 서버 가동 중!"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=6000, reload=False)
