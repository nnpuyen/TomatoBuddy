from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()
uri = os.getenv("MONGODB_URI")
database_name = os.getenv("DATABASE_NAME")
client = MongoClient(uri)
db = client[database_name] #database_name là TomatoBuddy


# SAVE functions to save data to MongoDB
def save_sensor_reading(temperature: float, humidity: float, moisture: float = 0.0, light: float = 0.0, water_level: float = 0.0):
    try:
        sensor_reading = {
            "temperature": temperature,
            "humidity": humidity,
            "moisture": moisture,
            "light": light,
            "water_level": water_level,
            "timestamp": datetime.now()
        }

        db.sensor_readings.insert_one(sensor_reading)
        print("Sensor reading saved successfully")
        return True, "Sensor reading saved successfully"
    except Exception as e:
        print(f"Error saving sensor reading: {str(e)}")
        return False, f"Error saving document: {str(e)}"
    
def save_command_execution(command_type: str, success: bool, params: dict = None):
    try:
        command_execution = {
            "command_type": command_type,
            "success": success,
            "params": params if params else {},
            "timestamp": datetime.now()
        }

        db.command_executions.insert_one(command_execution)
        print("Command execution saved successfully")
        return True, "Command execution saved successfully"
    except Exception as e:
        print(f"Error saving command execution: {str(e)}")
        return False, f"Error saving document: {str(e)}"
    
def save_image_data(image_id: str, prediction: str, confidence: float, image_url: str = ""):
    try:
        image_data = {
            "image_id": image_id,
            "prediction": prediction,
            "confidence": confidence,
            "image_url": image_url,
            "timestamp": datetime.now()
        }

        db.image_data.insert_one(image_data)
        print(f"Image data saved successfully: {image_id}")
        return True, "Image data saved successfully"
    except Exception as e:
        print(f"Error saving image data: {str(e)}")
        return False, f"Error saving document: {str(e)}"

def save_watering_event(amount: float, mode: str, moisture_before: float = 0.0, moisture_after: float = 0.0, success: bool = True):
    """
    Save a watering event to the database
    
    Args:
        amount: Amount of water in ml
        mode: Watering mode ('auto', 'schedule', 'remote')
        moisture_before: Soil moisture before watering (%)
        moisture_after: Soil moisture after watering (%)
        success: Whether the watering was successful
    """
    try:
        watering_event = {
            "amount": amount,
            "mode": mode,
            "moisture_before": moisture_before,
            "moisture_after": moisture_after,
            "success": success,
            "timestamp": datetime.now()
        }
        
        db.watering_history.insert_one(watering_event)
        print(f"Watering event saved successfully: {amount}ml via {mode}")
        return True, "Watering event saved successfully"
    except Exception as e:
        print(f"Error saving watering event: {str(e)}")
        return False, f"Error saving document: {str(e)}"
    
# GET functions to retrieve data
def get_sensor_readings(limit: int = 100, skip: int = 0, hours: int = None):
    """Get the most recent sensor readings with optional time filter"""
    try:
        query = {}
        if hours:
            threshold = datetime.now() - timedelta(hours=hours)
            query["timestamp"] = {"$gte": threshold}
            
        cursor = db.sensor_readings.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"Error retrieving sensor readings: {str(e)}")
        return []

    
def get_sensor_stats(days: int = 7):
    """Get statistics for sensor readings over the specified number of days"""
    try:
        # Calculate the date threshold
        threshold = datetime.now() - timedelta(days=days)
        
        # Aggregation pipeline for statistics
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": threshold}
                }
            },
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
                    "count": {"$sum": 1}
                }
            }
        ]
        
        result = list(db.sensor_readings.aggregate(pipeline))
        if result:
            # Remove the _id field from the result
            stats = result[0]
            stats.pop("_id", None)
            return stats
        return {}
    except Exception as e:
        print(f"Error retrieving sensor statistics: {str(e)}")
        return {}


def get_image_data(limit: int = 20, skip: int = 0, prediction_filter: str = None, start_date: datetime = None, end_date: datetime = None):
    """Get image data with optional filtering by prediction and date range"""
    try:
        query = {}
        if prediction_filter:
            query["prediction"] = prediction_filter
            
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date
            
        cursor = db.image_data.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"Error retrieving image data: {str(e)}")
        return []

def get_watering_history(limit: int = 50, skip: int = 0, mode_filter: str = None, start_date: datetime = None, end_date: datetime = None):
    """Get watering history with optional filtering by mode and date range"""
    try:
        query = {}
        if mode_filter:
            query["mode"] = mode_filter
            
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date
            
        cursor = db.watering_history.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"Error retrieving watering history: {str(e)}")
        return []

