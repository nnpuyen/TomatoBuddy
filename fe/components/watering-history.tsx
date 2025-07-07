"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, X } from "lucide-react"

const wateringData = [
  {
    time: "07:00",
    date: "June 17 2025",
    mode: "Auto",
    amount: "300ml",
    moisture: "70%",
    result: "success",
  },
  {
    time: "07:00",
    date: "June 17 2025",
    mode: "Schedule",
    amount: "300ml",
    moisture: "70%",
    result: "failed",
  },
  {
    time: "07:00",
    date: "June 17 2025",
    mode: "Remote",
    amount: "300ml",
    moisture: "70%",
    result: "failed",
  },
  {
    time: "07:00",
    date: "June 17 2025",
    mode: "Auto",
    amount: "300ml",
    moisture: "70%",
    result: "success",
  },
  {
    time: "07:00",
    date: "June 17 2025",
    mode: "Auto",
    amount: "300ml",
    moisture: "70%",
    result: "success",
  },
]

export function WateringHistory() {
  const [fromDate, setFromDate] = useState("June 17th 2025")
  const [toDate, setToDate] = useState("June 17th 2025")
  const [wateringMode, setWateringMode] = useState("All")
  const [result, setResult] = useState("All")

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "Auto":
        return "bg-blue-100 text-blue-700"
      case "Schedule":
        return "bg-green-100 text-green-700"
      case "Remote":
        return "bg-pink-100 text-pink-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
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
              <label className="text-sm font-medium">Watering mode</label>
              <Select value={wateringMode} onValueChange={setWateringMode}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Schedule">Schedule</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-blue-400 hover:bg-blue-500">Apply filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Watering History Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Watering mode</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Watering amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Post-watering soil moisture</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wateringData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{item.time}</div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getModeColor(item.mode)}>{item.mode}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.amount}</td>
                    <td className="px-6 py-4 font-medium">{item.moisture}</td>
                    <td className="px-6 py-4">
                      {item.result === "success" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t">
            <Button variant="outline">Next page</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
