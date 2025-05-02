"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useSiteSettings } from "@/context/site-settings-context"
import { logoutUser } from "@/lib/auth"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, userData, isLoading } = useAuth()
  const { settings, isLoading: isLoadingSettings } = useSiteSettings()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    setIsUserMenuOpen(false)
  }

  const navItems = [
    { name: "Нүүр", href: "/" },
    { name: "Аялалууд", href: "/tours" },
    { name: "Бидний тухай", href: "/about" },
    { name: "Холбоо барих", href: "/contact" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl || "/placeholder.svg"}
              alt={settings.siteName}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : null}
          <span className="text-2xl font-bold text-blue-600">
            {isLoadingSettings ? "Loading..." : settings.siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? "text-blue-600"
                  : isScrolled
                    ? "text-gray-800 hover:text-blue-600"
                    : "text-gray-800 hover:text-blue-600"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {isLoading ? (
            <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-base font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
              >
                {userData?.photoURL ? (
                  <Image
                    src={userData.photoURL || "/placeholder.svg"}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="max-w-[120px] truncate">{userData?.firstName || "Хэрэглэгч"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Профайл
                  </Link>
                  <Link
                    href="/bookings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Миний захиалгууд
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Тохиргоо
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-base font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              Нэвтрэх
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          {isAuthenticated ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-base font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
            >
              {userData?.photoURL ? (
                <Image
                  src={userData.photoURL || "/placeholder.svg"}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-base font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              Нэвтрэх
            </Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium ${
                  pathname === item.href ? "text-blue-600" : "text-gray-800 hover:text-blue-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
