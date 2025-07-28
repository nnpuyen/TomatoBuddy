"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CheckCircle, Heart, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface ImageData {
  _id: string
  image_url: string
  prediction: string
  timestamp: string
}

interface ApiFilters {
  limit: number
  skip: number
  prediction?: string
  start_date?: string
  end_date?: string
}

export default function ImagesDetection() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ApiFilters>({
    limit: 20,
    skip: 0,
  })
  const [localFilters, setLocalFilters] = useState({
    prediction: "all",
    startDate: "",
    endDate: "",
  })

  const fetchImages = async (currentFilters: ApiFilters = filters) => {
    try {
      setError(null)
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("limit", currentFilters.limit.toString())
      params.append("skip", currentFilters.skip.toString())

      if (currentFilters.prediction && currentFilters.prediction !== "all") {
        params.append("prediction", currentFilters.prediction)
      }
      if (currentFilters.start_date) {
        params.append("start_date", currentFilters.start_date)
      }
      if (currentFilters.end_date) {
        params.append("end_date", currentFilters.end_date)
      }

      const response = await fetch(`http://localhost:8000/api/data/images?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ImageData[] = await response.json()
      setImages(data)
    } catch (err) {
      console.error("Failed to fetch images:", err)
      setError("⚠️ Failed to fetch image data. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleApplyFilters = () => {
    const newFilters: ApiFilters = {
      limit: 20,
      skip: 0,
    }

    if (localFilters.prediction !== "all") {
      newFilters.prediction = localFilters.prediction
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
    fetchImages(newFilters)
  }

  const handleRefresh = () => {
    fetchImages()
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch (err) {
      return timestamp
    }
  }

  const getStatusColor = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase()
    if (lowerPrediction.includes("healthy")) {
      return "border-green-500"
    } else {
      return "border-pink-500"
    }
  }

  const getStatusBadge = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase()
    if (lowerPrediction.includes("healthy")) {
      return (
        <Badge className="bg-green-100 text-green-700 flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>{prediction}</span>
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-pink-100 text-pink-700 flex items-center space-x-1">
          <Heart className="w-3 h-3" />
          <span>{prediction}</span>
        </Badge>
      )
    }
  }

  const predictionOptions = [
    { value: "all", label: "All" },
    { value: "Healthy", label: "Healthy" },
    { value: "Bacterial spot", label: "Bacterial Spot" },
    { value: "Spider mites", label: "Spider Mites" },
    { value: "Late blight", label: "Late Blight" },
    { value: "Diseased", label: "Diseased" },
  ]

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Health status</label>
              <Select
                value={localFilters.prediction}
                onValueChange={(value) => setLocalFilters((prev) => ({ ...prev, prediction: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {predictionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
      {loading && images.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading images...</p>
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

      {/* Images Grid */}
      {!loading && !error && images.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">No images found</p>
              <p className="text-sm">Try adjusting your filters or check back later.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((item) => (
            <Card
              key={item._id}
              className={`border-2 ${getStatusColor(item.prediction)} hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={`Plant Image - ${item.prediction}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=250&text=Image+Not+Found"
                      }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2">{getStatusBadge(item.prediction)}</div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">ID: {item._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500">Captured at {formatTimestamp(item.timestamp)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && images.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Showing {images.length} images</span>
              <span>
                Filters: {localFilters.prediction !== "all" ? `${localFilters.prediction}` : "All predictions"}
                {localFilters.startDate && `, from ${new Date(localFilters.startDate).toLocaleDateString()}`}
                {localFilters.endDate && ` to ${new Date(localFilters.endDate).toLocaleDateString()}`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More Button (if needed) */}
      {!loading && !error && images.length === filters.limit && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              const newFilters = { ...filters, skip: filters.skip + filters.limit }
              setFilters(newFilters)
              fetchImages(newFilters)
            }}
            variant="outline"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Load More Images
          </Button>
        </div>
      )}
    </div>
  )
}
