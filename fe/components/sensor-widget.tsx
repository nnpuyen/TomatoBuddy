"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sun, Loader2, AlertTriangle, Waves } from "lucide-react"

interface SensorData {
  _id: string
  temperature: number
  humidity: number
  moisture: number
  light: number
  water_level: number
  timestamp: string
}

interface SensorWidgetProps {
  title?: string
  showTimestamp?: boolean
  refreshInterval?: number
  className?: string
}

export default function SensorWidget({
  title = "Sensor Readings",
  showTimestamp = true,
  refreshInterval = 10000,
  className = "",
}: SensorWidgetProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSensorData = async () => {
    try {
      setError(null)
      const response = await fetch("http://localhost:8000/api/data/sensors/latest")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SensorData = await response.json()
      setSensorData(data)
      setLastUpdated(new Date())
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

    // Set up interval to refresh
    const interval = setInterval(fetchSensorData, refreshInterval)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [refreshInterval])

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch (err) {
      return timestamp
    }
  }

  const sensorItems = [
    {
      icon: Thermometer,
      label: "Temperature",
      value: sensorData ? `${sensorData.temperature.toFixed(1)}°C` : "--°C",
      color: "text-red-500",
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: sensorData ? `${sensorData.humidity.toFixed(1)}%` : "--%",
      color: "text-blue-500",
    },
    {
      icon: Droplets,
      label: "Soil Moisture",
      value: sensorData ? `${sensorData.moisture.toFixed(1)}%` : "--%",
      color: "text-green-500",
    },
    {
      icon: Sun,
      label: "Light Level",
      value: sensorData ? `${sensorData.light.toFixed(1)}%` : "--%",
      color: "text-yellow-500",
    },
    {
      icon: Waves,
      label: "Water Level",
      value: sensorData ? `${sensorData.water_level}ml` : "--ml",
      color: "text-cyan-500",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchSensorData}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sensorItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className={`${item.color} font-medium`}>{item.label}:</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              )
            })}

            {showTimestamp && sensorData && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Sensor Reading:</span>
                  <span>{formatTimestamp(sensorData.timestamp)}</span>
                </div>
                {lastUpdated && (
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                    <span>Last Updated:</span>
                    <span>{lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
