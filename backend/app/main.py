from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from app.mqtt_client import start_mqtt
from app.routers import commands, data, settings
from app.database import init_database

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get allowed origins from env (default to '*')
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI is starting...")
    init_database()

    try:
        start_mqtt()
        logger.info("MQTT connection established.")
    except Exception as e:
        logger.warning(f"MQTT connection failed: {e}")
        logger.info("Running without MQTT functionality")

    yield


app = FastAPI(
    title="TomatoBuddy API",
    description="API for TomatoBuddy IoT plant monitoring system",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(commands.router)
app.include_router(data.router)
app.include_router(settings.router)

@app.get("/")
async def root():
    return {
        "message": "TomatoBuddy API is running",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }
