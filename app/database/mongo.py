from pymongo import MongoClient
import os

# MongoDB 연결 설정
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

# 사용할 데이터베이스 및 컬렉션
db = client["orcax_farm"]  # 데이터베이스 이름
users_collection = db["users"]  # 유저 정보 저장 컬렉션
