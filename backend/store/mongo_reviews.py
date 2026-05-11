import math
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from .mongo_client import get_reviews_collection


def _serialize(doc):
    if doc is None:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    if isinstance(doc.get("date"), datetime):
        doc["date"] = doc["date"].isoformat()
    return doc


def create_review(data: dict) -> dict:
    col = get_reviews_collection()
    doc = {
        "product_id": int(data["product_id"]),
        "user_id": int(data["user_id"]) if data.get("user_id") else None,
        "reviewer_name": data.get("reviewer_name") or None,
        "rating": int(data["rating"]),
        "review": data["review"],
        "reply": None,
        "active": True,
        "helpful_users": [],
        "not_helpful_users": [],
        "date": datetime.now(timezone.utc),
    }
    result = col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_reviews_by_product(product_id: int, page: int = 1, page_size: int = 10, rating_filter: int = None):
    col = get_reviews_collection()
    query = {"product_id": int(product_id), "active": True}
    if rating_filter:
        query["rating"] = int(rating_filter)

    total = col.count_documents(query)
    skip = (page - 1) * page_size
    cursor = col.find(query).sort("date", -1).skip(skip).limit(page_size)
    docs = [_serialize(d) for d in cursor]
    pages = math.ceil(total / page_size) if total > 0 else 1
    return docs, total, pages


def get_review_by_id(review_id: str) -> dict:
    try:
        col = get_reviews_collection()
        doc = col.find_one({"_id": ObjectId(review_id)})
        return _serialize(doc)
    except InvalidId:
        return None


def get_reviews_by_vendor(product_ids: list) -> list:
    col = get_reviews_collection()
    int_ids = [int(pid) for pid in product_ids]
    cursor = col.find({"product_id": {"$in": int_ids}}).sort("date", -1)
    return [_serialize(d) for d in cursor]


def update_review_reply(review_id: str, reply: str) -> dict:
    try:
        col = get_reviews_collection()
        col.update_one({"_id": ObjectId(review_id)}, {"$set": {"reply": reply}})
        return get_review_by_id(review_id)
    except InvalidId:
        return None


def toggle_helpful_vote(review_id: str, user_id: int, helpful: bool):
    try:
        col = get_reviews_collection()
        oid = ObjectId(review_id)
        uid = int(user_id)
        if helpful:
            col.update_one({"_id": oid}, {
                "$addToSet": {"helpful_users": uid},
                "$pull": {"not_helpful_users": uid},
            })
        else:
            col.update_one({"_id": oid}, {
                "$addToSet": {"not_helpful_users": uid},
                "$pull": {"helpful_users": uid},
            })
        return get_review_by_id(review_id)
    except InvalidId:
        return None


def recalculate_product_rating(product_id: int) -> float:
    try:
        col = get_reviews_collection()
        pipeline = [
            {"$match": {"product_id": int(product_id), "active": True}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}},
        ]
        result = list(col.aggregate(pipeline))
        if result:
            return round(result[0]["avg"], 1)
        return 0.0
    except Exception:
        return 0.0
