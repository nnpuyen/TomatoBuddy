"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";

interface WateringEvent {
  _id: string;
  mode: "auto" | "manual";
  timestamp: string;
  duration: number;
}

interface WateringSummaryProps {
  title?: string;
  limit?: number;
  showModeFilter?: boolean;
  className?: string;
}

export default function WateringSummary({
  title = "Recent Watering Events",
  limit = 5,
  showModeFilter = false,
  className = "",
}: WateringSummaryProps) {
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWateringEvents = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("skip", "0");

      const response = await fetch(
        `http://localhost:8000/api/data/watering?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WateringEvent[] = await response.json();
      setWateringEvents(data);
    } catch (err) {
      console.error("Failed to fetch watering events:", err);
      setError("⚠️ Failed to fetch watering data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWateringEvents();
  }, [limit]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      };
    } catch (err) {
      return { time: "--:--", date: "Invalid" };
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration}s`;
    } else {
      return `${Math.round(duration / 60)}min`;
    }
  };

  const getModeColor = (mode: string) => {
    return mode === "auto"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
  };

  const getTotalDuration = () => {
    return wateringEvents.reduce((sum, event) => sum + event.duration, 0);
  };

  const getAutoCount = () => {
    return wateringEvents.filter((event) => event.mode === "auto").length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span>{title}</span>
          </CardTitle>
          <Button
            onClick={fetchWateringEvents}
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
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading events...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <Button onClick={fetchWateringEvents} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && wateringEvents.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Droplets className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No watering events found</p>
          </div>
        )}

        {!loading && !error && wateringEvents.length > 0 && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {wateringEvents.length}
                </div>
                <div className="text-xs text-blue-600">Events</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {getAutoCount()}
                </div>
                <div className="text-xs text-green-600">Auto</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {formatDuration(getTotalDuration())}
                </div>
                <div className="text-xs text-purple-600">Total</div>
              </div>
            </div>

            {/* Recent Events List */}
            <div className="space-y-2">
              {wateringEvents.map((event) => {
                const formattedTime = formatTimestamp(event.timestamp);
                return (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {formattedTime.time}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formattedTime.date}
                        </span>
                      </div>
                      <Badge
                        className={`${getModeColor(
                          event.mode
                        )} text-xs px-2 py-0.5`}
                      >
                        {event.mode.charAt(0).toUpperCase() +
                          event.mode.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(event.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Showing {wateringEvents.length} most recent events
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
