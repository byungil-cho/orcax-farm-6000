from pymongo import MongoClient
import os

port = int(os.environ.get("PORT", 10000))

client = MongoClient("mongodb://localhost:27017")
db = client["orcax_db"]

users = db["users"]

def get_db():
    return db
