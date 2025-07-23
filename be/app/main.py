from fastapi import FastAPI
from app.mqtt_client import start_mqtt
from app.routers import commands, data
from app.database import init_database
from fastapi.middleware.cors import CORSMiddleware

# The FastAPI app is now created with a lifespan handler below
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI is starting...")
    init_database()
    # Try to start MQTT client, but continue even if it fails
    try:
        start_mqtt()
    except Exception as e:
        print(f"Warning: MQTT connection failed: {str(e)}")
        print("Running without MQTT functionality")
    yield

app = FastAPI(
    title="TomatoBuddy API",
    description="API for TomatoBuddy IoT plant monitoring system",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(commands.router)
app.include_router(data.router)


@app.get("/")
async def root():
    return {
        "message": "TomatoBuddy API is running",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }