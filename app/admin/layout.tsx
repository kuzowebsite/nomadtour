"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Map,
  Users,
  Calendar,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Globe,
  Home,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Хянах самбар",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Аялалууд",
    href: "/admin/tours",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "Чиглэлүүд",
    href: "/admin/routes",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    title: "Захиалгууд",
    href: "/admin/bookings",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Хэрэглэгчид",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Төлбөрүүд",
    href: "/admin/payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Статистик",
    href: "/admin/statistics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Нүүр хуудас",
    href: "/admin/home-page",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Сэтгэгдлүүд",
    href: "/admin/testimonials",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Тохиргоо",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <Link href="/admin" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">NomadTour</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/admin" className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">NomadTour</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                // Handle logout
                window.location.href = "/"
              }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Гарах
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("lg:pl-64 pt-4 lg:pt-0")}>
        <div className="p-6 mt-14 lg:mt-0">{children}</div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  )
}
