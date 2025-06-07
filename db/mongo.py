# db/mongo.py
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["orcax_db"]

def get_db():
    return db

users = db["users"]
