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
from sensors import config_light_sensor as light
from adafruit_mcp3xxx.analog_in import AnalogIn
import adafruit_mcp3xxx.mcp3008 as MCP

# ========== MQTT CONFIG ==========
MQTT_BROKER = "10.211.222.46"
MQTT_PORT = 1883
TOPIC_SENSOR = "pizero2w/sensorreading"
TOPIC_INFERENCE = "pizero2w/inference"
TOPIC_COMMAND = "pizero2w/commands"
TOPIC_SETTINGS = "pizero2w/settings"

client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

# ========== GLOBAL FLAG ==========
capture_requested = False

sensor_intervals = None

last_readings = {
    "temp_humidity": 0,
    "light_intensity": 0,
    "soil_moisture": 0,
    # "water_level": 0
}

def on_message(client, userdata, msg):
    global capture_requested, sensor_intervals
    try:
        data = json.loads(msg.payload.decode())
        if msg.topic == TOPIC_COMMAND and data.get("command") == "capture":
            print("[MQTT] Capture command received!")
            capture_requested = True
        elif msg.topic == TOPIC_SETTINGS:
            sensor_intervals = data.get("settings", {})
            print(f"[MQTT] Received settings: {sensor_intervals}")
    except Exception as e:
        print(f"[ERROR] Invalid MQTT message: {e}")


client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.subscribe(TOPIC_COMMAND)
client.subscribe(TOPIC_SETTINGS)
client.loop_start()

# ========== RTSP CONFIG ==========
USER = "admin"
PWD_RAW = "L294BD22"
# IP_CAM = "192.168.2.14"
IP_CAM = "10.211.222.119"
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

interpreter_cls = tflite.Interpreter(model_path="model/Mobilenetv2/mobilenetv2_float32.tflite")
interpreter_cls.allocate_tensors()
input_cls = interpreter_cls.get_input_details()
output_cls = interpreter_cls.get_output_details()

# labels = [
#     "Bacterial Spot", "Early Blight", "Healthy", "Late Blight",
#     "Leaf Mold", "Mosaic Virus", "Septoria Leaf Spot", "Target Spot",
#     "Two-spotted Spider Mites", "Yellow Leaf Curl Virus"
# ]

labels = [
    "Early Blight", "Healthy", "Late Blight", "Leaf Miner", 
    "Leaf Mold", "Mosaic Virus", "Septoria", "Spider Mites", "Yellow Leaf Curl Virus"
]

# ========== MCP3008 setup ==========
spi = busio.SPI(clock=soil.SOIL_SPI_CLK, MISO=soil.SOIL_SPI_MISO, MOSI=soil.SOIL_SPI_MOSI)
cs = digitalio.DigitalInOut(soil.SOIL_SPI_CS)
mcp = MCP.MCP3008(spi, cs)
soil_channel = AnalogIn(mcp, soil.SOIL_SENSOR_CHANNEL)

# ========== Hàm NMS ==========
# def non_max_suppression(boxes, iou_threshold=0.5):
#     if len(boxes) == 0:
#         return np.array([])
#     boxes = boxes[np.argsort(-boxes[:, 4])]
#     selected_boxes = []
#     while len(boxes) > 0:
#         chosen_box = boxes[0]
#         selected_boxes.append(chosen_box)
#         other_boxes = boxes[1:]
#         ious = compute_iou(chosen_box, other_boxes)
#         boxes = other_boxes[ious < iou_threshold]
#     return np.array(selected_boxes)

# def compute_iou(box, boxes):
#     cx1, cy1, w1, h1 = box[:4]
#     x1_1 = cx1 - w1 / 2
#     y1_1 = cy1 - h1 / 2
#     x2_1 = cx1 + w1 / 2
#     y2_1 = cy1 + h1 / 2
#     cx2, cy2, w2, h2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
#     x1_2 = cx2 - w2 / 2
#     y1_2 = cy2 - h2 / 2
#     x2_2 = cx2 + w2 / 2
#     y2_2 = cy2 + h2 / 2
#     inter_x1 = np.maximum(x1_1, x1_2)
#     inter_y1 = np.maximum(y1_1, y1_2)
#     inter_x2 = np.minimum(x2_1, x2_2)
#     inter_y2 = np.minimum(y2_1, y2_2)
#     inter_area = np.maximum(0, inter_x2 - inter_x1) * np.maximum(0, inter_y2 - inter_y1)
#     area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
#     area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
#     return inter_area / (area1 + area2 - inter_area + 1e-6)

def letterbox(img: np.ndarray, new_size=(640,640,3), fill_value: int=114) -> np.ndarray:        
    aspect_ratio = min(new_size[1]/ img.shape[1], new_size[0]/ img.shape[0])
    
    new_size_with_ar = int(img.shape[1] * aspect_ratio), int(img.shape[0] * aspect_ratio)
    
    resized_img = np.asarray(cv2.resize(img, new_size_with_ar))
    resized_h, resized_w, _ = resized_img.shape
    
    padded_img = np.full(new_size, fill_value)
    center_x = new_size[0] / 2
    center_y = new_size[1] / 2
    
    x_range_start = int(center_x - (resized_w / 2))
    x_range_end = int(center_x + (resized_w / 2))
    
    y_range_start = int(center_y - (resized_h / 2))
    y_range_end = int(center_y + (resized_h / 2))
    
    padded_img[y_range_start: y_range_end, x_range_start: x_range_end, :] = resized_img
    print(padded_img.shape)
    return padded_img

def compute_iou(box, boxes):
    # Chuyển center-based -> corner-based
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

    # Tính giao nhau
    inter_x1 = np.maximum(x1_1, x1_2)
    inter_y1 = np.maximum(y1_1, y1_2)
    inter_x2 = np.minimum(x2_1, x2_2)
    inter_y2 = np.minimum(y2_1, y2_2)

    inter_area = np.maximum(0, inter_x2 - inter_x1) * np.maximum(0, inter_y2 - inter_y1)

    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)

    union_area = area1 + area2 - inter_area
    iou = inter_area / (union_area + 1e-6)

    return iou

def non_max_suppression(scores, boxes, iou_threshold=0.5):
    # global scores
    
    # boxes: numpy array (N, 5): [cenx, ceny, width, height, conf]
    if len(boxes) == 0:
        return np.zeros(len(boxes), dtype=bool)

    indices = np.argsort(-scores)
    boxes = boxes[indices]
    keep_mask = np.zeros(len(boxes), dtype=bool)

    selected_indices = []
    while len(boxes) > 0:
        selected_indices.append(indices[0])
        keep_mask[indices[0]] = True

        chosen_box = boxes[0]
        other_boxes = boxes[1:]
        other_indices = indices[1:]

        if len(other_boxes) == 0:
            break

        ious = compute_iou(chosen_box, other_boxes)
        mask = ious < iou_threshold

        boxes = other_boxes[mask]
        indices = other_indices[mask]

    return keep_mask

# ========== Hàm chạy detection và publish ==========
# def run_detection(frame):
#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#     image = Image.fromarray(frame_rgb).resize((640, 640))
#     img_array = np.array(image, dtype=np.float32) / 255.0
#     input_data = np.expand_dims(img_array, axis=0)

#     interpreter.set_tensor(input_details[0]['index'], input_data)
#     interpreter.invoke()
#     output = interpreter.get_tensor(output_details[0]['index'])

#     confidences = output[0][4]
#     mask = confidences > 0.5
#     detections = output[0][:, mask]
#     detections = np.transpose(detections)
#     filtered_boxes = non_max_suppression(detections, iou_threshold=0.5)

#     timestamp = int(time.time())
#     for idx, box in enumerate(filtered_boxes):
#         cx, cy, bw, bh, _ = box
#         x_min = max(0, int((cx - bw / 2) * 640))
#         y_min = max(0, int((cy - bh / 2) * 640))
#         x_max = min(640, int((cx + bw / 2) * 640))
#         y_max = min(640, int((cy + bh / 2) * 640))

#         if x_max - x_min > 0 and y_max - y_min > 0:
#             cropped = image.crop((x_min, y_min, x_max, y_max))
#             cropped_resized = ImageOps.fit(cropped, (96, 96), method=Image.Resampling.LANCZOS)
            
#             input_crop = np.array(cropped_resized, dtype=np.float32) / 255.0
#             input_crop = np.expand_dims(input_crop, axis=0)

#             interpreter_cls.set_tensor(input_cls[0]['index'], input_crop)
#             interpreter_cls.invoke()
#             output_data = interpreter_cls.get_tensor(output_cls[0]['index'])
#             predicted_class = int(np.argmax(output_data))
#             confidence = float(output_data[0][predicted_class])

#             buffered = io.BytesIO()
#             cropped.save(buffered, format="JPEG")
#             img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

#             image_id = f"{timestamp}_{idx + 1}"
#             payload = {
#                 "image_id": image_id,
#                 "prediction": labels[predicted_class],
#                 "confidence": round(confidence, 6),
#                 "image_data": img_base64
#             }
#             client.publish(TOPIC_INFERENCE, json.dumps(payload))
#             print(f"[MQTT] Sent detection: {payload['prediction']} ({payload['confidence']})")

def run_detection(frame):
    image = letterbox(frame).astype(np.uint8)
    # scale = (frame.shape[:2][0] / image.shape[:2][0], frame.shape[:2][1] / image.shape[:2][1])
    img_array = np.array(image, dtype=np.float32) / 255.0
    input_data = np.expand_dims(img_array, axis=0)

    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]['index'])
    output = np.squeeze(output).T  # output: (8400, 13)
    boxes = output[:, :4]
    scores = output[:, 4:]
    scores = 1 / (1 + np.exp(-scores))
    classes = np.argmax(scores, axis=1)
    scores = np.max(scores, axis=1)

    sorted_scores = np.argsort(-scores)
    score_mask = scores > 0.6
    scores = scores[score_mask]
    boxes = boxes[score_mask]
    classes = classes[score_mask]
    keep_mask = non_max_suppression(scores, boxes, iou_threshold=0.6)
    boxes = boxes[keep_mask]
    classes = classes[keep_mask]
    scores = scores[keep_mask]

    raw_image = image.copy()

    class_names = ['Early Blight', 'Healthy', 'Late Blight', 'Leaf Miner', 'Leaf Mold', 'Mosaic Virus', 'Septoria', 'Spider Mites', 'Yellow Leaf Curl Virus']

    timestamp = int(time.time())

    for idx, box, score, label in zip(range(len(boxes)), boxes, scores, classes):
        cx, cy, w, h = map(float, box)
        x1 = max(0, int((cx - w / 2) * 640))
        y1 = max(0, int((cy - h / 2) * 640))
        x2 = min(640, int((cx + w / 2) * 640))
        y2 = min(640, int((cy + h / 2) * 640))

        if x2 - x1 <= 0 or y2 - y1 <= 0:
            continue
        if ((x2 - x1) * (y2 - y1) < 224):
            continue

        # Vẽ khung chữ nhật
        cv2.rectangle(image, (x1, y1), (x2, y2), color=(0, 255, 0), thickness=2)
        
        # Tạo nhãn hiển thị
        text = f"{class_names[label]} {score:.2f}"
        
        # Tính vị trí text
        (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - text_height - 4), (x1 + text_width, y1), (0, 255, 0), -1)
        
        # Hiển thị text
        cv2.putText(image, text, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                    fontScale=0.5, color=(0, 0, 0), thickness=1)
        
        # Lưu ảnh crop dưới dạng base64
        # buffered = io.BytesIO()
        # cropped = raw_image[y1:y2, x1:x2, :]
        # cropped.save(buffered, format="JPEG")
        # img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        cropped = raw_image[y1:y2, x1:x2, :]
        _, buffer = cv2.imencode('.jpg', cropped)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        
        image_id = f"{timestamp}_{idx + 1}"
        
        payload = {
            "image_id": image_id,
            "prediction": labels[label],
            "confidence": float(round(score, 6)),
            "image_data": img_base64
        }
        client.publish(TOPIC_INFERENCE, json.dumps(payload))
        print(f"[MQTT] Sent detection: Object {idx + 1} - prediction: {payload['prediction']} - confidence: ({payload['confidence']})")
        # print(f"[MQTT] Sent detection: {payload['prediction']} ({payload['confidence']})")
        

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
            
        if temp is None:
            temp = 0.0
        if hum is None:
            hum = 0.0
            
        light_value = 0.0
        # light_value = light.read_light_sensor()
        # print(f"Light detected: {light_value}")

        if soil_channel.value < 20000:
            print("Soil dry! Turning pump ON")
            pump.pump_relay.value = True
        else:
            print("Soil wet enough. Turning pump OFF")
            pump.pump_relay.value = False

        payload = {
            "temp": temp,
            "humidity": hum,
            "moisture": soil_value,
            "light": float(light_value)
        }
        client.publish(TOPIC_SENSOR, json.dumps(payload))
        print(f"[MQTT] Sent sensor data: {payload}")
        print("-" * 30)
        time.sleep(2)

# def sensor_thread():
#     global sensor_intervals
#     while True:
#         if not sensor_intervals:
#             print("[WAIT] No sensor settings received. Skipping...")
#             time.sleep(2)
#             continue

#         soil_value = soil_channel.value
#         soil_voltage = soil_channel.voltage
#         print(f"Soil: {soil_value}, Voltage: {soil_voltage:.2f} V")

#         try:
#             temp = dht.dht_device.temperature
#             hum = dht.dht_device.humidity
#             if temp is None:
#                 temp = 0.0
#             if hum is None:
#                 hum = 0.0
#         except Exception as e:
#             print("DHT read error:", e)
#             temp = None
#             hum = None

#         try:
#             light_value = light.read_light_sensor()
#         except Exception as e:
#             print("Light sensor read error:", e)
#             light_value = None

#         if None in (temp, hum, light_value):
#             print("[WARNING] Missing sensor data, skipping publish...")
#         else:
#             if soil_value < 20000:
#                 print("Soil dry! Turning pump ON")
#                 pump.pump_relay.value = True
#             else:
#                 print("Soil wet enough. Turning pump OFF")
#                 pump.pump_relay.value = False

#             payload = {
#                 "temp": temp,
#                 "humidity": hum,
#                 "moisture": soil_value,
#                 "light": float(light_value)
#             }
#             client.publish(TOPIC_SENSOR, json.dumps(payload))
#             print(f"[MQTT] Sent sensor data: {payload}")

#         print("-" * 30)
#         time.sleep(sensor_intervals.get("temp_humidity_interval", 60))  # mặc định nếu thiếu

#     while True:
#         now = time.time()
#         payload = {}

#         # --- Soil moisture ---
#         if now - last_readings["soil_moisture"] >= sensor_intervals["soil_moisture_interval"]:
#             soil_value = soil_channel.value
#             soil_voltage = soil_channel.voltage
#             print(f"Soil: {soil_value}, Voltage: {soil_voltage:.2f} V")
#             payload["moisture"] = soil_value
#             last_readings["soil_moisture"] = now

#             if soil_value < 20000:
#                 print("Soil dry! Turning pump ON")
#                 pump.pump_relay.value = True
#             else:
#                 print("Soil wet enough. Turning pump OFF")
#                 pump.pump_relay.value = False

#         # --- Temp & Humidity ---
#         if now - last_readings["temp_humidity"] >= sensor_intervals["temp_humidity_interval"]:
#             try:
#                 temp = dht.dht_device.temperature
#                 hum = dht.dht_device.humidity
#                 print(f"Temp: {temp}°C   Humidity: {hum}%")
#                 payload["temp"] = temp
#                 payload["humidity"] = hum
#                 last_readings["temp_humidity"] = now
#             except Exception as e:
#                 print("DHT read error:", e)

#         # --- Light intensity ---
#         if now - last_readings["light_intensity"] >= sensor_intervals["light_intensity_interval"]:
#             light_value = light.read_light_sensor()
#             print(f"Light detected: {light_value}")
#             payload["light"] = float(light_value)
#             last_readings["light_intensity"] = now

#         # --- Water level (bổ sung nếu có cảm biến nước) ---
#         # if now - last_readings["water_level"] >= sensor_intervals["water_level_interval"]:
#             # Ví dụ: water_level = read_water_sensor()
#             # payload["water_level"] = water_level
#             # last_readings["water_level"] = now

#         if payload:
#             client.publish(TOPIC_SENSOR, json.dumps(payload))
#             print(f"[MQTT] Sent sensor data: {payload}")
#             print("-" * 30)

#         time.sleep(1)


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