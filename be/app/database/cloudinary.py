import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from app.database.mongodb import save_image_data

load_dotenv()

cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

def init_cloudinary():
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret
    )

def upload_image(image_binary, prediction="unknown", confidence=0.0):
    try:
        # Generate a unique identifier
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        public_id = f"tomato_{timestamp}_{unique_id}"

        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(
            image_binary,
            public_id=public_id,
            folder="tomato_buddy",
            resource_type="image",
        )

        # Get the secure URL
        image_url = result["secure_url"]

        # Save image data to MongoDB
        image_id = f"img_{timestamp}_{unique_id}"
        save_image_data(image_id, prediction, confidence, image_url)

        print(f"Image uploaded to Cloudinary: {image_url}")
        return True, "Image uploaded successfully", image_url
        

    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return False, str(e)