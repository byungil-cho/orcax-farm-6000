from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from pymongo import MongoClient
from collections import defaultdict

router = APIRouter()

client = MongoClient()
db = client["orcax_farm"]
market_collection = db["market_listings"]
history_collection = db["market_history"]
farming_collection = db["farmings"]

class MarketListRequest(BaseModel):
    nickname: str
    item: str
    quantity: int
    price_per_item: float

@router.post("/list")
def list_item(req: MarketListRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="해당 유저를 찾을 수 없습니다")

    inventory = user.get("inventory", {})
    if inventory.get(req.item, 0) < req.quantity:
        raise HTTPException(status_code=400, detail="판매할 아이템이 부족합니다")

    inventory[req.item] -= req.quantity
    users_collection.update_one({"nickname": req.nickname}, {"$set": {"inventory": inventory}})

    listing = {
        "nickname": req.nickname,
        "item": req.item,
        "quantity": req.quantity,
        "price_per_item": req.price_per_item,
        "listed_at": datetime.utcnow(),
        "status": "active"
    }
    result = market_collection.insert_one(listing)

    return {"message": "아이템이 경매장에 등록되었습니다", "listing_id": str(result.inserted_id)}

class MarketBuyRequest(BaseModel):
    buyer_nickname: str
    listing_id: str

@router.post("/buy")
def buy_item(req: MarketBuyRequest):
    listing = market_collection.find_one({"_id": ObjectId(req.listing_id), "status": "active"})
    if not listing:
        raise HTTPException(status_code=404, detail="유효하지 않거나 판매 완료된 항목입니다")

    seller = listing["nickname"]
    item = listing["item"]
    quantity = listing["quantity"]
    price_per_item = listing["price_per_item"]
    total_price = quantity * price_per_item

    buyer = users_collection.find_one({"nickname": req.buyer_nickname})
    if not buyer:
        raise HTTPException(status_code=404, detail="구매자 유저를 찾을 수 없습니다")

    if buyer.get("orcx", 0) < total_price:
        raise HTTPException(status_code=400, detail="ORCX 토큰이 부족합니다")

    buyer_inventory = buyer.get("inventory", {})
    buyer_inventory[item] = buyer_inventory.get(item, 0) + quantity

    users_collection.update_one(
        {"nickname": req.buyer_nickname},
        {"$set": {"orcx": buyer["orcx"] - total_price, "inventory": buyer_inventory}}
    )

    seller_user = users_collection.find_one({"nickname": seller})
    users_collection.update_one(
        {"nickname": seller},
        {"$set": {"orcx": seller_user.get("orcx", 0) + total_price}}
    )

    market_collection.update_one(
        {"_id": ObjectId(req.listing_id)},
        {"$set": {"status": "sold", "sold_at": datetime.utcnow()}}
    )

    history_collection.insert_one({
        "buyer": req.buyer_nickname,
        "seller": seller,
        "item": item,
        "quantity": quantity,
        "price": total_price,
        "timestamp": datetime.utcnow()
    })

    return {
        "message": "구매 완료!",
        "item": item,
        "quantity": quantity,
        "total_price": total_price
    }

class ProcessingRequest(BaseModel):
    nickname: str
    input_item: str
    input_quantity: int
    output_item: str
    output_quantity: int
    fuel_required: int
    processing_time_sec: int

@router.post("/process")
def process_items(req: ProcessingRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="유저 정보를 찾을 수 없습니다")

    inventory = user.get("inventory", {})

    if inventory.get(req.input_item, 0) < req.input_quantity:
        raise HTTPException(status_code=400, detail="재료가 부족합니다")
    if inventory.get("fuel", 0) < req.fuel_required:
        raise HTTPException(status_code=400, detail="연료가 부족합니다")

    inventory[req.input_item] -= req.input_quantity
    inventory["fuel"] -= req.fuel_required
    inventory[req.output_item] = inventory.get(req.output_item, 0) + req.output_quantity

    users_collection.update_one({"nickname": req.nickname}, {"$set": {"inventory": inventory}})

    return {
        "message": f"가공 완료 - {req.processing_time_sec}초 소요됨",
        "input_item": req.input_item,
        "output_item": req.output_item,
        "output_quantity": req.output_quantity
    }

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
