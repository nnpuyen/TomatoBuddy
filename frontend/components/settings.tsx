"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Thermometer, Sun, Droplets, Waves, SettingsIcon } from "lucide-react"

interface Settings {
  image_capture_interval: number
  temp_humidity_interval: number
  light_intensity_interval: number
  soil_moisture_interval: number
  water_level_interval: number
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    image_capture_interval: 720, // Default to 12 hours
    temp_humidity_interval: 360,
    light_intensity_interval: 360,
    soil_moisture_interval: 360,
    water_level_interval: 720
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("http://localhost:8000/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }))
  }

  const settingsData = [
    {
      icon: Camera,
      title: "Image Capture Interval",
      description: "Set how often the system captures an image of the leaves.",
      field: "image_capture_interval" as keyof Settings,
      unit: "minutes",
    },
    {
      icon: Thermometer,
      title: "Temperature and Humidity Reading Interval",
      description: "Set how often the system reads temperature and humidity data.",
      field: "temp_humidity_interval" as keyof Settings,
      unit: "minutes",
    },
    {
      icon: Sun,
      title: "Light Intensity Reading Interval",
      description: "Set how often the system reads light intensity data.",
      field: "light_intensity_interval" as keyof Settings,
      unit: "minutes",
    },
    {
      icon: Droplets,
      title: "Soil Moisture Reading Interval",
      description: "Set how often the system reads soil moisture data.",
      field: "soil_moisture_interval" as keyof Settings,
      unit: "minutes",
    },
    {
      icon: Waves,
      title: "Water Level Reading Interval",
      description: "Set how often the system reads water level data.",
      field: "water_level_interval" as keyof Settings,
      unit: "minutes",
    },
  ]

  if (loading) return <div>Loading settings...</div>

  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-700">
            <SettingsIcon className="w-6 h-6" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {settingsData.map((setting, index) => {
            const Icon = setting.icon
            return (
              <div key={index} className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{setting.title}</h3>
                  <p className="text-gray-600 text-sm">{setting.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    value={settings[setting.field]} 
                    onChange={(e) => handleInputChange(setting.field, e.target.value)}
                    className="w-20 text-center" 
                  />
                  <span className="text-gray-600 font-medium">{setting.unit}</span>
                </div>
              </div>
            )
          })}

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-pink-500 hover:bg-pink-600 px-8"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
