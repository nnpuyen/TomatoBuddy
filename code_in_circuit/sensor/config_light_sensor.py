import RPi.GPIO as GPIO

# ========== CONFIGURATION ==========
LIGHT_SENSOR_PIN = 27  # GPIO27 (Pin 13)

def setup_light_sensor():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LIGHT_SENSOR_PIN, GPIO.IN)

def read_light_sensor() -> bool:
    """
    Returns True if light is detected (day), False if dark (night)
    """
    return GPIO.input(LIGHT_SENSOR_PIN) == 1

def cleanup():
    GPIO.cleanup(LIGHT_SENSOR_PIN)