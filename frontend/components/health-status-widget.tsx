"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Shield,
  AlertCircle,
} from "lucide-react";

interface SensorData {
  _id: string;
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  water_level: number;
  timestamp: string;
  image_url?: string;
  prediction?: string;
}

interface HealthStatusWidgetProps {
  title?: string;
  showRecommendations?: boolean;
  className?: string;
}

export default function HealthStatusWidget({
  title = "Plant Health Status",
  showRecommendations = true,
  className = "",
}: HealthStatusWidgetProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensorData = async () => {
    try {
      setError(null);
      setLoading(true);

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
      setError("⚠️ Failed to fetch health status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!sensorData?.prediction) {
      return {
        status: "Unknown",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: Activity,
        severity: "unknown",
      };
    }

    const prediction = sensorData.prediction.toLowerCase();

    if (prediction.includes("healthy")) {
      return {
        status: "Healthy",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: Shield,
        severity: "healthy",
      };
    } else {
      return {
        status: sensorData.prediction,
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: AlertCircle,
        severity: "diseased",
      };
    }
  };

  const getRecommendations = () => {
    if (!sensorData?.prediction) {
      return ["Monitoring plant health...", "Check back for updates"];
    }

    const prediction = sensorData.prediction.toLowerCase();

    if (prediction.includes("healthy")) {
      return [
        "Continue current care routine",
        "Monitor daily for changes",
        "Maintain proper watering schedule",
      ];
    } else if (prediction.includes("bacterial")) {
      return [
        "Apply copper-based fungicide",
        "Improve air circulation",
        "Remove affected leaves",
        "Avoid overhead watering",
      ];
    } else if (prediction.includes("spider")) {
      return [
        "Use insecticidal soap treatment",
        "Apply neem oil spray",
        "Increase humidity around plant",
        "Check for mites regularly",
      ];
    } else if (prediction.includes("blight")) {
      return [
        "Remove affected leaves immediately",
        "Apply fungicide treatment",
        "Improve drainage",
        "Avoid watering leaves directly",
      ];
    } else {
      return [
        "Consult plant care guidelines",
        "Consider professional diagnosis",
        "Monitor closely for changes",
      ];
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (err) {
      return timestamp;
    }
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${healthStatus.color}`} />
            <span>{title}</span>
          </CardTitle>
          <Button
            onClick={fetchSensorData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !sensorData && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Checking plant health...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <Button onClick={fetchSensorData} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 ${healthStatus.bgColor} rounded-full flex items-center justify-center`}
                >
                  <StatusIcon className={`w-5 h-5 ${healthStatus.color}`} />
                </div>
                <div>
                  <p className="font-semibold">Current Status</p>
                  <p className={`text-sm ${healthStatus.color}`}>
                    {healthStatus.status}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  healthStatus.severity === "healthy"
                    ? "default"
                    : "destructive"
                }
                className={
                  healthStatus.severity === "healthy"
                    ? "bg-green-100 text-green-700"
                    : ""
                }
              >
                {healthStatus.severity === "healthy"
                  ? "Healthy"
                  : "Needs Attention"}
              </Badge>
            </div>

            {/* Disease Detection */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Disease Detection
              </span>
              <span
                className={`text-sm font-semibold ${
                  healthStatus.severity === "healthy"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {healthStatus.severity === "healthy"
                  ? "NONE DETECTED"
                  : "DETECTED"}
              </span>
            </div>

            {/* Recommendations */}
            {showRecommendations && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {getRecommendations().map((recommendation, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start space-x-2"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Updated */}
            {sensorData && (
              <div className="pt-3 border-t text-xs text-gray-500">
                <p>Last analysis: {formatTimestamp(sensorData.timestamp)}</p>
                {sensorData.prediction && (
                  <p>Prediction: {sensorData.prediction}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
