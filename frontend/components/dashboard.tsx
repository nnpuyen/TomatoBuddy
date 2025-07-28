"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Droplets, Camera, CheckCircle, Edit } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

interface SensorData {
  _id: string
  temperature: number
  humidity: number
  moisture: number
  light: number
  water_level: number
  timestamp: string
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)

  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/data/sensors/latest")
      if (response.ok) {
        const data: SensorData = await response.json()
        setSensorData(data)
      }
    } catch (err) {
      console.error("Failed to fetch sensor data:", err)
    }
  }

  useEffect(() => {
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 10000)
    return () => clearInterval(interval)
  }, [])

  const waterLevelPercentage = sensorData ? Math.min((sensorData.water_level / 1400) * 100, 100) : 50
  const moisturePercentage = sensorData ? sensorData.moisture : 50

  // Sample data for Temperature and Humidity chart
  const tempHumidityData = [
    { time: "00:00", temperature: 18, humidity: 65 },
    { time: "02:00", temperature: 17, humidity: 68 },
    { time: "04:00", temperature: 16, humidity: 70 },
    { time: "06:00", temperature: 18, humidity: 65 },
    { time: "08:00", temperature: 22, humidity: 55 },
    { time: "10:00", temperature: 25, humidity: 50 },
    { time: "12:00", temperature: 28, humidity: 45 },
    { time: "14:00", temperature: 30, humidity: 40 },
    { time: "16:00", temperature: 28, humidity: 45 },
    { time: "18:00", temperature: 25, humidity: 50 },
    { time: "20:00", temperature: 22, humidity: 55 },
    { time: "22:00", temperature: 20, humidity: 60 },
  ]

  // Sample data for Moisture and Light chart
  const moistureLightData = [
    { time: "00:00", moisture: 65, light: 0 },
    { time: "02:00", moisture: 63, light: 0 },
    { time: "04:00", moisture: 61, light: 0 },
    { time: "06:00", moisture: 58, light: 20 },
    { time: "08:00", moisture: 55, light: 45 },
    { time: "10:00", moisture: 52, light: 70 },
    { time: "12:00", moisture: 48, light: 85 },
    { time: "14:00", moisture: 45, light: 90 },
    { time: "16:00", moisture: 42, light: 75 },
    { time: "18:00", moisture: 40, light: 50 },
    { time: "20:00", moisture: 38, light: 25 },
    { time: "22:00", moisture: 36, light: 5 },
  ]

  return (
    <div className="space-y-6">
      {/* Top Row - Water Level, Moisture, Controls, Schedule */}
      <div className="grid grid-cols-4 gap-6">
        {/* Water Level */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${waterLevelPercentage * 2.51} ${100 * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">{sensorData ? `${sensorData.water_level}ml` : "700ml"}</span>
                  <span className="text-xs text-gray-500">0ml</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">1400ml</p>
              <p className="font-semibold text-blue-500">Water level</p>
            </div>
          </CardContent>
        </Card>

        {/* Moisture */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${moisturePercentage * 2.51} ${100 * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-green-500">
                    {sensorData ? `${sensorData.moisture.toFixed(0)}%` : "50%"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0%</span>
                <span>100%</span>
              </div>
              <p className="font-semibold text-green-500">Moisture</p>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-500">Watering mode</span>
                <span className="text-sm font-medium text-green-500">Minimum moisture</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <Droplets className="w-6 h-6 text-blue-500" />
                <span className="text-2xl font-bold text-blue-500">60%</span>
              </div>
              <div className="flex space-x-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Auto
                </Badge>
                <Badge variant="outline">Schedule</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Droplets className="w-4 h-4 mr-1" />
                Remote watering
              </Button>
              <Button size="sm" variant="outline">
                Capture now
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                <Camera className="w-4 h-4 mr-1" />
                Capture image
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                Capture now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Watering Schedule */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-500 mb-4">Watering schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-500">07:00</p>
                  <p className="text-sm text-gray-600">300ml</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-500">15:00</p>
                  <p className="text-sm text-gray-600">300ml</p>
                </div>
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Temperature and Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500">Temperature and Humidity over the past</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temperature: {
                  label: "Temperature",
                  color: "hsl(142, 76%, 36%)",
                },
                humidity: {
                  label: "Humidity",
                  color: "hsl(217, 91%, 60%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempHumidityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="var(--color-temperature)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-temperature)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="var(--color-humidity)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-humidity)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moisture and Light Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-500">Moisture and Light over the past</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                moisture: {
                  label: "Moisture",
                  color: "hsl(217, 91%, 60%)",
                },
                light: {
                  label: "Light Intensity",
                  color: "hsl(142, 76%, 36%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moistureLightData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="moisture"
                    stroke="var(--color-moisture)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-moisture)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="light"
                    stroke="var(--color-light)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-light)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Moisture</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Light Intensity</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-500 flex items-center">
            <span className="mr-2">🌤️</span>
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            {[
              { time: "18:00", temp: "19°c", rain: "30%" },
              { time: "21:00", temp: "19°c", rain: "30%" },
              { time: "00:00", temp: "19°c", rain: "30%" },
              { time: "03:00", temp: "19°c", rain: "30%" },
              { time: "06:00", temp: "19°c", rain: "30%" },
              { time: "09:00", temp: "19°c", rain: "30%" },
              { time: "12:00", temp: "19°c", rain: "30%" },
              { time: "18:00", temp: "19°c", rain: "30%" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-600 mb-2">{item.temp}</div>
                <div className="w-12 h-16 bg-blue-500 rounded-t-lg mb-2"></div>
                <div className="text-sm text-gray-600 mb-1">{item.rain}</div>
                <div className="text-sm font-medium">{item.time}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-4 mt-4 text-sm text-gray-600">
            <span>Temperature</span>
            <span>Probability of Precipitation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
