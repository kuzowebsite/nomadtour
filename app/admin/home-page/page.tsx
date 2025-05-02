"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, get, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { Trash2, Plus, Save, ArrowUp, ArrowDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ImageUpload from "@/components/image-upload"
import { uploadImage } from "@/lib/storage"

// Types for our home page content
interface HeroSlide {
  id: string
  image: string
  badge: string
  title: string
  description: string
  primaryText: string
  primaryLink: string
  secondaryText: string
  secondaryLink: string
}

interface Tour {
  id: string
  title: string
  location: string
  description: string
  price: number
  duration: number
  image: string
  discount?: number
}

interface Destination {
  id: string
  name: string
  location: string
  image: string
  slug: string
}

interface Testimonial {
  id: string
  name: string
  avatar: string
  comment: string
  tour: string
}

interface HomePageContent {
  heroSlides: HeroSlide[]
  featuredTours: string[] // IDs of tours to feature
  featuredDestinations: string[] // IDs of destinations to feature
  testimonials: Testimonial[]
}

export default function HomePageAdmin() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [content, setContent] = useState<HomePageContent>({
    heroSlides: [],
    featuredTours: [],
    featuredDestinations: [],
    testimonials: [],
  })
  const [allTours, setAllTours] = useState<Tour[]>([])
  const [allDestinations, setAllDestinations] = useState<Destination[]>([])

  // Fetch home page content and all tours/destinations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch home page content
        const homePageRef = ref(database, "homePageContent")
        const homePageSnapshot = await get(homePageRef)

        // Fetch all tours
        const toursRef = ref(database, "tours")
        const toursSnapshot = await get(toursRef)

        // Fetch all destinations
        const destinationsRef = ref(database, "destinations")
        const destinationsSnapshot = await get(destinationsRef)

        let homePageData: HomePageContent = {
          heroSlides: [],
          featuredTours: [],
          featuredDestinations: [],
          testimonials: [],
        }

        if (homePageSnapshot.exists()) {
          homePageData = homePageSnapshot.val()
        }

        // Ensure all arrays exist
        if (!homePageData.heroSlides) homePageData.heroSlides = []
        if (!homePageData.featuredTours) homePageData.featuredTours = []
        if (!homePageData.featuredDestinations) homePageData.featuredDestinations = []
        if (!homePageData.testimonials) homePageData.testimonials = []

        setContent(homePageData)

        if (toursSnapshot.exists()) {
          const toursData = toursSnapshot.val()
          const toursArray = Object.keys(toursData).map((key) => ({
            id: key,
            ...toursData[key],
          }))
          setAllTours(toursArray)
        }

        if (destinationsSnapshot.exists()) {
          const destinationsData = destinationsSnapshot.val()
          const destinationsArray = Object.keys(destinationsData).map((key) => ({
            id: key,
            ...destinationsData[key],
          }))
          setAllDestinations(destinationsArray)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Мэдээлэл ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Save all content to Firebase
  const handleSaveContent = async () => {
    try {
      setIsSaving(true)
      const homePageRef = ref(database, "homePageContent")
      await set(homePageRef, content)

      toast({
        title: "Амжилттай хадгалагдлаа",
        description: "Нүүр хуудасны мэдээлэл амжилттай шинэчлэгдлээ.",
      })

      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Мэдээлэл хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Hero Slides Management
  const addHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      image: "/placeholder.svg",
      badge: "Шинэ",
      title: "Шинэ гарчиг",
      description: "Энд тайлбар бичнэ",
      primaryText: "Дэлгэрэнгүй",
      primaryLink: "/tours",
      secondaryText: "Холбоо барих",
      secondaryLink: "/contact",
    }

    setContent((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }))
  }

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string | number) => {
    const updatedSlides = [...content.heroSlides]
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value,
    }

    setContent((prev) => ({
      ...prev,
      heroSlides: updatedSlides,
    }))
  }

  const removeHeroSlide = (index: number) => {
    const updatedSlides = content.heroSlides.filter((_, i) => i !== index)
    setContent((prev) => ({
      ...prev,
      heroSlides: updatedSlides,
    }))
  }

  const moveHeroSlide = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === content.heroSlides.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const updatedSlides = [...content.heroSlides]
    const temp = updatedSlides[index]
    updatedSlides[index] = updatedSlides[newIndex]
    updatedSlides[newIndex] = temp

    setContent((prev) => ({
      ...prev,
      heroSlides: updatedSlides,
    }))
  }

  // Handle image upload for hero slides
  const handleHeroImageUpload = async (index: number, file: File) => {
    try {
      const imageUrl = await uploadImage(file, "hero-slides")
      updateHeroSlide(index, "image", imageUrl)

      toast({
        title: "Зураг амжилттай хадгалагдлаа",
        description: "Зургийг амжилттай хадгалж, слайдад оруулав.",
      })
    } catch (error) {
      console.error("Error uploading hero image:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Зураг хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    }
  }

  // Featured Tours Management
  const toggleFeaturedTour = (tourId: string) => {
    if (content.featuredTours.includes(tourId)) {
      setContent((prev) => ({
        ...prev,
        featuredTours: prev.featuredTours.filter((id) => id !== tourId),
      }))
    } else {
      setContent((prev) => ({
        ...prev,
        featuredTours: [...prev.featuredTours, tourId],
      }))
    }
  }

  // Featured Destinations Management
  const toggleFeaturedDestination = (destinationId: string) => {
    if (content.featuredDestinations.includes(destinationId)) {
      setContent((prev) => ({
        ...prev,
        featuredDestinations: prev.featuredDestinations.filter((id) => id !== destinationId),
      }))
    } else {
      setContent((prev) => ({
        ...prev,
        featuredDestinations: [...prev.featuredDestinations, destinationId],
      }))
    }
  }

  // Testimonials Management
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: "Шинэ хэрэглэгч",
      avatar: "/placeholder.svg?height=100&width=100",
      comment: "Энд сэтгэгдэл бичнэ",
      tour: "Аялалын нэр",
    }

    setContent((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }))
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string) => {
    const updatedTestimonials = [...content.testimonials]
    updatedTestimonials[index] = {
      ...updatedTestimonials[index],
      [field]: value,
    }

    setContent((prev) => ({
      ...prev,
      testimonials: updatedTestimonials,
    }))
  }

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = content.testimonials.filter((_, i) => i !== index)
    setContent((prev) => ({
      ...prev,
      testimonials: updatedTestimonials,
    }))
  }

  // Handle image upload for testimonials
  const handleTestimonialImageUpload = async (index: number, file: File) => {
    try {
      const imageUrl = await uploadImage(file, "testimonials")
      updateTestimonial(index, "avatar", imageUrl)

      toast({
        title: "Зураг амжилттай хадгалагдлаа",
        description: "Зургийг амжилттай хадгалж, сэтгэгдэлд оруулав.",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error uploading testimonial image:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Зураг хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-lg">Ачааллаж байна...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Нүүр хуудасны удирдлага</h2>
          <p className="text-muted-foreground">Нүүр хуудасны агуулгыг энд удирдана.</p>
        </div>
        <Button onClick={handleSaveContent} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Хадгалж байна...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Бүгдийг хадгалах
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero хэсэг</TabsTrigger>
          <TabsTrigger value="tours">Онцлох аялалууд</TabsTrigger>
          <TabsTrigger value="destinations">Чиглэлүүд</TabsTrigger>
          <TabsTrigger value="testimonials">Сэтгэгдлүүд</TabsTrigger>
        </TabsList>

        {/* Hero Slides Tab */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Hero слайдууд</h3>
            <Button onClick={addHeroSlide} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Слайд нэмэх
            </Button>
          </div>

          {content.heroSlides.length === 0 ? (
            <Alert>
              <AlertTitle>Слайд байхгүй байна</AlertTitle>
              <AlertDescription>"Слайд нэмэх" товчийг дарж шинэ слайд үүсгэнэ үү.</AlertDescription>
            </Alert>
          ) : (
            content.heroSlides.map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Слайд {index + 1}</CardTitle>
                    <CardDescription>{slide.title}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveHeroSlide(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveHeroSlide(index, "down")}
                      disabled={index === content.heroSlides.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeroSlide(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-image`}>Зураг</Label>
                      <ImageUpload
                        folder="hero-slides"
                        onUploadComplete={(url) => updateHeroSlide(index, "image", url)}
                        existingUrl={slide.image}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-badge`}>Badge текст</Label>
                      <Input
                        id={`slide-${index}-badge`}
                        value={slide.badge}
                        onChange={(e) => updateHeroSlide(index, "badge", e.target.value)}
                        placeholder="Шинэ аялал"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`slide-${index}-title`}>Гарчиг</Label>
                    <Input
                      id={`slide-${index}-title`}
                      value={slide.title}
                      onChange={(e) => updateHeroSlide(index, "title", e.target.value)}
                      placeholder="Слайдын гарчиг"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`slide-${index}-description`}>Тайлбар</Label>
                    <Textarea
                      id={`slide-${index}-description`}
                      value={slide.description}
                      onChange={(e) => updateHeroSlide(index, "description", e.target.value)}
                      placeholder="Слайдын тайлбар текст"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-primary-text`}>Үндсэн товчны текст</Label>
                      <Input
                        id={`slide-${index}-primary-text`}
                        value={slide.primaryText}
                        onChange={(e) => updateHeroSlide(index, "primaryText", e.target.value)}
                        placeholder="Дэлгэрэнгүй"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-primary-link`}>Үндсэн товчны холбоос</Label>
                      <Input
                        id={`slide-${index}-primary-link`}
                        value={slide.primaryLink}
                        onChange={(e) => updateHeroSlide(index, "primaryLink", e.target.value)}
                        placeholder="/tours"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-secondary-text`}>Хоёрдогч товчны текст</Label>
                      <Input
                        id={`slide-${index}-secondary-text`}
                        value={slide.secondaryText}
                        onChange={(e) => updateHeroSlide(index, "secondaryText", e.target.value)}
                        placeholder="Холбоо барих"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`slide-${index}-secondary-link`}>Хоёрдогч товчны холбоос</Label>
                      <Input
                        id={`slide-${index}-secondary-link`}
                        value={slide.secondaryLink}
                        onChange={(e) => updateHeroSlide(index, "secondaryLink", e.target.value)}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Featured Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Онцлох аялалууд</h3>
            <p className="text-sm text-gray-500">Нүүр хуудсанд харуулах аялалуудыг сонгоно уу</p>
          </div>

          {allTours.length === 0 ? (
            <Alert>
              <AlertTitle>Аялал байхгүй байна</AlertTitle>
              <AlertDescription>
                Эхлээд аялалууд үүсгэх хэрэгтэй.{" "}
                <a href="/admin/tours/new" className="text-blue-600 hover:underline">
                  Аялал үүсгэх
                </a>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTours.map((tour) => (
                <Card
                  key={tour.id}
                  className={`cursor-pointer transition-all ${
                    content.featuredTours.includes(tour.id) ? "border-emerald-500 shadow-md" : "border-gray-200"
                  }`}
                  onClick={() => toggleFeaturedTour(tour.id)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={tour.image || "/placeholder.svg"}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                    {content.featuredTours.includes(tour.id) && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{tour.title}</h4>
                    <p className="text-sm text-gray-500">{tour.location}</p>
                    <p className="text-sm font-medium mt-2">{(tour.price || 0).toLocaleString()}₮</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Featured Destinations Tab */}
        <TabsContent value="destinations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Онцлох чиглэлүүд</h3>
            <p className="text-sm text-gray-500">Нүүр хуудсанд харуулах чиглэлүүдийг сонгоно уу</p>
          </div>

          {allDestinations.length === 0 ? (
            <Alert>
              <AlertTitle>Чиглэл байхгүй байна</AlertTitle>
              <AlertDescription>Эхлээд чиглэлүүд үүсгэх хэрэгтэй.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  className={`cursor-pointer transition-all ${
                    content.featuredDestinations.includes(destination.id)
                      ? "border-emerald-500 shadow-md"
                      : "border-gray-200"
                  }`}
                  onClick={() => toggleFeaturedDestination(destination.id)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    {content.featuredDestinations.includes(destination.id) && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{destination.name}</h4>
                    <p className="text-sm text-gray-500">{destination.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Сэтгэгдлүүд</h3>
            <Button onClick={addTestimonial} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Сэтгэгдэл нэмэх
            </Button>
          </div>

          {content.testimonials.length === 0 ? (
            <Alert>
              <AlertTitle>Сэтгэгдэл байхгүй байна</AlertTitle>
              <AlertDescription>"Сэтгэгдэл нэмэх" товчийг дарж шинэ сэтгэгдэл үүсгэнэ үү.</AlertDescription>
            </Alert>
          ) : (
            content.testimonials.map((testimonial, index) => (
              <Card key={testimonial.id}>
                <CardHeader className="bg-gray-50 flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">Сэтгэгдэл {index + 1}</CardTitle>
                    <CardDescription>{testimonial.name}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestimonial(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`testimonial-${index}-name`}>Нэр</Label>
                      <Input
                        id={`testimonial-${index}-name`}
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                        placeholder="Хэрэглэгчийн нэр"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`testimonial-${index}-avatar`}>Зураг</Label>
                      <ImageUpload
                        folder="testimonials"
                        onUploadComplete={(url) => updateTestimonial(index, "avatar", url)}
                        existingUrl={testimonial.avatar}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`testimonial-${index}-comment`}>Сэтгэгдэл</Label>
                    <Textarea
                      id={`testimonial-${index}-comment`}
                      value={testimonial.comment}
                      onChange={(e) => updateTestimonial(index, "comment", e.target.value)}
                      placeholder="Хэрэглэгчийн сэтгэгдэл"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`testimonial-${index}-tour`}>Аялалын нэр</Label>
                    <Input
                      id={`testimonial-${index}-tour`}
                      value={testimonial.tour}
                      onChange={(e) => updateTestimonial(index, "tour", e.target.value)}
                      placeholder="Аялалын нэр"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveContent} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Хадгалж байна...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Бүгдийг хадгалах
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
