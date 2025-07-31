from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.mongodb import get_settings, update_settings
from app.mqtt_client import send_settings_update

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsModel(BaseModel):
    image_capture_interval: int
    temp_humidity_interval: int
    light_intensity_interval: int
    soil_moisture_interval: int
    water_level_interval: int

@router.get("/")
async def get_current_settings():
    """Get current settings"""
    settings = get_settings()
    settings["_id"] = str(settings["_id"])  # Convert ObjectId to string
    return settings

@router.put("/")
async def update_current_settings(settings: SettingsModel):
    """Update settings"""
    settings_dict = settings.dict()
    
    success, message = update_settings(settings_dict)
    if not success:
        raise HTTPException(status_code=500, detail=message)
    
    # Send to edge AI via MQTT
    mqtt_success = send_settings_update(settings_dict)
    if not mqtt_success:
        # Settings saved but MQTT failed - log warning but don't fail
        print("Warning: Settings saved but MQTT notification failed")
    
    return {"success": True, "message": "Settings updated successfully"}
