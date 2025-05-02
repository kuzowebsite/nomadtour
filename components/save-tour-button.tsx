"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getDatabase, ref, set, get } from "firebase/database"
import { useRouter } from "next/navigation"

type SaveTourButtonProps = {
  tourId: string
  tourData: {
    name: string
    price: number
    duration: number
    imageUrl: string
  }
  className?: string
}

export default function SaveTourButton({ tourId, tourData, className = "" }: SaveTourButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false)
        return
      }

      try {
        const db = getDatabase()
        const savedTourRef = ref(db, `users/${user.uid}/savedTours/${tourId}`)
        const snapshot = await get(savedTourRef)
        setIsSaved(snapshot.exists())
      } catch (error) {
        console.error("Error checking saved status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfSaved()
  }, [tourId, user, isAuthenticated])

  const toggleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/login?returnUrl=/tours/${tourId}`)
      return
    }

    if (isLoading || !user) return

    try {
      const db = getDatabase()
      const savedTourRef = ref(db, `users/${user.uid}/savedTours/${tourId}`)

      if (isSaved) {
        // Remove from saved tours
        await set(savedTourRef, null)
        setIsSaved(false)
      } else {
        // Add to saved tours
        await set(savedTourRef, {
          id: tourId,
          ...tourData,
          savedAt: new Date().toISOString(),
        })
        setIsSaved(true)
      }
    } catch (error) {
      console.error("Error toggling saved status:", error)
    }
  }

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${
        isSaved ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      } ${className}`}
      aria-label={isSaved ? "Хадгалснаас хасах" : "Хадгалах"}
    >
      <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
    </button>
  )
}
