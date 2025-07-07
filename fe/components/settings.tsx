"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Thermometer, Sun, Droplets, Waves, SettingsIcon } from "lucide-react"

export function Settings() {
  const [imageCaptureInterval, setImageCaptureInterval] = useState("120")
  const [tempHumidityInterval, setTempHumidityInterval] = useState("15")
  const [lightIntensityInterval, setLightIntensityInterval] = useState("15")
  const [soilMoistureInterval, setSoilMoistureInterval] = useState("15")
  const [waterLevelInterval, setWaterLevelInterval] = useState("15")

  const handleSave = () => {
    // Handle save logic here
    console.log("Settings saved:", {
      imageCaptureInterval,
      tempHumidityInterval,
      lightIntensityInterval,
      soilMoistureInterval,
      waterLevelInterval,
    })
  }

  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Image Capture Interval */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Image Capture Interval</h3>
                <p className="text-sm text-gray-600">Set how often the system captures an image of the leaves.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={imageCaptureInterval}
                onChange={(e) => setImageCaptureInterval(e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Temperature and Humidity Reading Interval */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Temperature and Humidity Reading Interval</h3>
                <p className="text-sm text-gray-600">Set how often the system reads temperature and humidity data.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={tempHumidityInterval}
                onChange={(e) => setTempHumidityInterval(e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Light Intensity Reading Interval */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Sun className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Light Intensity Reading Interval</h3>
                <p className="text-sm text-gray-600">Set how often the system reads light intensity data.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={lightIntensityInterval}
                onChange={(e) => setLightIntensityInterval(e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Soil Moisture Reading Interval */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Soil Moisture Reading Interval</h3>
                <p className="text-sm text-gray-600">Set how often the system reads soil moisture data.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={soilMoistureInterval}
                onChange={(e) => setSoilMoistureInterval(e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Water Level Reading Interval */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Water Level Reading Interval</h3>
                <p className="text-sm text-gray-600">Set how often the system reads water leveldata.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={waterLevelInterval}
                onChange={(e) => setWaterLevelInterval(e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <Button onClick={handleSave} className="bg-pink-400 hover:bg-pink-500">
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
