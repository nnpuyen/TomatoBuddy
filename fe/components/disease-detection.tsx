"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Heart } from "lucide-react"

const imageData = [
  { id: 1, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 2, status: "Bacterial spot", date: "Captured at 8:00 on June 16th 2025", type: "disease" },
  { id: 3, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 4, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 5, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 6, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 7, status: "Spider mites", date: "Captured at 8:00 on June 16th 2025", type: "disease" },
  { id: 8, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 9, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 10, status: "Late blight", date: "Captured at 8:00 on June 16th 2025", type: "disease" },
  { id: 11, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
  { id: 12, status: "Healthy", date: "Captured at 8:00 on June 16th 2025", type: "healthy" },
]

export function DiseaseDetection() {
  const [fromDate, setFromDate] = useState("June 17th 2025")
  const [toDate, setToDate] = useState("June 17th 2025")
  const [healthStatus, setHealthStatus] = useState("All")

  const getStatusColor = (status: string) => {
    if (status === "Healthy") {
      return "border-green-200 bg-green-50"
    }
    return "border-pink-200 bg-pink-50"
  }

  const getStatusIcon = (status: string) => {
    if (status === "Healthy") {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Heart className="w-4 h-4 text-pink-500" />
  }

  const getStatusTextColor = (status: string) => {
    if (status === "Healthy") {
      return "text-green-600"
    }
    return "text-pink-600"
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">From date</label>
              <Select value={fromDate} onValueChange={setFromDate}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="June 17th 2025">June 17th 2025</SelectItem>
                  <SelectItem value="June 16th 2025">June 16th 2025</SelectItem>
                  <SelectItem value="June 15th 2025">June 15th 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To date</label>
              <Select value={toDate} onValueChange={setToDate}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="June 17th 2025">June 17th 2025</SelectItem>
                  <SelectItem value="June 16th 2025">June 16th 2025</SelectItem>
                  <SelectItem value="June 15th 2025">June 15th 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Health status</label>
              <Select value={healthStatus} onValueChange={setHealthStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Disease">Disease Detected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-400 hover:bg-blue-500">Apply filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {imageData.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${getStatusColor(item.status)}`}>
            <div className="aspect-square relative">
              <Image src="/images/demo.jpg" alt="Plant Image" fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(item.status)}
                <span className={`font-medium ${getStatusTextColor(item.status)}`}>{item.status}</span>
              </div>
              <p className="text-xs text-gray-500">{item.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
