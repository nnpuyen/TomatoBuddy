"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Droplets, Camera, CheckCircle, Edit } from "lucide-react"

const temperatureHumidityData = [
  { time: "00:00", temperature: 18, humidity: 45 },
  { time: "04:00", temperature: 17, humidity: 50 },
  { time: "08:00", temperature: 19, humidity: 48 },
  { time: "12:00", temperature: 22, humidity: 42 },
  { time: "16:00", temperature: 24, humidity: 38 },
  { time: "20:00", temperature: 21, humidity: 44 },
]

const moistureLightData = [
  { time: "00:00", moisture: 65, light: 0 },
  { time: "04:00", moisture: 62, light: 10 },
  { time: "08:00", moisture: 58, light: 45 },
  { time: "12:00", moisture: 55, light: 85 },
  { time: "16:00", moisture: 52, light: 75 },
  { time: "20:00", moisture: 60, light: 20 },
]

const weatherData = [
  { time: "18:00", temp: 19, precipitation: 30 },
  { time: "21:00", temp: 19, precipitation: 30 },
  { time: "00:00", temp: 19, precipitation: 30 },
  { time: "03:00", temp: 19, precipitation: 30 },
  { time: "06:00", temp: 19, precipitation: 30 },
  { time: "09:00", temp: 19, precipitation: 30 },
  { time: "12:00", temp: 19, precipitation: 30 },
  { time: "18:00", temp: 19, precipitation: 30 },
]

export function Dashboard() {
  const [wateringMode, setWateringMode] = useState<"auto" | "schedule">("auto")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Water Level */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(700 / 1400) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-500">700ml</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <div>0ml</div>
                <div className="font-medium text-blue-500">Water level</div>
                <div>1400ml</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moisture */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(50 / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-500">50%</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <div>0%</div>
                <div className="font-medium text-green-500">Moisture</div>
                <div>100%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watering Mode */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="text-sm text-blue-500 mb-2">Watering mode</div>
              <div className="flex space-x-2">
                <Button
                  variant={wateringMode === "auto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWateringMode("auto")}
                  className={wateringMode === "auto" ? "bg-blue-500" : ""}
                >
                  Auto
                </Button>
                <Button
                  variant={wateringMode === "schedule" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWateringMode("schedule")}
                  className={wateringMode === "schedule" ? "bg-green-500" : ""}
                >
                  Schedule
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm text-green-500 mb-2">Minimum moisture</div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-400">60%</span>
              </div>
              <Progress value={60} className="mt-2" />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-blue-500">
                <Droplets className="w-4 h-4 mr-1" />
                Remote watering
              </Button>
            </div>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <Camera className="w-4 h-4 mr-1" />
              Capture now
            </Button>
            <Button size="sm" className="w-full bg-green-500">
              <Camera className="w-4 h-4 mr-1" />
              Capture now
            </Button>
          </CardContent>
        </Card>

        {/* Watering Schedule */}
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-blue-500 mb-4">Watering schedule</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-500">07:00</div>
                  <div className="text-sm text-gray-500">300ml</div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-500">15:00</div>
                  <div className="text-sm text-gray-500">300ml</div>
                </div>
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature and Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500">Temperature and Humidity over the past</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={temperatureHumidityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#22c55e" name="Temperature" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Moisture and Light Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-500">Moisture and Light over the past</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moistureLightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="moisture" stroke="#3b82f6" name="Moisture" />
                <Line type="monotone" dataKey="light" stroke="#22c55e" name="Light Intensity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🌤️</span>
            <span>Weather Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="precipitation" fill="#3b82f6" name="Precipitation %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between items-center mt-4">
            {weatherData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium">{item.temp}°c</div>
                <div className="text-xs text-gray-500">{item.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
