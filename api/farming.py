# /api/farming.py
from fastapi import APIRouter
from db.mongo import users
from datetime import datetime

router = APIRouter()

@router.post("/farm/buy_seed")
async def buy_seed(payload: dict):
    user_id = payload["user_id"]
    seed_type = payload["seed_type"]
    cost = 100

    user = users.find_one({"_id": user_id})
    if not user:
        return {"message": "사용자 없음"}

    if user.get("token", 0) < cost:
        return {"message": "토큰 부족"}

    users.update_one({"_id": user_id}, {
        "$inc": {
            f"inventory.{seed_type}_seed": 1,
            "token": -cost
        }
    })
    return {"message": f"{seed_type} 씨앗 구매 완료!"}

@router.post("/farm/plant")
async def plant_crop(payload: dict):
    user_id = payload["user_id"]
    crop_type = payload["crop_type"]
    now = datetime.utcnow()

    user = users.find_one({"_id": user_id})
    if not user:
        return {"message": "사용자 없음"}

    seed_key = f"{crop_type}_seed"
    if user["inventory"].get(seed_key, 0) <= 0:
        return {"message": f"{crop_type} 씨앗 부족"}

    if user.get("field", {}).get("crop"):
        return {"message": "이미 작물이 심어져 있음"}

    users.update_one({"_id": user_id}, {
        "$inc": {seed_key: -1},
        "$set": {
            "field": {
                "crop": crop_type,
                "planted_at": now
            }
        }
    })
    return {"message": f"{crop_type} 심기 완료"}

@router.post("/farm/harvest")
async def harvest_crop(payload: dict):
    user_id = payload["user_id"]
    user = users.find_one({"_id": user_id})
    if not user or "field" not in user or "crop" not in user["field"]:
        return {"message": "심어진 작물이 없습니다."}

    crop = user["field"]["crop"]
    planted_time = user["field"]["planted_at"]
    now = datetime.utcnow()

    if isinstance(planted_time, str):
        planted_time = datetime.fromisoformat(planted_time.replace("Z", "+00:00"))

    elapsed = (now - planted_time).total_seconds()
    if elapsed < 180:
        return {"message": f"아직 수확할 수 없습니다. ({int(180 - elapsed)}초 남음)"}

    users.update_one({"_id": user_id}, {
        "$inc": {f"inventory.{crop}": 1},
        "$set": {"field": {}}
    })

    return {"message": f"{crop} 수확 완료!"}
