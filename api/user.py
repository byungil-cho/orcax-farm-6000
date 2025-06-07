# /api/user.py
from fastapi import APIRouter
from db.mongo import users

router = APIRouter()

@router.get("/user/{user_id}")
async def get_user(user_id: str):
    user = users.find_one({"_id": user_id})
    if not user:
        return {"message": "사용자 없음"}
    return {
        "token": user.get("token", 0),
        "inventory": user.get("inventory", {}),
        "field": user.get("field", {})
    }
