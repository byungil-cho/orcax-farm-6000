from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection

router = APIRouter()

class InventoryRequest(BaseModel):
    nickname: str

@router.post("/view")
def view_inventory(req: InventoryRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="해당 유저를 찾을 수 없습니다")

    inventory = user.get("inventory", {})

    return {
        "message": "보관소 정보 조회 성공",
        "inventory": inventory
    }
