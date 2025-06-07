from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["orcax_db"]

users = db["users"]

def get_db():
    return db
