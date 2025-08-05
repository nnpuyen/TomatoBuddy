"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Thermometer,
  Droplets,
  Sun,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface SensorData {
  _id: string;
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  water_level: number;
  timestamp: string;
}

interface ImageData {
  _id: string;
  image_url: string;
  prediction: string;
  timestamp: string;
}

export default function Sidebar() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [latestImageData, setLatestImageData] = useState<ImageData | null>(
    null
  );
  const [loadingSensor, setLoadingSensor] = useState(true);
  const [loadingImage, setLoadingImage] = useState(true);
  const [errorSensor, setErrorSensor] = useState<string | null>(null);
  const [errorImage, setErrorImage] = useState<string | null>(null);
  const [imageDisplayError, setImageDisplayError] = useState(false);

  const fetchSensorData = async () => {
    try {
      setErrorSensor(null);
      setLoadingSensor(true);
      const response = await fetch(
        "http://localhost:8000/api/data/sensors/latest"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SensorData = await response.json();
      setSensorData(data);
    } catch (err) {
      console.error("Failed to fetch sensor data:", err);
      setErrorSensor("⚠️ Failed to fetch sensor data");
    } finally {
      setLoadingSensor(false);
    }
  };

  const fetchLatestImage = async () => {
    try {
      setErrorImage(null);
      setLoadingImage(true);
      const response = await fetch(
        "http://localhost:8000/api/data/images?limit=1&skip=0"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ImageData[] = await response.json();
      if (data.length > 0) {
        setLatestImageData(data[0]);
        setImageDisplayError(false); // Reset image error when new data is fetched
      } else {
        setLatestImageData(null);
        setImageDisplayError(true); // No image found
      }
    } catch (err) {
      console.error("Failed to fetch latest image:", err);
      setErrorImage("⚠️ Failed to fetch latest image");
      setImageDisplayError(true);
    } finally {
      setLoadingImage(false);
    }
  };

  useEffect(() => {
    // Initial fetches
    fetchSensorData();
    fetchLatestImage();

    // Set up intervals to refresh
    const sensorInterval = setInterval(fetchSensorData, 10000); // Refresh sensor data every 10 seconds
    const imageInterval = setInterval(fetchLatestImage, 30000); // Refresh image data every 30 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(sensorInterval);
      clearInterval(imageInterval);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      return timestamp;
    }
  };

  const handleImageDisplayError = () => {
    setImageDisplayError(true);
  };

  const getHealthStatus = () => {
    const prediction = latestImageData?.prediction;

    if (!prediction) {
      return {
        status: "Unknown",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        dotColor: "bg-gray-500",
      };
    }

    const lowerPrediction = prediction.toLowerCase();

    if (lowerPrediction.includes("healthy")) {
      return {
        status: "Healthy",
        color: "text-green-500",
        bgColor: "bg-green-100",
        dotColor: "bg-green-500",
      };
    } else {
      return {
        status: prediction,
        color: "text-red-500",
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
      };
    }
  };

  const getRecommendation = () => {
    const prediction = latestImageData?.prediction;

    if (!prediction) {
      return "Monitoring plant health...";
    }

    const lowerPrediction = prediction.toLowerCase();

    if (lowerPrediction.includes("healthy")) {
      return "Maintain proper watering and monitoring";
    } else if (lowerPrediction.includes("bacterial")) {
      return "Apply copper-based fungicide and improve air circulation";
    } else if (lowerPrediction.includes("spider")) {
      return "Use insecticidal soap or neem oil treatment";
    } else if (lowerPrediction.includes("blight")) {
      return "Remove affected leaves and apply fungicide immediately";
    } else {
      return "Consult plant care guidelines for treatment";
    }
  };

  const getDiseaseStatus = () => {
    const prediction = latestImageData?.prediction;

    if (!prediction) {
      return "CHECKING...";
    }

    const lowerPrediction = prediction.toLowerCase();
    return lowerPrediction.includes("healthy") ? "NONE" : "DETECTED";
  };

  const healthStatus = getHealthStatus();
  const isLoadingAny = loadingSensor || loadingImage;
  const hasAnyError = errorSensor || errorImage;

  return (
    <div className="w-96 p-6 space-y-6">
      {/* Plant Image */}
      <div className="relative">
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          {(loadingImage && !latestImageData) ||
          (loadingSensor && !sensorData) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : latestImageData?.image_url && !imageDisplayError ? (
            <Image
              src={latestImageData.image_url || "/placeholder.svg"}
              alt="Current Plant Image"
              fill
              className="object-cover"
              onError={handleImageDisplayError}
              priority
            />
          ) : (
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
                <p className="text-sm">No image available</p>
                {errorImage && (
                  <p className="text-xs text-red-400 mt-1">{errorImage}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {latestImageData?.image_url && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Live
          </div>
        )}
      </div>

      {/* Health Status Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-8 h-8 ${healthStatus.bgColor} rounded-full flex items-center justify-center`}
            >
              <div
                className={`w-4 h-4 ${healthStatus.dotColor} rounded-full`}
              ></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-500">
                Health Status
              </h3>
              <div className="flex items-center space-x-2">
                <p className={`font-medium ${healthStatus.color}`}>
                  {healthStatus.status}
                </p>
                {isLoadingAny && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Disease detected</span>
              <span
                className={`font-semibold ${
                  getDiseaseStatus() === "NONE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getDiseaseStatus()}
              </span>
            </div>
            <hr className="border-gray-200" />
            <div>
              <p className="text-gray-600 mb-2">Recommendation</p>
              <p className="font-medium text-sm">{getRecommendation()}</p>
            </div>
          </div>
          {(latestImageData || sensorData) && (
            <div className="mt-4 space-y-1">
              <p className="text-gray-400 text-sm">
                Last updated:{" "}
                {formatTimestamp(
                  latestImageData?.timestamp || sensorData?.timestamp || ""
                )}
              </p>
              {latestImageData?.prediction && (
                <p className="text-gray-400 text-xs">
                  Analysis: {latestImageData?.prediction}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Environment Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-500">
              Current Environment
            </h3>
            {loadingSensor && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>

          {errorSensor ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 text-sm">{errorSensor}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">Temperature:</span>
                </div>
                <span className="font-semibold">
                  {sensorData
                    ? `${sensorData.temperature.toFixed(1)}°C`
                    : "--°C"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">Humidity:</span>
                </div>
                <span className="font-semibold">
                  {sensorData ? `${sensorData.humidity.toFixed(1)}%` : "--%"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-500">Moisture:</span>
                </div>
                <span className="font-semibold">
                  {sensorData ? `${sensorData.moisture.toFixed(1)}%` : "--%"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500">Light:</span>
                </div>
                <span className="font-semibold">
                  {sensorData ? `${sensorData.light.toFixed(1)}%` : "--%"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-blue-500">Water Level:</span>
                </div>
                <span className="font-semibold">
                  {sensorData ? `${sensorData.water_level}ml` : "--ml"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
