"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Camera, Droplets, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "DASHBOARD", icon: LayoutGrid },
    { href: "/disease-detection", label: "IMAGES AND DISEASE DETECTION", icon: Camera },
    { href: "/watering-history", label: "WATERING HISTORY", icon: Droplets },
    { href: "/settings", label: "SETTING", icon: Settings },
  ]

  return (
    <header className="bg-pink-400 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold">TomatoBuddy</h1>
          <nav className="flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                    isActive ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm">
            <div className="text-white/80">Wednesday, October 18 2021</div>
            <div className="text-white/80">14:15</div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              1
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
