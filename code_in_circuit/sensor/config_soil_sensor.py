# config_soil_sensor.py
import board
import adafruit_mcp3xxx.mcp3008 as MCP

# SPI pins cho MCP3008 (dùng chung cho các cảm biến analog)
SOIL_SPI_CLK = board.SCK
SOIL_SPI_MISO = board.MISO
SOIL_SPI_MOSI = board.MOSI
SOIL_SPI_CS = board.D8

# MCP3008 analog channel dành riêng cho Soil sensor
SOIL_SENSOR_CHANNEL = MCP.P0
