"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { uploadProfileImage } from "@/lib/storage"
import Image from "next/image"

interface ProfileImageUploadProps {
  userId: string
  currentImageUrl: string | null
  onImageUploaded: (imageUrl: string) => void
}

export default function ProfileImageUpload({ userId, currentImageUrl, onImageUploaded }: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Зөвхөн JPG, PNG, WEBP зураг оруулна уу")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError("Зургийн хэмжээ 5MB-аас хэтрэхгүй байх ёстой")
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setError(null)

    // Upload to Firebase
    try {
      setIsUploading(true)
      const imageUrl = await uploadProfileImage(userId, file)
      onImageUploaded(imageUrl)
    } catch (error: any) {
      console.error("Error uploading profile image:", error)
      setError(error.message || "Зураг байршуулахад алдаа гарлаа")
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageUploaded("")
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 mb-4">
        {previewUrl ? (
          <>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              title="Зураг устгах"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
            <Camera className="h-12 w-12 text-blue-500" />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
      >
        <Upload className="h-4 w-4 mr-2" />
        {previewUrl ? "Зураг солих" : "Зураг оруулах"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
