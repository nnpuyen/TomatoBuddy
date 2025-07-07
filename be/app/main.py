from fastapi import FastAPI
from app.mqtt_client import start_mqtt, publish_message

# The FastAPI app is now created with a lifespan handler below

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 FastAPI is starting...")
    start_mqtt()
    yield

app = FastAPI(lifespan=lifespan)
