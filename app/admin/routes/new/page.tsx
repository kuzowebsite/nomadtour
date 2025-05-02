"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ref, push, set } from "firebase/database"
import { ArrowLeft, Calendar, Loader2, MapPin, Plus, Save, Trash2, RouteIcon } from "lucide-react"

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

interface RouteStop {
  name: string
  description: string
  duration: number // hours at this stop
}

export default function NewRoute() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [routeData, setRouteData] = useState({
    name: "",
    type: "domestic" as "domestic" | "international",
    description: "",
    totalDuration: 1,
    status: "draft" as "active" | "inactive" | "draft",
  })
  const [stops, setStops] = useState<RouteStop[]>([{ name: "", description: "", duration: 1 }])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "totalDuration") {
      setRouteData({
        ...routeData,
        [name]: Number.parseInt(value) || 1,
      })
    } else {
      setRouteData({
        ...routeData,
        [name]: value,
      })
    }
  }

  // Handle stop changes
  const handleStopChange = (index: number, field: keyof RouteStop, value: string | number) => {
    const newStops = [...stops]

    if (field === "duration") {
      newStops[index][field] = Number(value) || 1
    } else {
      newStops[index][field] = value as string
    }

    setStops(newStops)
  }

  // Add new stop
  const addStop = () => {
    setStops([...stops, { name: "", description: "", duration: 1 }])
  }

  // Remove stop
  const removeStop = (index: number) => {
    if (stops.length > 1) {
      const newStops = [...stops]
      newStops.splice(index, 1)
      setStops(newStops)
    } else {
      toast({
        title: "Анхааруулга",
        description: "Маршрутад дор хаяж нэг зогсоол байх ёстой.",
        variant: "destructive",
      })
    }
  }

  // Save route to Firebase
  const handleSaveRoute = async () => {
    // Validate form
    if (!routeData.name || !routeData.description || routeData.totalDuration <= 0) {
      toast({
        title: "Мэдээлэл дутуу байна",
        description: "Маршрутын нэр, тайлбар болон хугацааг оруулна уу.",
        variant: "destructive",
      })
      return
    }

    // Validate stops
    const invalidStops = stops.filter((stop) => !stop.name || stop.duration <= 0)
    if (invalidStops.length > 0) {
      toast({
        title: "Зогсоолын мэдээлэл дутуу байна",
        description: "Бүх зогсоолын нэр болон хугацааг оруулна уу.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create a new route reference
      const routesRef = ref(database, "routes")
      const newRouteRef = push(routesRef)

      // Save route data
      await set(newRouteRef, {
        ...routeData,
        stops,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Маршрут амжилттай үүсгэгдлээ",
        description: "Шинэ маршрут амжилттай бүртгэгдлээ.",
      })

      // Redirect to routes list
      router.push("/admin/routes")
    } catch (err) {
      console.error("Error saving route:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Маршрутыг хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
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
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Шинэ маршрут үүсгэх</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Үндсэн мэдээлэл</CardTitle>
              <CardDescription>Маршрутын үндсэн мэдээллийг оруулна уу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Маршрутын нэр</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Жишээ: Хөвсгөл нуур - Хатгал - Жанхай"
                  value={routeData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Тайлбар</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Маршрутын товч тайлбар"
                  rows={3}
                  value={routeData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Маршрутын төрөл</Label>
                  <RadioGroup
                    value={routeData.type}
                    onValueChange={(value: "domestic" | "international") => setRouteData({ ...routeData, type: value })}
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
                  <Select
                    value={routeData.status}
                    onValueChange={(value: "active" | "inactive" | "draft") =>
                      setRouteData({ ...routeData, status: value })
                    }
                  >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalDuration">Нийт хугацаа (өдөр)</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="totalDuration"
                    name="totalDuration"
                    type="number"
                    className="pl-8"
                    min="1"
                    value={routeData.totalDuration}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Зогсоолууд</CardTitle>
                <CardDescription>Маршрутын зогсоолуудыг оруулна уу.</CardDescription>
              </div>
              <Button onClick={addStop} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Зогсоол нэмэх
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {stops.map((stop, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Зогсоол {index + 1}</Badge>
                    {stops.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 h-8 px-2"
                        onClick={() => removeStop(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Устгах
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`stop-name-${index}`}>Зогсоолын нэр</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id={`stop-name-${index}`}
                        className="pl-8"
                        placeholder="Жишээ: Хатгал"
                        value={stop.name}
                        onChange={(e) => handleStopChange(index, "name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`stop-description-${index}`}>Тайлбар</Label>
                    <Textarea
                      id={`stop-description-${index}`}
                      placeholder="Зогсоолын тайлбар"
                      rows={2}
                      value={stop.description}
                      onChange={(e) => handleStopChange(index, "description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`stop-duration-${index}`}>Хугацаа (цаг)</Label>
                    <Input
                      id={`stop-duration-${index}`}
                      type="number"
                      min="1"
                      value={stop.duration}
                      onChange={(e) => handleStopChange(index, "duration", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Маршрутын хураангуй</CardTitle>
              <CardDescription>Маршрутын мэдээллийн хураангуй.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <RouteIcon className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">{routeData.name || "Маршрутын нэр"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      routeData.type === "domestic" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }
                  >
                    {routeData.type === "domestic" ? "Дотоод" : "Гадаад"}
                  </Badge>
                  <Badge
                    className={
                      routeData.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : routeData.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-amber-100 text-amber-800"
                    }
                  >
                    {routeData.status === "active"
                      ? "Идэвхтэй"
                      : routeData.status === "inactive"
                        ? "Идэвхгүй"
                        : "Ноорог"}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">{routeData.description || "Маршрутын тайлбар"}</div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{routeData.totalDuration} өдөр</span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-medium mb-2">Зогсоолууд ({stops.length}):</div>
                  <div className="space-y-2">
                    {stops.map((stop, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge className="bg-gray-100 text-gray-800 mt-0.5">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{stop.name || "Зогсоолын нэр"}</div>
                          <div className="text-xs text-gray-500">{stop.duration} цаг</div>
                        </div>
                      </div>
                    ))}
                  </div>
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
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveRoute} disabled={loading}>
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
