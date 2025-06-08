from pymongo import MongoClient
import os

# 환경변수에서 Mongo URL 가져오거나 기본 로컬호스트 사용
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")

# 클라이언트 연결
client = MongoClient(MONGO_URL)

# 데이터베이스 선택
db = client["orcax_db"]

# 주요 콜렉션
users = db["users"]
transactions = db["transactions"]
market_prices = db["market_prices"]

# 재사용용 DB getter
def get_db():
    return db
