# api/plans.py
from fastapi import APIRouter, Request
from pydantic import BaseModel
from datetime import datetime
from db.mongo import get_db

router = APIRouter()

class Plan(BaseModel):
    seedPrice: float
    fuelPrice: float
    potatoYield: int
    potatoPrice: float
    chipsInput: int
    chipsPrice: float

@router.post("/api/plans/save")
async def save_plan(plan: Plan, request: Request):
    db = get_db()
    user_id = request.headers.get("X-User-ID", "anonymous")

    plan_dict = plan.dict()
    plan_dict["user_id"] = user_id
    plan_dict["timestamp"] = datetime.utcnow()

    result = db.profit_plans.insert_one(plan_dict)
    return {"message": "계획 저장됨", "id": str(result.inserted_id)}
