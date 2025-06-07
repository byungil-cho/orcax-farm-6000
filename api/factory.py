# /api/factory.py
from fastapi import APIRouter
from db.mongo import users, db
from datetime import datetime

router = APIRouter()
queue = db["processing_queue"]

@router.post("/factory/queue")
async def add_to_queue(payload: dict):
    user_id = payload["user_id"]
    item_type = payload["item_type"]
    now = datetime.utcnow()

    user = users.find_one({"_id": user_id})
    inv = user.get("inventory", {})

    if inv.get(item_type, 0) < 1 or inv.get("fuel", 0) < 1:
        return {"message": "재료 또는 연료 부족"}

    existing = queue.find_one({"user_id": user_id, "item_type": item_type})
    if existing:
        return {"message": "이미 가공 대기 중입니다."}

    queue.insert_one({
        "user_id": user_id,
        "item_type": item_type,
        "requested_at": now
    })

    return {"message": f"{item_type} 가공 대기열에 등록됨"}
