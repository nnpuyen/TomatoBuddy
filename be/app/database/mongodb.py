from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
uri = os.getenv("MONGODB_URI")
database_name = os.getenv("DATABASE_NAME")
client = MongoClient(uri)
db = client[database_name] #database_name là TomatoBuddy

def save_sensor_reading(temperature: float, humidity: float):
    try:
        sensor_reading = {
            "temperature": temperature,
            "humidity": humidity,
        }
        
        result = db.sensor_readings.insert_one(sensor_reading)
        print("Sensor reading saved successfully")
        return True, "Sensor reading saved successfully"
    except Exception as e:
        return False, f"Error saving document: {str(e)}"