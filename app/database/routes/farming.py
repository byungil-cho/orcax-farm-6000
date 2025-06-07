from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection
from datetime import datetime, timedelta
from pymongo import MongoClient

router = APIRouter()

client = MongoClient()
db = client["orcax_farm"]
farming_collection = db["farmings"]

class FarmingRequest(BaseModel):
    nickname: str
    seed_item: str
    seed_quantity: int
    output_item: str
    output_quantity: int
    farming_time_sec: int

@router.post("/farm/plant")
def plant_crop(req: FarmingRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다")

    inventory = user.get("inventory", {})
    if inventory.get(req.seed_item, 0) < req.seed_quantity:
        raise HTTPException(status_code=400, detail="씨앗이 부족합니다")

    inventory[req.seed_item] -= req.seed_quantity
    users_collection.update_one({"nickname": req.nickname}, {"$set": {"inventory": inventory}})

    farming = {
        "nickname": req.nickname,
        "seed_item": req.seed_item,
        "seed_quantity": req.seed_quantity,
        "output_item": req.output_item,
        "output_quantity": req.output_quantity,
        "planted_at": datetime.utcnow(),
        "farming_time_sec": req.farming_time_sec,
        "status": "growing"
    }
    farming_collection.insert_one(farming)

    return {"message": "씨앗 심기 완료", "farming_time_sec": req.farming_time_sec}

@router.get("/farm/status/{nickname}")
def check_farming_status(nickname: str):
    now = datetime.utcnow()
    updated = []

    for doc in farming_collection.find({"nickname": nickname, "status": "growing"}):
        planted_at = doc["planted_at"]
        duration = timedelta(seconds=doc["farming_time_sec"])
        if now >= planted_at + duration:
            user = users_collection.find_one({"nickname": nickname})
            inventory = user.get("inventory", {})
            inventory[doc["output_item"]] = inventory.get(doc["output_item"], 0) + doc["output_quantity"]

            users_collection.update_one({"nickname": nickname}, {"$set": {"inventory": inventory}})
            farming_collection.update_one({"_id": doc["_id"]}, {"$set": {"status": "harvested"}})
            updated.append(str(doc["_id"]))

    return {"message": "수확 상태 갱신됨", "harvested": updated}

@router.get("/farm/records/{nickname}")
def get_farming_records(nickname: str):
    docs = farming_collection.find({"nickname": nickname}).sort("planted_at", -1)
    result = []
    for d in docs:
        d["_id"] = str(d["_id"])
        d["planted_at"] = d["planted_at"].isoformat()
        result.append(d)
    return result
