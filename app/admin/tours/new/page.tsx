"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ref, push, set } from "firebase/database"
import { ArrowLeft, Calendar, ImagePlus, Loader2, MapPin, Save, Tag, Trash2 } from "lucide-react"

import { database } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function NewTour() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [tourData, setTourData] = useState({
    title: "",
    location: "",
    description: "",
    fullDescription: "",
    adultPrice: 0,
    childPrice: 0,
    duration: 1,
    image: "",
    types: [] as string[],
    category: "domestic",
    status: "draft",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newType, setNewType] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "adultPrice" || name === "childPrice" || name === "duration") {
      setTourData({
        ...tourData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setTourData({
        ...tourData,
        [name]: value,
      })
    }
  }

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(event.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Add tour type
  const handleAddType = () => {
    if (newType && !tourData.types.includes(newType)) {
      setTourData({
        ...tourData,
        types: [...tourData.types, newType],
      })
      setNewType("")
    }
  }

  // Remove tour type
  const handleRemoveType = (typeToRemove: string) => {
    setTourData({
      ...tourData,
      types: tourData.types.filter((type) => type !== typeToRemove),
    })
  }

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Save tour to Firebase
  const handleSaveTour = async () => {
    // Validate form
    if (
      !tourData.title ||
      !tourData.location ||
      !tourData.description ||
      tourData.adultPrice <= 0 ||
      tourData.duration <= 0
    ) {
      toast({
        title: "Мэдээлэл дутуу байна",
        description: "Аялалын нэр, байршил, тайлбар, үнэ болон хугацааг оруулна уу.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create a new tour reference
      const toursRef = ref(database, "tours")
      const newTourRef = push(toursRef)

      let imageData = tourData.image

      // If there's a new image file, convert it to base64
      if (imageFile) {
        imageData = await convertImageToBase64(imageFile)
      }

      // Save tour data
      await set(newTourRef, {
        ...tourData,
        image: imageData,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Аялал амжилттай үүсгэгдлээ",
        description: "Шинэ аялал амжилттай бүртгэгдлээ.",
      })

      // Redirect to tours list
      router.push("/admin/tours")
    } catch (err) {
      console.error("Error saving tour:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Аялалыг хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Шинэ аялал үүсгэх</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Үндсэн мэдээлэл</CardTitle>
              <CardDescription>Аялалын үндсэн мэдээллийг оруулна уу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Аялалын нэр</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Жишээ: Хөвсгөл нуурын аялал"
                  value={tourData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Байршил</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="location"
                    name="location"
                    className="pl-8"
                    placeholder="Жишээ: Хөвсгөл аймаг"
                    value={tourData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Богино тайлбар</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Аялалын товч тайлбар (100-150 тэмдэгт)"
                  rows={2}
                  value={tourData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Дэлгэрэнгүй тайлбар</Label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  placeholder="Аялалын дэлгэрэнгүй тайлбар"
                  rows={6}
                  value={tourData.fullDescription}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Үнэ ба хугацаа</CardTitle>
              <CardDescription>Аялалын үнэ, хугацааны мэдээллийг оруулна уу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adultPrice">Том хүний үнэ (₮)</Label>
                  <Input
                    id="adultPrice"
                    name="adultPrice"
                    type="number"
                    min="0"
                    value={tourData.adultPrice || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childPrice">Хүүхдийн үнэ (₮)</Label>
                  <Input
                    id="childPrice"
                    name="childPrice"
                    type="number"
                    min="0"
                    value={tourData.childPrice || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Аялалын хугацаа (өдөр)</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    className="pl-8"
                    min="1"
                    value={tourData.duration || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Зураг</CardTitle>
              <CardDescription>Аялалын үндсэн зургийг оруулна уу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="mx-auto h-48 w-full object-cover rounded-md"
                    />
                    <Button variant="outline" size="sm" className="text-red-600" onClick={handleRemoveImage}>
                      <Trash2 className="h-4 w-4 mr-2" /> Зураг устгах
                    </Button>
                  </div>
                ) : (
                  <div
                    className="py-8 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Зураг сонгох эсвэл чирж оруулах</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (макс. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Ангилал</CardTitle>
              <CardDescription>Аялалын ангилал, төрлийг сонгоно уу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Аялалын төрөл</Label>
                <RadioGroup
                  value={tourData.category}
                  onValueChange={(value) => setTourData({ ...tourData, category: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="domestic" id="domestic" />
                    <Label htmlFor="domestic" className="cursor-pointer">
                      Дотоод
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="international" id="international" />
                    <Label htmlFor="international" className="cursor-pointer">
                      Гадаад
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Төлөв</Label>
                <Select value={tourData.status} onValueChange={(value) => setTourData({ ...tourData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Төлөв сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Идэвхтэй</SelectItem>
                    <SelectItem value="inactive">Идэвхгүй</SelectItem>
                    <SelectItem value="draft">Ноорог</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Аялалын онцлог</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tourData.types.map((type) => (
                    <Badge key={type} className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      {type}
                      <button className="ml-1 text-gray-500 hover:text-gray-700" onClick={() => handleRemoveType(type)}>
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Шинэ онцлог нэмэх"
                      className="pl-8"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddType()
                        }
                      }}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddType}>
                    Нэмэх
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Цуцлах
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveTour} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Хадгалж байна...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Хадгалах
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
