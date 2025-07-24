import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Thermometer, Sun, Droplets, Waves, SettingsIcon } from "lucide-react"

export default function Settings() {
  const settingsData = [
    {
      icon: Camera,
      title: "Image Capture Interval",
      description: "Set how often the system captures an image of the leaves.",
      value: "120",
      unit: "minutes",
    },
    {
      icon: Thermometer,
      title: "Temperature and Humidity Reading Interval",
      description: "Set how often the system reads temperature and humidity data.",
      value: "15",
      unit: "minutes",
    },
    {
      icon: Sun,
      title: "Light Intensity Reading Interval",
      description: "Set how often the system reads light intensity data.",
      value: "15",
      unit: "minutes",
    },
    {
      icon: Droplets,
      title: "Soil Moisture Reading Interval",
      description: "Set how often the system reads soil moisture data.",
      value: "15",
      unit: "minutes",
    },
    {
      icon: Waves,
      title: "Water Level Reading Interval",
      description: "Set how often the system reads water leveldata.",
      value: "15",
      unit: "minutes",
    },
  ]

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
                  <Input type="number" value={setting.value} className="w-20 text-center" readOnly />
                  <span className="text-gray-600 font-medium">{setting.unit}</span>
                </div>
              </div>
            )
          })}

          <div className="flex justify-end pt-6">
            <Button className="bg-pink-500 hover:bg-pink-600 px-8">Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
