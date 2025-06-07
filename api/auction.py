# /api/auction.py (이어붙임)
@router.get("/auction/listings")
async def get_listings():
    items = list(auction_items.find({"status": "listed"}).sort("created_at", -1))
    for item in items:
        item["_id"] = str(item["_id"])  # ObjectId는 JSON 직렬화 안 되니까
    return items
