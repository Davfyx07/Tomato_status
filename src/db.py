from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_collection():
    uri = os.getenv("MONGO_URI")
    client = MongoClient(uri)

    db = client["tomatesIA"] #cambiar caundo tenga la bd

    return db['analisis']