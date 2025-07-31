from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from extensions import mongo
from dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient
import os
import traceback

client = MongoClient(os.getenv("MONGO_URI"))
db = client["edu_app"]

dashboard_router = APIRouter(prefix="/api")

@dashboard_router.get("/attendance_dashboard")
async def dashboard(current_user: dict = Depends(get_current_user)):
    try:
        pipeline = [{"$group": {"_id": "$student_name", "count": {"$sum": 1}}}]
        data = list(db.attendance.aggregate(pipeline))
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/attendance_history")
async def history(current_user: dict = Depends(get_current_user)):
    try:
        recs = list(db.attendance.find().sort("timestamp", -1))

        for i, r in enumerate(recs):
            r["_id"] = str(r["_id"])
            if isinstance(r.get("timestamp"), datetime):
                r["timestamp"] = r["timestamp"].isoformat()
        
        return JSONResponse(content=recs)

    except Exception as e:
        traceback.print_exc()  # This prints the full traceback
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

router = dashboard_router