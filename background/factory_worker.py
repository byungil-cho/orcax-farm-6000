# /background/factory_worker.py
import asyncio
from datetime import datetime
from db.mongo import users, db

queue = db["processing_queue"]
INTERVAL = 5
DELAY = 10

product_map = {
    "potato": "chips",
    "barley": "barley_tea"
}

async def process_queue():
    while True:
        now = datetime.utcnow()
        tasks = list(queue.find({}))
        for task in tasks:
            if (now - task["requested_at"]).total_seconds() >= DELAY:
                user_id = task["user_id"]
                item = task["item_type"]
                product = product_map.get(item)

                users.update_one({"_id": user_id}, {
                    "$inc": {
                        f"inventory.{item}": -1,
                        "inventory.fuel": -1,
                        f"inventory.{product}": 1
                    }
                })
                queue.delete_one({"_id": task["_id"]})

        await asyncio.sleep(INTERVAL)
