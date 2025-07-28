"use client"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import Dashboard from "./dashboard"
import WateringHistory from "./watering-history"
import ImagesDetection from "./images-detection"
import Settings from "./settings"

export default function TomatoBuddyApp() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "images":
        return <ImagesDetection />
      case "watering":
        return <WateringHistory />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
