"use client";

import { useState, useEffect } from "react";
import {
  Grid3X3,
  ImageIcon,
  FileText,
  Settings,
  Clock,
  Calendar,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: "dashboard", label: "DASHBOARD", icon: Grid3X3 },
    { id: "images", label: "IMAGES AND DISEASE DETECTION", icon: ImageIcon },
    { id: "watering", label: "WATERING HISTORY", icon: FileText },
    { id: "settings", label: "SETTING", icon: Settings },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <header className="bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🍅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                  TomatoBuddy
                </h1>
                <p className="text-xs text-pink-100 -mt-1">
                  Smart Plant Monitoring
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {tab.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Section - Time and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Real-time Date and Time */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-pink-100" />
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-pink-100" />
              <div className="text-right">
                <div className="text-lg font-bold text-white font-mono tracking-wider">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 bg-green-500/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-100">
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom border with gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </header>
  );
}
