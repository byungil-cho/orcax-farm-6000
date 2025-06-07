from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from app.database.mongo import users_collection

router = APIRouter()

class RegisterRequest(BaseModel):
    nickname: str
    farm_name: str

@router.post("/register")
def register_user(req: RegisterRequest):
    existing_user = users_collection.find_one({"nickname": req.nickname})
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다")

    user_id = str(uuid4())

    user_data = {
        "user_id": user_id,
        "nickname": req.nickname,
        "farm_name": req.farm_name,
        "orcx": 5,
        "water": 10,
        "fertilizer": 10,
        "farm": {},
        "inventory": {},
    }

    users_collection.insert_one(user_data)

    return {
        "message": "농장 등록 완료!",
        "user_id": user_id,
        "orcx": user_data["orcx"],
        "water": user_data["water"],
        "fertilizer": user_data["fertilizer"]
    }
