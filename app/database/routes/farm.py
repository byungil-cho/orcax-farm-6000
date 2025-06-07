from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection

router = APIRouter()

class FarmStartRequest(BaseModel):
    nickname: str

@router.post("/start")
def start_farming(req: FarmStartRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="해당 유저를 찾을 수 없습니다")

    if user.get("water", 0) < 1 or user.get("fertilizer", 0) < 1:
        raise HTTPException(status_code=400, detail="물과 거름이 부족합니다")

    new_water = user["water"] - 1
    new_fertilizer = user["fertilizer"] - 1

    farm = user.get("farm", {})
    farm["potato"] = farm.get("potato", 0) + 1

    users_collection.update_one(
        {"nickname": req.nickname},
        {"$set": {"water": new_water, "fertilizer": new_fertilizer, "farm": farm}}
    )

    return {
        "message": "감자밭 농사 시작 완료!",
        "potato_count": farm["potato"],
        "water": new_water,
        "fertilizer": new_fertilizer
    }

@router.post("/harvest")
def harvest_potatoes(req: FarmStartRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="해당 유저를 찾을 수 없습니다")

    farm = user.get("farm", {})
    inventory = user.get("inventory", {})

    potatoes_in_farm = farm.get("potato", 0)
    if potatoes_in_farm < 1:
        raise HTTPException(status_code=400, detail="수확할 감자가 없습니다")

    # 수확 처리
    inventory["potato"] = inventory.get("potato", 0) + potatoes_in_farm
    farm["potato"] = 0

    users_collection.update_one(
        {"nickname": req.nickname},
        {"$set": {"inventory": inventory, "farm": farm}}
    )

    return {
        "message": f"감자 {potatoes_in_farm}개 수확 완료!",
        "inventory_potato": inventory["potato"]
    }
