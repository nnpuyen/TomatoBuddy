"use client"

import Image from "next/image"
import { Thermometer, Droplets, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Sidebar() {
  return (
    <div className="w-80 bg-white p-6 space-y-6">
      <div className="relative">
        <Image
          src="/images/demo.jpg"
          alt="Tomato Plant"
          width={300}
          height={200}
          className="rounded-lg object-cover"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-500 text-sm">🏥</span>
            </div>
            <span className="text-pink-500">Health Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-xs">✓</span>
            </div>
            <span className="text-green-500 font-medium">Healthy</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Disease detected</span>
              <span className="font-medium">NONE</span>
            </div>
            <hr />
            <div>
              <div className="text-gray-600 mb-1">Recommendation</div>
              <div className="font-medium">Maintain proper watering</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t">Captured at 8:00 on June 16th 2025</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-green-500">Current Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Temperature:</span>
            </div>
            <span className="font-medium">19°c</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Humidity:</span>
            </div>
            <span className="font-medium">50%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Light:</span>
            </div>
            <span className="font-medium">75%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
