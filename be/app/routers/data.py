from fastapi import APIRouter, Query
from typing import List, Optional
from app.database.mongodb import (
    get_sensor_readings,
    get_image_data,
    get_watering_history
)

router = APIRouter(prefix="/api/data", tags=["data"])

@router.get("/sensors")
async def sensor_readings(limit: int = Query(100, ge=1, le=1000), skip: int = Query(0, ge=0)):
    """Get the most recent sensor readings"""
    data = get_sensor_readings(limit, skip)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data

@router.get("/images")
async def images(
    limit: int = Query(20, ge=1, le=100), 
    skip: int = Query(0, ge=0),
    prediction: Optional[str] = None
):
    """Get image data with optional filtering by prediction"""
    data = get_image_data(limit, skip, prediction)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data

@router.get("/watering")
async def watering_history(
    limit: int = Query(50, ge=1, le=500), 
    skip: int = Query(0, ge=0),
    mode: Optional[str] = None
):
    """Get watering history with optional filtering by mode"""
    data = get_watering_history(limit, skip, mode)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data
