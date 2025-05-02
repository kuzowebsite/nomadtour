"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"

type SiteSettings = {
  siteName: string
  logoUrl: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
}

type SiteSettingsContextType = {
  settings: SiteSettings
  isLoading: boolean
  error: string | null
}

const defaultSettings: SiteSettings = {
  siteName: "NomadTour",
  logoUrl: "",
  siteDescription: "Монголын аялал жуулчлалын компани",
  contactEmail: "info@nomadtour.mn",
  contactPhone: "+976 9911-2233",
  address: "Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо, Бага тойруу 14",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
  },
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  error: null,
})

export const useSiteSettings = () => useContext(SiteSettingsContext)

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settingsRef = ref(database, "settings/general")
        const snapshot = await get(settingsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setSettings({
            ...defaultSettings,
            ...data,
          })
        }
      } catch (err) {
        console.error("Error fetching site settings:", err)
        setError("Сайтын тохиргоог ачаалахад алдаа гарлаа")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return <SiteSettingsContext.Provider value={{ settings, isLoading, error }}>{children}</SiteSettingsContext.Provider>
}
