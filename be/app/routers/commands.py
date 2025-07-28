from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.mqtt_client import send_water_command, send_capture_command, send_chirp_command

router = APIRouter(prefix="/api/commands", tags=["commands"])


class WaterCommand(BaseModel):
    amount: int = 300  # Default 300ml


class ChirpCommand(BaseModel):
    duration: int = 3  # Default 3 seconds


@router.post("/water")
async def water_plants(command: WaterCommand):
    """Send command to water plants with specified amount"""
    success = send_water_command(command.amount)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send water command")
    return {"success": True, "message": f"Water command sent: {command.amount}ml"}


@router.post("/capture")
async def capture_image():
    """Send command to capture an image"""
    success = send_capture_command()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send capture command")
    return {"success": True, "message": "Capture command sent"}


@router.post("/chirp")
async def chirp(command: ChirpCommand):
    """Send command to make the device chirp"""
    success = send_chirp_command(command.duration)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send chirp command")
    return {"success": True, "message": f"Chirp command sent: {command.duration}s"}
