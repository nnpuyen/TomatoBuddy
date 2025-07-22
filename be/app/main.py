from fastapi import FastAPI
from app.mqtt_client import start_mqtt
from app.routers import commands, data
from app.database import init_database

# The FastAPI app is now created with a lifespan handler below
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI is starting...")
    init_database()
    start_mqtt()
    yield

app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(commands.router)
app.include_router(data.router)


@app.get("/")
async def root():
    return {"message": "TomatoBuddy API is running"}