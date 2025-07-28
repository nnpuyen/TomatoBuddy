import os
import uuid
from datetime import datetime

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

from app.database.mongodb import save_image_data

load_dotenv()


def init_cloudinary():
    """
    Initialize Cloudinary configuration using environment variables.
    This should be called once during app startup.
    """
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )


def generate_image_ids() -> tuple[str, str]:
    """
    Generate a unique public_id for Cloudinary and image_id for MongoDB.
    Returns:
        public_id (str): Identifier for Cloudinary upload
        image_id (str): Identifier used for MongoDB record
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    public_id = f"tomato_{timestamp}_{unique_id}"
    image_id = f"img_{timestamp}_{unique_id}"
    return public_id, image_id


def upload_image(
    image_binary: bytes, prediction: str = "unknown", confidence: float = 0.0
):
    """
    Upload an image to Cloudinary and save metadata to MongoDB.

    Args:
        image_binary (bytes): Raw image data
        prediction (str): Prediction label
        confidence (float): Confidence score of the prediction

    Returns:
        (bool, str, Optional[str]): (Success, Message, Image URL if successful)
    """
    try:
        public_id, image_id = generate_image_ids()

        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(
            image_binary,
            public_id=public_id,
            folder="tomato_buddy",
            resource_type="image",
        )

        # Extract the secure image URL
        image_url = result.get("secure_url")
        if not image_url:
            raise ValueError("Cloudinary response missing 'secure_url'")

        # Save metadata to MongoDB
        save_image_data(image_id, prediction, confidence, image_url)

        print(f"[✓] Image uploaded: {image_url}")
        return True, "Image uploaded successfully", image_url

    except Exception as e:
        print(f"[✗] Error uploading image: {str(e)}")
        return False, str(e), None
