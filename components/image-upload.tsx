"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/storage"

interface ImageUploadProps {
  folder: string
  onUploadComplete: (url: string) => void
  existingUrl?: string
  className?: string
}

export default function ImageUpload({ folder, onUploadComplete, existingUrl, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update the handleFileChange function to handle base64 images
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB for database storage)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Файл хэт том байна",
        description: "Зургийн хэмжээ 2MB-с бага байх ёстой",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Буруу файлын төрөл",
        description: "Зөвхөн зургийн файл оруулна уу",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Create a preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Firebase Realtime Database as base64
      const base64Image = await uploadImage(file, folder)

      onUploadComplete(base64Image)

      toast({
        title: "Зураг амжилттай хадгалагдлаа",
        description: "Зургийг амжилттай хадгаллаа",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Зураг хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onUploadComplete("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Create a new FileList containing the dropped file
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files

        // Manually trigger the onChange event
        const event = new Event("change", { bubbles: true })
        fileInputRef.current.dispatchEvent(event)
      }
    }
  }

  return (
    <div className={`${className || ""}`}>
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">Зураг оруулахын тулд энд дарна уу эсвэл чирч оруулна уу</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (макс: 5MB)</p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative border rounded-md overflow-hidden">
            <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Байршуулж байна...
              </>
            ) : (
              <>Өөр зураг сонгох</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
