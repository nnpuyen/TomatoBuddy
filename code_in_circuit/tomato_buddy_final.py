import cv2
import numpy as np
import tflite_runtime.interpreter as tflite
from PIL import Image, ImageDraw, ImageOps
from urllib.parse import quote_plus
import os
import time
import base64
import io
import json
import threading
import paho.mqtt.client as mqtt

# Sensor imports
import busio, digitalio
from sensors import config_soil_sensor as soil
from sensors import config_dht_sensor as dht
from sensors import config_pump as pump
from adafruit_mcp3xxx.analog_in import AnalogIn
import adafruit_mcp3xxx.mcp3008 as MCP

# ========== MQTT CONFIG ==========
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
TOPIC_SENSOR = "pizero2w/sensorreading"
TOPIC_INFERENCE = "pizero2w/inference"
TOPIC_COMMAND = "pizero2w/commands"

client = mqtt.Client()

# ========== GLOBAL FLAG ==========
capture_requested = False


def on_message(client, userdata, msg):
    global capture_requested
    try:
        data = json.loads(msg.payload.decode())
        if data.get("command") == "capture":
            print("[MQTT] Capture command received!")
            capture_requested = True
    except Exception as e:
        print(f"[ERROR] Invalid MQTT message: {e}")


client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.subscribe(TOPIC_COMMAND)
client.loop_start()

# ========== RTSP CONFIG ==========
USER = "admin"
PWD_RAW = "L294BD22"
IP_CAM = "192.168.2.14"
PWD = quote_plus(PWD_RAW)
URL = f"rtsp://{USER}:{PWD}@{IP_CAM}:554/cam/realmonitor?channel=1&subtype=1"
cap = cv2.VideoCapture(URL)
if not cap.isOpened():
    raise RuntimeError("Không mở được RTSP stream")

# ========== LOAD MODELS ==========
interpreter = tflite.Interpreter(model_path="model/Yolov8n/best_float32.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

interpreter_cls = tflite.Interpreter(
    model_path="model/Mobilenetv2/mobilenetv2_float32.tflite"
)
interpreter_cls.allocate_tensors()
input_cls = interpreter_cls.get_input_details()
output_cls = interpreter_cls.get_output_details()

labels = [
    "Bacterial Spot",
    "Early Blight",
    "Healthy",
    "Late Blight",
    "Leaf Mold",
    "Mosaic Virus",
    "Septoria Leaf Spot",
    "Target Spot",
    "Two-spotted Spider Mites",
    "Yellow Leaf Curl Virus",
]

# ========== MCP3008 setup ==========
spi = busio.SPI(
    clock=soil.SOIL_SPI_CLK, MISO=soil.SOIL_SPI_MISO, MOSI=soil.SOIL_SPI_MOSI
)
cs = digitalio.DigitalInOut(soil.SOIL_SPI_CS)
mcp = MCP.MCP3008(spi, cs)
soil_channel = AnalogIn(mcp, soil.SOIL_SENSOR_CHANNEL)


# ========== Hàm NMS ==========
def non_max_suppression(boxes, iou_threshold=0.5):
    if len(boxes) == 0:
        return np.array([])
    boxes = boxes[np.argsort(-boxes[:, 4])]
    selected_boxes = []
    while len(boxes) > 0:
        chosen_box = boxes[0]
        selected_boxes.append(chosen_box)
        other_boxes = boxes[1:]
        ious = compute_iou(chosen_box, other_boxes)
        boxes = other_boxes[ious < iou_threshold]
    return np.array(selected_boxes)


def compute_iou(box, boxes):
    cx1, cy1, w1, h1 = box[:4]
    x1_1 = cx1 - w1 / 2
    y1_1 = cy1 - h1 / 2
    x2_1 = cx1 + w1 / 2
    y2_1 = cy1 + h1 / 2
    cx2, cy2, w2, h2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1_2 = cx2 - w2 / 2
    y1_2 = cy2 - h2 / 2
    x2_2 = cx2 + w2 / 2
    y2_2 = cy2 + h2 / 2
    inter_x1 = np.maximum(x1_1, x1_2)
    inter_y1 = np.maximum(y1_1, y1_2)
    inter_x2 = np.minimum(x2_1, x2_2)
    inter_y2 = np.minimum(y2_1, y2_2)
    inter_area = np.maximum(0, inter_x2 - inter_x1) * np.maximum(0, inter_y2 - inter_y1)
    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
    return inter_area / (area1 + area2 - inter_area + 1e-6)


# ========== Hàm chạy detection và publish ==========
def run_detection(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(frame_rgb).resize((640, 640))
    img_array = np.array(image, dtype=np.float32) / 255.0
    input_data = np.expand_dims(img_array, axis=0)

    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]["index"])

    confidences = output[0][4]
    mask = confidences > 0.5
    detections = output[0][:, mask]
    detections = np.transpose(detections)
    filtered_boxes = non_max_suppression(detections, iou_threshold=0.5)

    timestamp = int(time.time())
    for idx, box in enumerate(filtered_boxes):
        cx, cy, bw, bh, _ = box
        x_min = max(0, int((cx - bw / 2) * 640))
        y_min = max(0, int((cy - bh / 2) * 640))
        x_max = min(640, int((cx + bw / 2) * 640))
        y_max = min(640, int((cy + bh / 2) * 640))

        if x_max - x_min > 0 and y_max - y_min > 0:
            cropped = image.crop((x_min, y_min, x_max, y_max))
            cropped_resized = ImageOps.fit(
                cropped, (96, 96), method=Image.Resampling.LANCZOS
            )

            input_crop = np.array(cropped_resized, dtype=np.float32) / 255.0
            input_crop = np.expand_dims(input_crop, axis=0)

            interpreter_cls.set_tensor(input_cls[0]["index"], input_crop)
            interpreter_cls.invoke()
            output_data = interpreter_cls.get_tensor(output_cls[0]["index"])
            predicted_class = int(np.argmax(output_data))
            confidence = float(output_data[0][predicted_class])

            buffered = io.BytesIO()
            cropped.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

            image_id = f"{timestamp}_{idx + 1}"
            payload = {
                "image_id": image_id,
                "prediction": labels[predicted_class],
                "confidence": round(confidence, 6),
                "image_data": img_base64,
            }
            client.publish(TOPIC_INFERENCE, json.dumps(payload))
            print(
                f"[MQTT] Sent detection: {payload['prediction']} ({payload['confidence']})"
            )


# ========== Thread 1: Camera & Capture ==========
def detection_thread():
    global capture_requested
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Cannot read frame from RTSP")
            break

        # Nếu có lệnh capture → chạy ngay
        if capture_requested:
            print("[INFO] Capturing frame now...")
            run_detection(frame)
            capture_requested = False

        time.sleep(0.5)


# ========== Thread 2: Sensor reading & Pump control ==========
def sensor_thread():
    while True:
        soil_value = soil_channel.value
        soil_voltage = soil_channel.voltage
        print(f"Soil: {soil_value}, Voltage: {soil_voltage:.2f} V")

        temp = None
        hum = None
        try:
            temp = dht.dht_device.temperature
            hum = dht.dht_device.humidity
            print(f"Temp: {temp}°C   Humidity: {hum}%")
        except Exception as e:
            print("DHT read error:", e)

        if soil_channel.value < 20000:
            print("Soil dry! Turning pump ON")
            pump.pump_relay.value = True
        else:
            print("Soil wet enough. Turning pump OFF")
            pump.pump_relay.value = False

        payload = {"temp": temp, "humidity": hum, "moisture": soil_value}
        client.publish(TOPIC_SENSOR, json.dumps(payload))
        print(f"[MQTT] Sent sensor data: {payload}")
        print("-" * 30)
        time.sleep(5)


# ========== MAIN ==========
try:
    t1 = threading.Thread(target=detection_thread)
    t2 = threading.Thread(target=sensor_thread)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
except KeyboardInterrupt:
    print("[INFO] Stopped by user")
    pump.pump_relay.value = False
    client.loop_stop()
    client.disconnect()
