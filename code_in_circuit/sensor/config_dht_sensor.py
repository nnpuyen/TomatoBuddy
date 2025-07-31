import board
import adafruit_dht

# GPIO sử dụng, ví dụ D4 (Pin 7)
DHT_PIN = board.D4

# Tạo đối tượng cảm biến
dht_device = adafruit_dht.DHT11(DHT_PIN)