import paho.mqtt.client as mqtt
import json
from datetime import datetime
import base64
import time
import time

from app.database.mongodb import (
    save_sensor_reading,
    save_command_execution,
    save_image_data,
)
from app.database.cloudinary import upload_image

# MQTT config
BROKER = "10.211.222.46"
PORT = 1883

# Topics
SENSOR_TOPIC = "pizero2w/sensorreading"
INFERENCE_TOPIC = "pizero2w/inference"
ACK_TOPIC_PREFIX = "pizero2w/ack/"
COMMAND_TOPIC = "pizero2w/commands"
SETTINGS_TOPIC = "pizero2w/settings"

client = mqtt.Client()


# -------------------- MQTT CALLBACKS --------------------

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code", rc)
    client.subscribe([(SENSOR_TOPIC, 0), (INFERENCE_TOPIC, 0), (ACK_TOPIC_PREFIX + "+", 0)])


def on_message(client, userdata, msg):
    topic = msg.topic
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        print(f"Received message on topic: {topic}")

        if topic == SENSOR_TOPIC:
            handle_sensor_data(data)
        elif topic == INFERENCE_TOPIC:
            handle_inference_data(data)
        elif topic.startswith(ACK_TOPIC_PREFIX):
            command_type = topic[len(ACK_TOPIC_PREFIX):]
            handle_command_ack(command_type, data)
        else:
            print(f"Unknown topic: {topic}")
    except json.JSONDecodeError:
        print(f"Invalid JSON in message: {msg.payload}")
    except Exception as e:
        print(f"Error processing message: {str(e)}")


# -------------------- MESSAGE HANDLERS --------------------

def handle_sensor_data(data: dict):
    try:
        # soil = int(data.get("soil", 0))
        # voltage = float(data.get("voltage", 0.0))
        temp = float(data.get("temp", 0.0))
        humidity = float(data.get("humidity", 0.0))
        moisture = float(data.get("moisture", 0.0))
        light = float(data.get("light", 0.0))
        # water_level = float(data.get("water_level", 0.0))

        print(f"Temp: {temp}°C | Humidity: {humidity}% | Moisture: {moisture}% | Light: {light}")
        # print(f"Temp: {temp}°C | Humidity: {humidity}% | Moisture: {moisture}% | Light: {light} | Water: {water_level}ml")

        save_sensor_reading(
            temperature=temp,
            humidity=humidity,
            moisture=moisture,
            light=light,
            # water_level=water_level,
        )
    except Exception as e:
        print(f"Error handling sensor data: {str(e)}")


def handle_inference_data(data: dict):
    try:
        image_id = data.get("image_id", "")
        prediction = data.get("prediction", "")
        confidence = float(data.get("confidence", 0.0))
        image_data = data.get("image_data", "")  # base64

        print(f"Inference result: '{prediction}' ({confidence:.6f}) for image {image_id}")

        image_url = None
        if image_data:
            try:
                image_binary = base64.b64decode(image_data)
                success, message, image_url = upload_image(image_binary, prediction, confidence)
                if not success:
                    print(f"Image upload failed: {message}")
            except Exception as e:
                print(f"Error decoding image: {str(e)}")

        # Always save inference metadata
        save_image_data(image_id, prediction, confidence, image_url)
    except Exception as e:
        print(f"Error handling inference data: {str(e)}")


def handle_command_ack(command_type: str, data: dict):
    try:
        success = data.get("success", False)
        status = "success" if success else "failed"
        print(f"🛠️ Command '{command_type}' execution status: {status}")
        save_command_execution(command_type, success)
    except Exception as e:
        print(f"Error handling command ack: {str(e)}")


# -------------------- MQTT UTILITIES --------------------

def start_mqtt(max_retries: int = 9999, retry_delay: int = 5) -> bool:
    """Connect and start MQTT loop in background, with retry if fails"""
    client.on_connect = on_connect
    client.on_message = on_message

    for attempt in range(1, max_retries + 1):
        try:
            print(f"[MQTT] Attempt {attempt}: Connecting to broker {BROKER}:{PORT} ...")
            client.connect(BROKER, PORT, keepalive=60)
            client.loop_start()
            print("[MQTT] MQTT client started")
            return True
        except Exception as e:
            print(f"[MQTT] Connection failed: {e}")
            if attempt < max_retries:
                print(f"[MQTT] Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("[MQTT] Max retries reached. MQTT connection failed")
                return False


def publish_message(topic: str, payload: dict) -> bool:
    """Publish payload (as JSON) to topic"""
    try:
        result = client.publish(topic, json.dumps(payload))
        return result.rc == mqtt.MQTT_ERR_SUCCESS
    except Exception as e:
        print(f"Error publishing message: {str(e)}")
        return False


# -------------------- COMMAND WRAPPERS --------------------

def send_command(command_name: str, params: dict = {}) -> bool:
    command = {
        "command": command_name,
        "params": params,
        "timestamp": datetime.now().isoformat(),
    }
    return publish_message(COMMAND_TOPIC, command)


def send_water_command(amount: int = 300) -> bool:
    return send_command("water", {"amount": amount})


def send_capture_command() -> bool:
    return send_command("capture")


def send_chirp_command(duration: int = 3) -> bool:
    return send_command("chirp", {"duration": duration})


#- -------------------- SETTINGS --------------------
def send_settings_update(settings):
    """Send settings update to edge AI via MQTT"""
    payload = {
        "settings": {
            # "image_capture_interval": settings["image_capture_interval"],
            "temp_humidity_interval": settings["temp_humidity_interval"],
            "light_intensity_interval": settings["light_intensity_interval"],
            "soil_moisture_interval": settings["soil_moisture_interval"],
            # "water_level_interval": settings["water_level_interval"]
        },
        "timestamp": datetime.now().isoformat()
    }
    return publish_message(SETTINGS_TOPIC, payload)