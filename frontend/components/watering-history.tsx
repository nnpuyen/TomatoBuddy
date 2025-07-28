"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CheckCircle, X, Loader2, AlertTriangle, RefreshCw, Droplets } from "lucide-react"

interface WateringEvent {
  _id: string
  mode: "auto" | "manual"
  timestamp: string
  duration: number
}

interface ApiFilters {
  limit: number
  skip: number
  mode?: string
  start_date?: string
  end_date?: string
}

export default function WateringHistory() {
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ApiFilters>({
    limit: 50,
    skip: 0,
  })
  const [localFilters, setLocalFilters] = useState({
    mode: "all",
    startDate: "",
    endDate: "",
  })

  const fetchWateringEvents = async (currentFilters: ApiFilters = filters) => {
    try {
      setError(null)
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("limit", currentFilters.limit.toString())
      params.append("skip", currentFilters.skip.toString())

      if (currentFilters.mode && currentFilters.mode !== "all") {
        params.append("mode", currentFilters.mode)
      }
      if (currentFilters.start_date) {
        params.append("start_date", currentFilters.start_date)
      }
      if (currentFilters.end_date) {
        params.append("end_date", currentFilters.end_date)
      }

      const response = await fetch(`http://localhost:8000/api/data/watering?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: WateringEvent[] = await response.json()
      setWateringEvents(data)
    } catch (err) {
      console.error("Failed to fetch watering events:", err)
      setError("⚠️ Failed to fetch watering history. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWateringEvents()
  }, [])

  const handleApplyFilters = () => {
    const newFilters: ApiFilters = {
      limit: 50,
      skip: 0,
    }

    if (localFilters.mode !== "all") {
      newFilters.mode = localFilters.mode
    }

    if (localFilters.startDate) {
      newFilters.start_date = new Date(localFilters.startDate).toISOString()
    }

    if (localFilters.endDate) {
      // Set end date to end of day
      const endDate = new Date(localFilters.endDate)
      endDate.setHours(23, 59, 59, 999)
      newFilters.end_date = endDate.toISOString()
    }

    setFilters(newFilters)
    fetchWateringEvents(newFilters)
  }

  const handleRefresh = () => {
    fetchWateringEvents()
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return {
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString(),
      }
    } catch (err) {
      return { time: "--:--", date: "Invalid Date" }
    }
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration}s`
    } else if (duration < 3600) {
      return `${Math.round(duration / 60)}min`
    } else {
      return `${Math.round(duration / 3600)}h ${Math.round((duration % 3600) / 60)}min`
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "auto":
        return "bg-blue-100 text-blue-700"
      case "manual":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSuccessIcon = (mode: string) => {
    // For demo purposes, we'll show success for most events
    // In real implementation, this would come from the API
    return Math.random() > 0.2 ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : (
      <X className="w-6 h-6 text-red-500" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From date</label>
              <Input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To date</label>
              <Input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Watering mode</label>
              <Select
                value={localFilters.mode}
                onValueChange={(value) => setLocalFilters((prev) => ({ ...prev, mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleApplyFilters} className="bg-blue-500 hover:bg-blue-600" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Apply filter
              </Button>
            </div>
            <div>
              <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && wateringEvents.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading watering history...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && wateringEvents.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Droplets className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No watering events found</p>
              <p className="text-sm">Try adjusting your filters or check back later.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      {!error && wateringEvents.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Watering mode</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wateringEvents.map((event) => {
                    const formattedTime = formatTimestamp(event.timestamp)
                    return (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{formattedTime.time}</div>
                            <div className="text-sm text-gray-500">{formattedTime.date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getModeColor(event.mode)}>
                            {event.mode.charAt(0).toUpperCase() + event.mode.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium">{formatDuration(event.duration)}</td>
                        <td className="px-6 py-4">{getSuccessIcon(event.mode)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination/Load More */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {wateringEvents.length} events
                  {localFilters.mode !== "all" && ` (${localFilters.mode} mode)`}
                  {localFilters.startDate && ` from ${new Date(localFilters.startDate).toLocaleDateString()}`}
                  {localFilters.endDate && ` to ${new Date(localFilters.endDate).toLocaleDateString()}`}
                </div>
                {wateringEvents.length === filters.limit && (
                  <Button
                    onClick={() => {
                      const newFilters = { ...filters, skip: filters.skip + filters.limit }
                      setFilters(newFilters)
                      fetchWateringEvents(newFilters)
                    }}
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Load More
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {!loading && !error && wateringEvents.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {wateringEvents.filter((e) => e.mode === "auto").length}
                </div>
                <div className="text-sm text-gray-600">Auto Events</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {wateringEvents.filter((e) => e.mode === "manual").length}
                </div>
                <div className="text-sm text-gray-600">Manual Events</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatDuration(wateringEvents.reduce((sum, e) => sum + e.duration, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
