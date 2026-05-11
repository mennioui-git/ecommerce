from pymongo import MongoClient, ASCENDING, DESCENDING
from django.conf import settings

_client = None
_db = None


def _get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
            socketTimeoutMS=3000,
        )
        _db = _client[settings.MONGODB_DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    col = db["reviews"]
    col.create_index([("product_id", ASCENDING)])
    col.create_index([("user_id", ASCENDING)])
    col.create_index([("product_id", ASCENDING), ("active", ASCENDING)])
    col.create_index([("rating", ASCENDING)])
    col.create_index([("date", DESCENDING)])


def get_reviews_collection():
    return _get_db()["reviews"]
