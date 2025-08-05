"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Heart, X, Download, Calendar, Clock } from "lucide-react";
import Image from "next/image";

interface ImageData {
  _id: string;
  image_url: string;
  prediction: string;
  timestamp: string;
}

interface ImageModalProps {
  image: ImageData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({
  image,
  isOpen,
  onClose,
}: ImageModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!image) return null;

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        date: date.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    } catch (err) {
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  const getStatusBadge = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase();
    if (lowerPrediction.includes("healthy")) {
      return (
        <Badge className="bg-green-100 text-green-700 flex items-center space-x-2 text-base px-3 py-1">
          <CheckCircle className="w-4 h-4" />
          <span>{prediction}</span>
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-pink-100 text-pink-700 flex items-center space-x-2 text-base px-3 py-1">
          <Heart className="w-4 h-4" />
          <span>{prediction}</span>
        </Badge>
      );
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plant-image-${image._id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const formattedTime = formatTimestamp(image.timestamp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Plant Image Details
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Section */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
              {imageError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">Failed to load image</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={image.image_url || "/placeholder.svg"}
                  alt={`Plant Image - ${image.prediction}`}
                  fill
                  className="object-contain"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              )}

              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Health Status</h3>
              <div className="flex justify-center lg:justify-start">
                {getStatusBadge(image.prediction)}
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Capture Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formattedTime.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formattedTime.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Image Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Image ID:</span>
                  <span className="font-mono">{image._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>JPEG</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={imageError}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full bg-transparent"
              >
                Close
              </Button>
            </div>

            {/* Health Analysis */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Analysis Result</h4>
              <p className="text-sm text-gray-600">
                {image.prediction.toLowerCase().includes("healthy")
                  ? "The plant appears to be in good health with no visible signs of disease or stress."
                  : `Detected condition: ${image.prediction}. Consider appropriate treatment measures.`}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
