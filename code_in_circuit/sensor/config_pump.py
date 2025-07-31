import board
import digitalio

# Relay điều khiển máy bơm (dùng GPIO17 / pin 11)
PUMP_RELAY_PIN = board.D17

# Cấu hình GPIO cho relay
pump_relay = digitalio.DigitalInOut(PUMP_RELAY_PIN)
pump_relay.direction = digitalio.Direction.OUTPUT

# Mặc định tắt bơm
pump_relay.value = False  # False = OFF, True = ON