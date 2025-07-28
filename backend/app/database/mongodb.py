import os
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Tuple

from dotenv import load_dotenv
from pymongo import MongoClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


# Init MongoDB client and database
def init_mongo() -> MongoClient:
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME", "TomatoBuddy")
    if not uri:
        raise ValueError("MONGODB_URI is not set in the environment.")
    client = MongoClient(uri)
    return client[db_name]


db = init_mongo()


# Helpers
def build_time_filter(
    start: Optional[datetime] = None, end: Optional[datetime] = None
) -> Dict:
    if not start and not end:
        return {}
    filter_ = {}
    if start:
        filter_["$gte"] = start
    if end:
        filter_["$lte"] = end
    return {"timestamp": filter_}


# SAVE Functions
def save_sensor_reading(
    temperature: float,
    humidity: float,
    moisture: float = 0.0,
    light: float = 0.0,
    water_level: float = 0.0,
) -> Tuple[bool, str]:
    try:
        sensor_reading = {
            "temperature": temperature,
            "humidity": humidity,
            "moisture": moisture,
            "light": light,
            "water_level": water_level,
            "timestamp": datetime.now(),
        }
        db.sensor_readings.insert_one(sensor_reading)
        logger.info("Sensor reading saved.")
        return True, "Sensor reading saved successfully"
    except Exception as e:
        logger.error(f"Failed to save sensor reading: {e}")
        return False, f"Error: {e}"


def save_command_execution(
    command_type: str, success: bool, params: Optional[Dict] = None
) -> Tuple[bool, str]:
    try:
        execution = {
            "command_type": command_type,
            "success": success,
            "params": params or {},
            "timestamp": datetime.now(),
        }
        db.command_executions.insert_one(execution)
        logger.info("Command execution saved.")
        return True, "Command execution saved successfully"
    except Exception as e:
        logger.error(f"Failed to save command execution: {e}")
        return False, f"Error: {e}"


def save_image_data(
    image_id: str, prediction: str, confidence: float, image_url: str = ""
) -> Tuple[bool, str]:
    try:
        image_data = {
            "image_id": image_id,
            "prediction": prediction,
            "confidence": confidence,
            "image_url": image_url,
            "timestamp": datetime.now(),
        }
        db.image_data.insert_one(image_data)
        logger.info(f"Image data saved: {image_id}")
        return True, "Image data saved successfully"
    except Exception as e:
        logger.error(f"Failed to save image data: {e}")
        return False, f"Error: {e}"


def save_watering_event(
    amount: float,
    mode: str,
    moisture_before: float = 0.0,
    moisture_after: float = 0.0,
    success: bool = True,
) -> Tuple[bool, str]:
    try:
        event = {
            "amount": amount,
            "mode": mode,
            "moisture_before": moisture_before,
            "moisture_after": moisture_after,
            "success": success,
            "timestamp": datetime.now(),
        }
        db.watering_history.insert_one(event)
        logger.info(f"Watering event saved: {amount}ml via {mode}")
        return True, "Watering event saved successfully"
    except Exception as e:
        logger.error(f"Failed to save watering event: {e}")
        return False, f"Error: {e}"


# GET Functions
def get_sensor_readings(
    limit: int = 100, skip: int = 0, hours: Optional[int] = None
) -> List[Dict]:
    try:
        query = {}
        if hours:
            threshold = datetime.now() - timedelta(hours=hours)
            query["timestamp"] = {"$gte": threshold}
        return list(
            db.sensor_readings.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        )
    except Exception as e:
        logger.error(f"Failed to retrieve sensor readings: {e}")
        return []


def get_sensor_stats(days: int = 7) -> Dict:
    try:
        threshold = datetime.now() - timedelta(days=days)
        pipeline = [
            {"$match": {"timestamp": {"$gte": threshold}}},
            {
                "$group": {
                    "_id": None,
                    "avg_temperature": {"$avg": "$temperature"},
                    "min_temperature": {"$min": "$temperature"},
                    "max_temperature": {"$max": "$temperature"},
                    "avg_humidity": {"$avg": "$humidity"},
                    "min_humidity": {"$min": "$humidity"},
                    "max_humidity": {"$max": "$humidity"},
                    "avg_moisture": {"$avg": "$moisture"},
                    "min_moisture": {"$min": "$moisture"},
                    "max_moisture": {"$max": "$moisture"},
                    "count": {"$sum": 1},
                }
            },
        ]
        result = list(db.sensor_readings.aggregate(pipeline))
        if result:
            stats = result[0]
            stats.pop("_id", None)
            return stats
        return {}
    except Exception as e:
        logger.error(f"Failed to retrieve sensor stats: {e}")
        return {}


def get_image_data(
    limit: int = 20,
    skip: int = 0,
    prediction_filter: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> List[Dict]:
    try:
        query = {}
        if prediction_filter:
            query["prediction"] = prediction_filter
        query.update(build_time_filter(start_date, end_date))
        return list(
            db.image_data.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        )
    except Exception as e:
        logger.error(f"Failed to retrieve image data: {e}")
        return []


def get_watering_history(
    limit: int = 50,
    skip: int = 0,
    mode_filter: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> List[Dict]:
    try:
        query = {}
        if mode_filter:
            query["mode"] = mode_filter
        query.update(build_time_filter(start_date, end_date))
        return list(
            db.watering_history.find(query)
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
    except Exception as e:
        logger.error(f"Failed to retrieve watering history: {e}")
        return []
