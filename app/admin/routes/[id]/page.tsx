"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, get, update } from "firebase/database"
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
import { Skeleton } from "@/components/ui/skeleton"

interface RouteStop {
  name: string
  description: string
  duration: number // hours at this stop
}

interface RouteData {
  name: string
  type: "domestic" | "international"
  description: string
  stops: RouteStop[]
  totalDuration: number
  status: "active" | "inactive" | "draft"
  createdAt: string
  updatedAt: string
}

export default function EditRoute({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [routeData, setRouteData] = useState<RouteData>({
    name: "",
    type: "domestic",
    description: "",
    stops: [{ name: "", description: "", duration: 1 }],
    totalDuration: 1,
    status: "draft",
    createdAt: "",
    updatedAt: "",
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch route data
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true)
      try {
        const routeRef = ref(database, `routes/${id}`)
        const snapshot = await get(routeRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setRouteData(data)
        } else {
          setError("Маршрут олдсонгүй")
          toast({
            title: "Алдаа",
            description: "Маршрут олдсонгүй",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching route:", err)
        setError("Маршрутын мэдээллийг ачаалахад алдаа гарлаа")
        toast({
          title: "Алдаа гарлаа",
          description: "Маршрутын мэдээллийг ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [id, toast])

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
    const newStops = [...routeData.stops]

    if (field === "duration") {
      newStops[index][field] = Number(value) || 1
    } else {
      newStops[index][field] = value as string
    }

    setRouteData({
      ...routeData,
      stops: newStops,
    })
  }

  // Add new stop
  const addStop = () => {
    setRouteData({
      ...routeData,
      stops: [...routeData.stops, { name: "", description: "", duration: 1 }],
    })
  }

  // Remove stop
  const removeStop = (index: number) => {
    if (routeData.stops.length > 1) {
      const newStops = [...routeData.stops]
      newStops.splice(index, 1)
      setRouteData({
        ...routeData,
        stops: newStops,
      })
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
    const invalidStops = routeData.stops.filter((stop) => !stop.name || stop.duration <= 0)
    if (invalidStops.length > 0) {
      toast({
        title: "Зогсоолын мэдээлэл дутуу байна",
        description: "Бүх зогсоолын нэр болон хугацааг оруулна уу.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Get the route reference
      const routeRef = ref(database, `routes/${id}`)

      // Update route data
      await update(routeRef, {
        ...routeData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Маршрут амжилттай шинэчлэгдлээ",
        description: "Маршрутын мэдээлэл амжилттай хадгалагдлаа.",
      })

      // Redirect to routes list
      router.push("/admin/routes")
    } catch (err) {
      console.error("Error updating route:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Маршрутыг шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
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
        <Button onClick={() => router.push("/admin/routes")}>Маршрутуудын жагсаалт руу буцах</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Маршрут засах</h2>
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
              {routeData.stops.map((stop, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Зогсоол {index + 1}</Badge>
                    {routeData.stops.length > 1 && (
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
                  <div className="text-sm font-medium mb-2">Зогсоолууд ({routeData.stops.length}):</div>
                  <div className="space-y-2">
                    {routeData.stops.map((stop, index) => (
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

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Үүсгэсэн огноо</CardTitle>
              <CardDescription>Маршрутын үүсгэсэн болон шинэчилсэн огноо.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Үүсгэсэн огноо</Label>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                  {new Date(routeData.createdAt).toLocaleString("mn-MN")}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Сүүлд шинэчилсэн огноо</Label>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                  {new Date(routeData.updatedAt).toLocaleString("mn-MN")}
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
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveRoute} disabled={saving}>
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
