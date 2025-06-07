from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection

router = APIRouter()

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
