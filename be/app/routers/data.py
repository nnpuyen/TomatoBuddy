from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import datetime
from app.database.mongodb import (
    get_sensor_readings,
    get_image_data,
    get_watering_history
)

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/sensors")
async def sensor_readings(
    limit: int = Query(100, ge=1, le=1000), 
    skip: int = Query(0, ge=0),
    hours: Optional[int] = None
):
    """
    Get the most recent sensor readings
    
    - **limit**: Maximum number of readings to return
    - **skip**: Number of readings to skip (for pagination)
    - **hours**: Filter readings from the last X hours
    """
    data = get_sensor_readings(limit, skip, hours)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data


@router.get("/sensors/latest")
async def latest_sensor_reading():
    """Get the most recent sensor reading"""
    data = get_sensor_readings(limit=1)
    if data:
        # Convert ObjectId to string for JSON serialization
        data[0]["_id"] = str(data[0]["_id"])
        return data[0]
    return {"error": "No sensor readings available"}


@router.get("/sensors/stats")
async def sensor_statistics(days: int = Query(7, ge=1, le=30)):
    """
    Get statistics for sensor readings over the specified number of days
    
    - **days**: Number of days to include in statistics
    """
    from app.database.mongodb import get_sensor_stats
    return get_sensor_stats(days)


@router.get("/images")
async def images(
    limit: int = Query(20, ge=1, le=100), 
    skip: int = Query(0, ge=0),
    prediction: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get image data with optional filtering by prediction and date range"""
    # Convert string dates to datetime objects if provided
    start_datetime = None
    end_datetime = None
    
    if start_date:
        start_datetime = datetime.fromisoformat(start_date)
    if end_date:
        end_datetime = datetime.fromisoformat(end_date)
    
    data = get_image_data(limit, skip, prediction, start_datetime, end_datetime)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data

@router.get("/watering")
async def watering_history(
    limit: int = Query(50, ge=1, le=500), 
    skip: int = Query(0, ge=0),
    mode: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get watering history with optional filtering by mode and date range"""
    # Convert string dates to datetime objects if provided
    start_datetime = None
    end_datetime = None
    
    if start_date:
        start_datetime = datetime.fromisoformat(start_date)
    if end_date:
        end_datetime = datetime.fromisoformat(end_date)
    
    data = get_watering_history(limit, skip, mode, start_datetime, end_datetime)
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item["_id"] = str(item["_id"])
    return data

