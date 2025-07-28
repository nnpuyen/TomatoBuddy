import paho.mqtt.client as mqtt
import json
from datetime import datetime
from app.database.mongodb import save_sensor_reading, save_command_execution

BROKER = "test.mosquitto.org"
PORT = 1883

# Topics for subcribing
SENSOR_TOPIC = "pizero2w/sensorreading"
INFERENCE_TOPIC = "pizero2w/inference"
ACK_TOPIC = "pizero2w/ack/+"

# Topics for publishing
COMMAND_TOPIC = "pizero2w/commands"

client = mqtt.Client()


# Connect to MQTT broker
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code ", rc)
    # Subscribe to multiple topics
    client.subscribe([(SENSOR_TOPIC, 0), (INFERENCE_TOPIC, 0), (ACK_TOPIC, 0)])


# Receive message from topics that it has subscribed (on background thread)
def on_message(client, userdata, msg):
    print(f"Received message on topic {msg.topic}")

    try:
        payload = msg.payload.decode()
        data = json.loads(payload)

        if msg.topic == SENSOR_TOPIC:
            handle_sensor_data(data)
        elif msg.topic == INFERENCE_TOPIC:
            handle_inference_data(data)
        elif msg.topic.startswith("pizero2w/ack/"):
            command_type = msg.topic.split("/")[-1]
            handle_command_ack(command_type, data)
    except json.JSONDecodeError:
        print(f"Error decoding JSON from message: {msg.payload}")
    except Exception as e:
        print(f"Error processing message: {str(e)}")


def handle_sensor_data(data):
    try:
        temp = float(data.get("temp", 0.0))
        humidity = float(data.get("humidity", 0.0))
        moisture = float(data.get("moisture", 0.0))
        light = float(data.get("light", 0.0))
        water_level = float(data.get("water_level", 0.0))

        print(
            f"Temp: {temp} °C | Humidity: {humidity} % | Moisture: {moisture} % | Light: {light} | Water: {water_level}ml"
        )

        save_sensor_reading(
            temp=temp,
            humidity=humidity,
            moisture=moisture,
            light=light,
            water_level=water_level,
            timestamp=datetime.now(),
        )
    except Exception as e:
        print(f"Error handling sensor data: {str(e)}")


def handle_inference_data(data):
    try:
        image_id = data.get("image_id", "")
        prediction = data.get("prediction", "")
        confidence = float(data.get("confidence", 0.0))
        image_data = data.get("image_data", "")  # Base64 encoded image

        print(f"Inference result: {prediction} ({confidence:.2f}) for image {image_id}")

        # TODO: Save inference data to MongoDB
        if image_data:
            # Decode base64 image
            import base64
            from app.database.cloudinary import upload_image

            try:
                image_binary = base64.b64decode(image_data)
                success, message, image_url = upload_image(
                    image_binary, prediction, confidence
                )
                if not success:
                    print(f"Failed to upload image: {message}")
            except Exception as e:
                print(f"Error processing image data: {str(e)}")
        else:
            print("No image data provided in inference result")

    except Exception as e:  # Save inference data to MongoDB without image
        from app.database.mongodb import save_image_data

        save_image_data(image_id, prediction, confidence)


def handle_command_ack(command_type, data):
    success = data.get("success", False)
    status = "success" if success else "failed"
    print(f"Command {command_type} execution {status}")

    save_command_execution(
        command_type=command_type, success=success, timestamp=datetime.now()
    )


# Set on_connect function
client.on_connect = on_connect

# Set on_message function
client.on_message = on_message


# Start mqtt client
def start_mqtt():
    """Start MQTT client with error handling"""
    try:
        print("Connecting to MQTT broker...")
        client.connect(BROKER, PORT, 60)
        client.loop_start()
        print("MQTT client started successfully")
        return True
    except Exception as e:
        print(f"Warning: Failed to connect to MQTT broker: {str(e)}")
        print("API will run without MQTT functionality")
        return False


def publish_message(topic: str, payload: str):
    result = client.publish(topic, payload)
    return result.rc == mqtt.MQTT_ERR_SUCCESS


# Command functions for controlling the device
def send_water_command(amount: int = 300) -> bool:
    command = {
        "command": "water",
        "params": {"amount": amount},
        "timestamp": datetime.now().isoformat(),
    }
    return publish_message(COMMAND_TOPIC, json.dumps(command))


def send_capture_command() -> bool:
    command = {
        "command": "capture",
        "params": {},
        "timestamp": datetime.now().isoformat(),
    }
    return publish_message(COMMAND_TOPIC, json.dumps(command))


def send_chirp_command(duration: int = 3) -> bool:
    command = {
        "command": "chirp",
        "params": {"duration": duration},
        "timestamp": datetime.now().isoformat(),
    }
    return publish_message(COMMAND_TOPIC, json.dumps(command))
