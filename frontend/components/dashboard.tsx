"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Droplets, Camera, CheckCircle, Edit, Gauge, Thermometer, Sun } from 'lucide-react' // Added Gauge icon
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
  const [forecast, setForecast] = useState<{ time: string; temp: string; rain: string }[]>([])

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

  const fetchWeatherForecast = async () => {
    try {
      const lat = 10.762622 // TPHCM
      const lon = 106.660172
      const apiKey = "4bc1f51cc708a0e3380dfb50a2fc88a8"
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
      )
      if (response.ok) {
        const data = await response.json()
        const today = new Date().toISOString().split("T")[0]
        const todayForecast = data.list
          .filter((item: any) => item.dt_txt.startsWith(today))
          .slice(0, 8) // Limit to 8 entries
          .map((item: any) => ({
            time: item.dt_txt.split(" ")[1].slice(0, 5),
            temp: `${Math.round(item.main.temp)}°C`,
            rain: `${Math.round((item.pop || 0) * 100)}%`,
          }))
        setForecast(todayForecast)
      } else {
        console.error("Weather API error:", response.status)
        // Set fallback data
        setForecast([
          { time: "Now", temp: "28°C", rain: "20%" },
          { time: "+3h", temp: "30°C", rain: "15%" },
          { time: "+6h", temp: "32°C", rain: "10%" },
          { time: "+9h", temp: "29°C", rain: "25%" },
        ])
      }
    } catch (err) {
      console.error("Failed to fetch weather forecast:", err)
      // Set fallback data on error
      setForecast([
        { time: "Now", temp: "28°C", rain: "20%" },
        { time: "+3h", temp: "30°C", rain: "15%" },
        { time: "+6h", temp: "32°C", rain: "10%" },
        { time: "+9h", temp: "29°C", rain: "25%" },
      ])
    }
  }

  useEffect(() => {
    fetchSensorData()
    fetchWeatherForecast()
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

  const handleCaptureNow = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/commands/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "capture" }),
      })
      if (response.ok) {
        console.log("Capture command sent successfully")
      } else {
        console.error("Failed to send capture command")
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleWateringNow = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/commands/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "water", duration: 5 }),
      })
      if (response.ok) {
        console.log("Watering command sent successfully")
      } else {
        console.error("Failed to send watering command")
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

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
        <Card className="col-span-1 flex flex-col justify-center items-center p-6">
          <div className="grid grid-cols-1 gap-4 w-full">
            <Button
              className="h-24 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg flex flex-col items-center justify-center rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              onClick={handleWateringNow}
            >
              <Droplets className="w-8 h-8 mb-2" />
              <span>Water Now</span>
            </Button>
            <Button
              className="h-24 bg-green-500 hover:bg-green-600 text-white font-bold text-lg flex flex-col items-center justify-center rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              onClick={handleCaptureNow}
            >
              <Camera className="w-8 h-8 mb-2" />
              <span>Capture Image</span>
            </Button>
          </div>
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
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <CardTitle className="text-green-700 flex items-center space-x-2">
              <Thermometer className="w-5 h-5" />
              <span>Temperature and Humidity over the past</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temperature: {
                  label: "Temperature",
                  color: "hsl(142, 76%, 36%)", // Green
                },
                humidity: {
                  label: "Humidity",
                  color: "hsl(217, 91%, 60%)", // Blue
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tempHumidityData}
                  margin={{
                    left: -10,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 5)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]} // Set domain for Y-axis
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="temperature"
                    type="monotone"
                    stroke="var(--color-temperature)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-temperature)",
                      stroke: "var(--color-temperature)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-temperature)",
                      stroke: "var(--color-temperature)",
                    }}
                  />
                  <Line
                    dataKey="humidity"
                    type="monotone"
                    stroke="var(--color-humidity)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-humidity)",
                      stroke: "var(--color-humidity)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-humidity)",
                      stroke: "var(--color-humidity)",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Thermometer className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Droplets className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moisture and Light Chart */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="text-blue-700 flex items-center space-x-2">
              <Droplets className="w-5 h-5" />
              <span>Moisture and Light over the past</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                moisture: {
                  label: "Moisture",
                  color: "hsl(217, 91%, 60%)", // Blue
                },
                light: {
                  label: "Light Intensity",
                  color: "hsl(142, 76%, 36%)", // Green
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={moistureLightData}
                  margin={{
                    left: -10,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 5)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 100]} // Set domain for Y-axis
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="moisture"
                    type="monotone"
                    stroke="var(--color-moisture)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-moisture)",
                      stroke: "var(--color-moisture)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-moisture)",
                      stroke: "var(--color-moisture)",
                    }}
                  />
                  <Line
                    dataKey="light"
                    type="monotone"
                    stroke="var(--color-light)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-light)",
                      stroke: "var(--color-light)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-light)",
                      stroke: "var(--color-light)",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Thermometer className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Droplets className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Forecast */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌤️</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Weather Forecast</h3>
                <p className="text-blue-100 text-sm">Ho Chi Minh City • Today</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{forecast.length > 0 ? forecast[0].temp : "28°C"}</div>
              <div className="text-blue-100 text-sm">Current</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gradient-to-b from-blue-50 to-white p-6">
            {forecast.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {forecast.slice(0, 4).map((item, index) => {
                  const precipitationValue = Number.parseInt(item.rain.replace("%", ""))
                  const tempValue = Number.parseInt(item.temp.replace("°C", ""))
                  const barHeight = Math.max(20, (precipitationValue / 100) * 60)

                  // Determine weather icon based on precipitation
                  const getWeatherIcon = (rain: number, temp: number) => {
                    if (rain > 70) return "🌧️"
                    if (rain > 40) return "⛅"
                    if (rain > 20) return "🌤️"
                    if (temp > 32) return "☀️"
                    return "🌞"
                  }

                  const getTimeLabel = (time: string, index: number) => {
                    if (index === 0) return "Now"
                    if (time.includes(":")) return time
                    return `+${index * 3}h`
                  }

                  return (
                    <div
                      key={index}
                      className="text-center group hover:bg-white/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg"
                    >
                      {/* Time */}
                      <div className="text-sm font-semibold text-gray-600 mb-2">{getTimeLabel(item.time, index)}</div>

                      {/* Weather Icon */}
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {getWeatherIcon(precipitationValue, tempValue)}
                      </div>

                      {/* Temperature */}
                      <div className="text-xl font-bold text-gray-800 mb-2">{item.temp}</div>

                      {/* Precipitation Bar */}
                      <div className="flex flex-col items-center mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${precipitationValue}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">{item.rain}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center justify-center space-x-1">
                          <span>💨</span>
                          <span>{Math.floor(Math.random() * 10 + 5)} km/h</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span>💧</span>
                          <span>{Math.floor(Math.random() * 20 + 60)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading weather forecast...</p>
                </div>
              </div>
            )}
          </div>

          {/* Weather Summary */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">Precipitation</span>
                <span className="text-sm font-semibold text-gray-800">
                  {forecast.length > 0
                    ? `${Math.round(forecast.slice(0, 4).reduce((acc, item) => acc + Number.parseInt(item.rain), 0) / 4)}% avg`
                    : "15% avg"}
                </span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">🌡️</span>
                </div>
                <span className="text-xs text-gray-600">Temperature</span>
                <span className="text-sm font-semibold text-gray-800">
                  {forecast.length > 0
                    ? `${Math.round(forecast.slice(0, 4).reduce((acc, item) => acc + Number.parseInt(item.temp), 0) / 4)}°C avg`
                    : "29°C avg"}
                </span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🌱</span>
                </div>
                <span className="text-xs text-gray-600">Plant Care</span>
                <span className="text-sm font-semibold text-green-600">
                  {forecast.length > 0 && Number.parseInt(forecast[0].rain.replace("%", "")) > 50
                    ? "Reduce watering"
                    : "Normal care"}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Recommendations */}
          {forecast.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">💡</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Plant Care Recommendation</h4>
                  <p className="text-xs text-gray-600">
                    {(() => {
                      const avgRain =
                        forecast.slice(0, 4).reduce((acc, item) => acc + Number.parseInt(item.rain), 0) / 4
                      const avgTemp =
                        forecast.slice(0, 4).reduce((acc, item) => acc + Number.parseInt(item.temp), 0) / 4

                      if (avgRain > 60) {
                        return "High precipitation expected. Consider reducing watering schedule and ensure proper drainage."
                      } else if (avgTemp > 32) {
                        return "High temperatures ahead. Increase watering frequency and provide shade during peak hours."
                      } else if (avgRain < 20 && avgTemp > 28) {
                        return "Dry and warm conditions. Monitor soil moisture closely and water as needed."
                      } else {
                        return "Weather conditions are favorable. Maintain regular watering schedule."
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
