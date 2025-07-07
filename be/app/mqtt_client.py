import paho.mqtt.client as mqtt
import json
from app.database.mongodb import save_sensor_reading

BROKER = "test.mosquitto.org"
PORT = 1883
TOPIC = "pizero2w/sensorreading"

client = mqtt.Client()

# Connect to MQTT broker
def on_connect(client, userdata, flags, rc):
    print("✅ Connected to MQTT broker with result code", rc)
    client.subscribe(TOPIC)

# Receive message from topics that it has subscribed (on background thread)
def on_message(client, userdata, msg):
    if (msg.topic == "pizero2w/sensorreading"):
        print(f"📩 Received message: {msg.payload.decode()} on topic {msg.topic}")
        
        # Get data from payload
        payload = msg.payload.decode()
        data = json.loads(payload)

        temp = float(data.get("temp", 0.0))
        hum = float(data.get("humidity", 0.0))

        print(f"🌡️ Temp: {temp} °C | 💧 Humidity: {hum} %")
        # Save sensor reading on mongodb 
        save_sensor_reading(temp, hum)

# Set on_connect function
client.on_connect = on_connect

# Set on_message function 
client.on_message = on_message

# Start mqtt client
def start_mqtt():
    client.connect(BROKER, PORT, 60)
    client.loop_start()


def publish_message(topic: str, payload: str):
    client.publish(topic, payload)