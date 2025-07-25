"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Heart, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface ImageData {
  _id: string
  image_url: string
  prediction: string
  timestamp: string
}

interface ImageGalleryProps {
  title?: string
  limit?: number
  showFilters?: boolean
  predictionFilter?: string
  className?: string
}

export default function ImageGallery({
  title = "Plant Images",
  limit = 12,
  showFilters = false,
  predictionFilter,
  className = "",
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setError(null)
      setLoading(true)

      const params = new URLSearchParams()
      params.append("limit", limit.toString())
      params.append("skip", "0")

      if (predictionFilter && predictionFilter !== "all") {
        params.append("prediction", predictionFilter)
      }

      const response = await fetch(`http://localhost:8000/api/data/images?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ImageData[] = await response.json()
      setImages(data)
    } catch (err) {
      console.error("Failed to fetch images:", err)
      setError("⚠️ Failed to fetch image data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [limit, predictionFilter])

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch (err) {
      return timestamp
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

  const getStatusColor = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase()
    return lowerPrediction.includes("healthy") ? "border-green-500" : "border-pink-500"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={fetchImages} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading images...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <Button onClick={fetchImages} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No images found</p>
          </div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((item) => (
              <div
                key={item._id}
                className={`border-2 ${getStatusColor(item.prediction)} rounded-lg overflow-hidden hover:shadow-md transition-shadow`}
              >
                <div className="relative">
                  <div className="relative w-full h-32 bg-gray-100">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={`Plant - ${item.prediction}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=128&width=200&text=Image+Error"
                      }}
                    />
                  </div>
                  <div className="absolute bottom-1 left-1">{getStatusBadge(item.prediction)}</div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate">{formatTimestamp(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Showing {images.length} recent images
              {predictionFilter && predictionFilter !== "all" && ` (${predictionFilter})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
