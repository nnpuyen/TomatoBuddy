"use client"

import { Bell, Grid3X3, ImageIcon, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: "dashboard", label: "DASHBOARD", icon: Grid3X3 },
    { id: "images", label: "IMAGES AND DISEASE DETECTION", icon: ImageIcon },
    { id: "watering", label: "WATERING HISTORY", icon: FileText },
    { id: "settings", label: "SETTING", icon: Settings },
  ]

  return (
    <header className="bg-pink-500 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold">TomatoBuddy</h1>
          <nav className="flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/80">Wednesday, October 18 2021 14:15</span>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              1
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
