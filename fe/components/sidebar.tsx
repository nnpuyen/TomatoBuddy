"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Thermometer, Droplets, Sun, Loader2, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface SensorData {
  _id: string
  temperature: number
  humidity: number
  moisture: number
  light: number
  water_level: number
  timestamp: string
}

export default function Sidebar() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSensorData = async () => {
    try {
      setError(null)
      const response = await fetch("http://localhost:8000/api/data/sensors/latest")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SensorData = await response.json()
      setSensorData(data)
    } catch (err) {
      console.error("Failed to fetch sensor data:", err)
      setError("⚠️ Failed to fetch sensor data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchSensorData()

    // Set up interval to refresh every 10 seconds
    const interval = setInterval(fetchSensorData, 10000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch (err) {
      return timestamp
    }
  }

  return (
    <div className="w-96 p-6 space-y-6">
      {/* Plant Image */}
      <div className="relative">
        <Image src="/plant-image.png" alt="Tomato Plant" width={350} height={250} className="rounded-lg object-cover" />
      </div>

      {/* Health Status Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-500">Health Status</h3>
              <p className="text-green-500 font-medium">Healthy</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Disease detected</span>
              <span className="font-semibold">NONE</span>
            </div>
            <hr className="border-gray-200" />
            <div>
              <p className="text-gray-600 mb-2">Recommendation</p>
              <p className="font-medium">Maintain proper watering</p>
            </div>
          </div>
          {sensorData && (
            <p className="text-gray-400 text-sm mt-4">Last updated: {formatTimestamp(sensorData.timestamp)}</p>
          )}
        </CardContent>
      </Card>

      {/* Current Environment Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-500">Current Environment</h3>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          {error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">Temperature:</span>
                </div>
                <span className="font-semibold">{sensorData ? `${sensorData.temperature.toFixed(1)}°C` : "--°C"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">Humidity:</span>
                </div>
                <span className="font-semibold">{sensorData ? `${sensorData.humidity.toFixed(1)}%` : "--%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-500">Moisture:</span>
                </div>
                <span className="font-semibold">{sensorData ? `${sensorData.moisture.toFixed(1)}%` : "--%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500">Light:</span>
                </div>
                <span className="font-semibold">{sensorData ? `${sensorData.light.toFixed(1)}%` : "--%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-blue-500">Water Level:</span>
                </div>
                <span className="font-semibold">{sensorData ? `${sensorData.water_level}ml` : "--ml"}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
