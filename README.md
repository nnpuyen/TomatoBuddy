# TomatoBuddy

A smart AIoT solution for monitoring and managing tomato plant growth.

## Team Members

| **Name**             | **Major**                                            | **University**                 |
|----------------------|------------------------------------------------------|--------------------------------|
| Quoc-Thang Nguyen         | Information Technology       | University of Science (VNUHCM) |
| Quang-Thang Duong         | Information Technology       | University of Science (VNUHCM) |
| Quynh-Huong Dinh-Nguyen   | Information Technology       | University of Science (VNUHCM) |
| Phuong-Uyen Nguyen-Ngoc   | Information Technology       | University of Science (VNUHCM) |


## Features

- Real-time sensor data collection
- Automated irrigation control
- Disease detection based on leaf images
- Plant care suggestion
- Web dashboard

## Start the simulation of the physical layer
- Go to https://wokwi.com/projects/432902105702275073 and start the simulation

## Installation, setup and run instruction
1. Clone the project from github
```sh
git clone https://github.com/22127446/TomatoBuddy.git
cd TomatoBuddy
```
2. Opne the .env file and paste your own MongoDB URI
```sh
MONGODB_URI = "PASTE THE URI HERE"
```
3. Install all dependencies
```sh
pip install -r requirements.txt
```
4. Run the FAST API server
```sh
uvicorn app.main:app --reload
```

## License

MIT License
