from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongo import users_collection

router = APIRouter()

class ProcessRequest(BaseModel):
    nickname: str
    item: str  # 예: "potato"
    quantity: int  # 몇 개 가공할지

@router.post("/process")
def process_item(req: ProcessRequest):
    user = users_collection.find_one({"nickname": req.nickname})
    if not user:
        raise HTTPException(status_code=404, detail="해당 유저를 찾을 수 없습니다")

    inventory = user.get("inventory", {})

    if inventory.get(req.item, 0) < req.quantity:
        raise HTTPException(status_code=400, detail="가공할 자원이 부족합니다")

    # 감자 ➜ 감자칩 예시
    if req.item == "potato":
        product = "chips"
        produced_quantity = req.quantity  # 1:1 변환
    else:
        raise HTTPException(status_code=400, detail="가공할 수 없는 아이템입니다")

    # 인벤토리 업데이트
    inventory[req.item] -= req.quantity
    inventory[product] = inventory.get(product, 0) + produced_quantity

    users_collection.update_one(
        {"nickname": req.nickname},
        {"$set": {"inventory": inventory}}
    )

    return {
        "message": f"{req.item} {req.quantity}개를 {product} {produced_quantity}개로 가공 완료!",
        "inventory": inventory
    }
