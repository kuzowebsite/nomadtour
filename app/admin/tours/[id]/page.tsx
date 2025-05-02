"use client"

import type React from "react"

import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ref, get, update } from "firebase/database"
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
import { Skeleton } from "@/components/ui/skeleton"

export default function EditTour({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [error, setError] = useState<string | null>(null)

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true)
      try {
        const tourRef = ref(database, `tours/${id}`)
        const snapshot = await get(tourRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setTourData(data)

          // Set image preview if image exists
          if (data.image) {
            setImagePreview(data.image)
          }
        } else {
          setError("Аялал олдсонгүй")
          toast({
            title: "Алдаа",
            description: "Аялал олдсонгүй",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching tour:", err)
        setError("Аялалын мэдээллийг ачаалахад алдаа гарлаа")
        toast({
          title: "Алдаа гарлаа",
          description: "Аялалын мэдээллийг ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [id, toast])

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
    setTourData({
      ...tourData,
      image: "",
    })
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

    setSaving(true)

    try {
      // Get the tour reference
      const tourRef = ref(database, `tours/${id}`)

      const updatedTourData = { ...tourData }

      // If there's a new image file, convert it to base64
      if (imageFile) {
        updatedTourData.image = await convertImageToBase64(imageFile)
      }

      // Update tour data
      await update(tourRef, updatedTourData)

      toast({
        title: "Аялал амжилттай шинэчлэгдлээ",
        description: "Аялалын мэдээлэл амжилттай хадгалагдлаа.",
      })

      // Redirect to tours list
      router.push("/admin/tours")
    } catch (err) {
      console.error("Error updating tour:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Аялалыг шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-lg font-medium mb-2">{error}</div>
        <Button onClick={() => router.push("/admin/tours")}>Аялалуудын жагсаалт руу буцах</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Аялал засах</h2>
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
                  value={tourData.fullDescription || ""}
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
                  {tourData.types &&
                    tourData.types.map((type) => (
                      <Badge key={type} className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        {type}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleRemoveType(type)}
                        >
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
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveTour} disabled={saving}>
          {saving ? (
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
