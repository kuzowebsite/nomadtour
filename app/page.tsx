"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Search,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Compass,
  Shield,
  Award,
  Phone,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

// Default content in case database is empty
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "1",
    image: "/mongolian-mountain-vista.png",
    badge: "#1 Аялалын Компани",
    title: "Монголын үзэсгэлэнт газруудаар аялаарай",
    description: "Монгол орны үзэсгэлэнт байгаль, соёл, уламжлалыг танд ойртуулж, мартагдашгүй дурсамжийг бүтээнэ",
    primaryText: "Аялал харах",
    primaryLink: "/tours",
    secondaryText: "Бидний тухай",
    secondaryLink: "/about",
  },
  {
    id: "2",
    image: "/gobi-desert-landscape.png",
    badge: "Шинэ аялал",
    title: "Говийн гайхамшигт байгальтай танилцаарай",
    description: "Говийн үзэсгэлэнт газрууд, Хонгорын элс, Баянзаг, Ёлын амаар аялах боломж",
    primaryText: "Дэлгэрэнгүй",
    primaryLink: "/tours/2",
    secondaryText: "Бусад аялалууд",
    secondaryLink: "/tours",
  },
  {
    id: "3",
    image: "/khovsgol-tranquility.png",
    badge: "Хамгийн эрэлттэй",
    title: "Хөвсгөл нуурын гайхамшигт аялал",
    description: "Монголын хамгийн том цэнгэг усны нуур, үзэсгэлэнт байгаль, цэвэр агаар",
    primaryText: "Захиалах",
    primaryLink: "/tours/1",
    secondaryText: "Мэдээлэл авах",
    secondaryLink: "/contact",
  },
]

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Батболд Д.",
    avatar: "/placeholder.svg?height=100&width=100",
    comment: "Маш сайхан аялал болсон. Хөтөч маш мэдлэгтэй, үйлчилгээ сайтай байсан. Дараа дахин аялна.",
    tour: "Хөвсгөл нуурын аялал",
  },
  {
    id: "2",
    name: "Оюунчимэг Б.",
    avatar: "/placeholder.svg?height=100&width=100",
    comment: "Говийн аялал маш сонирхолтой байлаа. Байгалийн үзэсгэлэнт газруудыг үзэж, шинэ найзуудтай болсон.",
    tour: "Говийн аялал",
  },
  {
    id: "3",
    name: "Ганбаатар Т.",
    avatar: "/placeholder.svg?height=100&width=100",
    comment: "Үнэхээр гайхалтай аялал болсон. Хоол, байр, тээвэр бүгд маш сайн зохион байгуулалттай байсан.",
    tour: "Тэрэлжийн аялал",
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [priceValue, setPriceValue] = useState(500000)
  const [isLoading, setIsLoading] = useState(true)

  // State for content from database
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides)
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)

        // Fetch home page content
        const homePageRef = ref(database, "homePageContent")
        const homePageSnapshot = await get(homePageRef)

        if (homePageSnapshot.exists()) {
          const homePageData = homePageSnapshot.val() as HomePageContent

          // Set hero slides if available
          if (homePageData.heroSlides && homePageData.heroSlides.length > 0) {
            setHeroSlides(homePageData.heroSlides)
          }

          // Set testimonials if available
          if (homePageData.testimonials && homePageData.testimonials.length > 0) {
            setTestimonials(homePageData.testimonials)
          }

          // Fetch featured tours
          if (homePageData.featuredTours && homePageData.featuredTours.length > 0) {
            const toursRef = ref(database, "tours")
            const toursSnapshot = await get(toursRef)

            if (toursSnapshot.exists()) {
              const toursData = toursSnapshot.val()
              const featuredToursData: Tour[] = []

              homePageData.featuredTours.forEach((tourId) => {
                if (toursData[tourId]) {
                  featuredToursData.push({
                    id: tourId,
                    price: 0, // Default price
                    ...toursData[tourId],
                  })
                }
              })

              setFeaturedTours(featuredToursData)
            }
          } else {
            // Fetch default tours if no featured tours are specified
            const toursRef = ref(database, "tours")
            const toursSnapshot = await get(toursRef)

            if (toursSnapshot.exists()) {
              const toursData = toursSnapshot.val()
              const toursArray = Object.keys(toursData)
                .slice(0, 3)
                .map((key) => ({
                  id: key,
                  price: 0, // Default price
                  ...toursData[key],
                }))
              setFeaturedTours(toursArray)
            }
          }

          // Fetch featured destinations
          if (homePageData.featuredDestinations && homePageData.featuredDestinations.length > 0) {
            const destinationsRef = ref(database, "destinations")
            const destinationsSnapshot = await get(destinationsRef)

            if (destinationsSnapshot.exists()) {
              const destinationsData = destinationsSnapshot.val()
              const featuredDestinationsData: Destination[] = []

              homePageData.featuredDestinations.forEach((destId) => {
                if (destinationsData[destId]) {
                  featuredDestinationsData.push({
                    id: destId,
                    ...destinationsData[destId],
                  })
                }
              })

              setFeaturedDestinations(featuredDestinationsData)
            }
          } else {
            // Fetch default destinations if no featured destinations are specified
            const destinationsRef = ref(database, "destinations")
            const destinationsSnapshot = await get(destinationsRef)

            if (destinationsSnapshot.exists()) {
              const destinationsData = destinationsSnapshot.val()
              const destinationsArray = Object.keys(destinationsData)
                .slice(0, 5)
                .map((key) => ({
                  id: key,
                  ...destinationsData[key],
                }))
              setFeaturedDestinations(destinationsArray)
            }
          }
        } else {
          // If no home page content exists, fetch default tours and destinations
          const toursRef = ref(database, "tours")
          const toursSnapshot = await get(toursRef)

          if (toursSnapshot.exists()) {
            const toursData = toursSnapshot.val()
            const toursArray = Object.keys(toursData)
              .slice(0, 3)
              .map((key) => ({
                id: key,
                price: 0, // Default price
                ...toursData[key],
              }))
            setFeaturedTours(toursArray)
          }

          const destinationsRef = ref(database, "destinations")
          const destinationsSnapshot = await get(destinationsRef)

          if (destinationsSnapshot.exists()) {
            const destinationsData = destinationsSnapshot.val()
            const destinationsArray = Object.keys(destinationsData)
              .slice(0, 5)
              .map((key) => ({
                id: key,
                ...destinationsData[key],
              }))
            setFeaturedDestinations(destinationsArray)
          }
        }
      } catch (error) {
        console.error("Error fetching home page content:", error)
        // Use default content in case of error
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Handle hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        <span className="ml-4 text-xl font-medium">Ачааллаж байна...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Slider */}
        <section className="relative h-screen">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                currentSlide === index ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center z-20">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center">
                    <Badge className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-sm">
                      {slide.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">{slide.title}</h1>
                    <p className="text-xl text-white/90 mb-10 leading-relaxed">{slide.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg h-12 px-8" asChild>
                        <Link href={slide.primaryLink}>
                          {slide.primaryText} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/20 hover:text-white text-lg h-12 px-8"
                        asChild
                      >
                        <Link href={slide.secondaryLink}>{slide.secondaryText}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider controls */}
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentSlide === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80",
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slider arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </section>

        {/* Search Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8 -mt-32 relative z-30">
              <h2 className="text-2xl font-bold mb-6 text-center">Аялалаа хайж олоорой</h2>
              <Tabs defaultValue="price" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="price" className="text-base py-3">
                    Үнээр хайх
                  </TabsTrigger>
                  <TabsTrigger value="destination" className="text-base py-3">
                    Чиглэлээр хайх
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="price" className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-base font-medium">Төсөв (₮)</label>
                      <span className="font-medium text-emerald-600">{priceValue.toLocaleString()}₮</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">100,000₮</span>
                      <Slider
                        defaultValue={[500000]}
                        max={2000000}
                        step={50000}
                        className="flex-1"
                        onValueChange={(value) => {
                          setPriceValue(value[0])
                        }}
                      />
                      <span className="text-sm font-medium">2,000,000₮</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Хүний тоо</label>
                      <div className="flex items-center border rounded-md">
                        <Input type="number" min="1" defaultValue="2" className="border-0" />
                        <Users className="h-4 w-4 mr-3 text-gray-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Эхлэх огноо</label>
                      <div className="flex items-center border rounded-md">
                        <Input type="date" className="border-0" />
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дуусах огноо</label>
                      <div className="flex items-center border rounded-md">
                        <Input type="date" className="border-0" />
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                    onClick={() => {
                      const peopleInput = document.querySelector('input[type="number"]') as HTMLInputElement
                      const people = peopleInput ? peopleInput.value : "2"
                      window.location.href = `/tours?price=${priceValue}&people=${people}`
                    }}
                  >
                    <Search className="mr-2 h-5 w-5" /> Аялал хайх
                  </Button>
                </TabsContent>
                <TabsContent value="destination" className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Чиглэл</label>
                    <div className="flex items-center border rounded-md">
                      <Input type="text" placeholder="Чиглэлээ оруулна уу" className="border-0" />
                      <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Эхлэх огноо</label>
                      <div className="flex items-center border rounded-md">
                        <Input type="date" className="border-0" />
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дуусах огноо</label>
                      <div className="flex items-center border rounded-md">
                        <Input type="date" className="border-0" />
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base">
                    <Search className="mr-2 h-5 w-5" /> Аялал хайх
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-1">
                ОНЦЛОХ АЯЛАЛУУД
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Хамгийн алдартай аялалууд</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Монгол орны үзэсгэлэнт газруудаар аялах хамгийн шилдэг сонголтуудыг танд санал болгож байна
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <div key={tour.id} className="group">
                  <Card className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={tour.image || "/placeholder.svg"}
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 m-3 rounded-full text-sm font-medium">
                        {(tour.price || 0).toLocaleString()}₮
                      </div>
                      {tour.discount && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 m-3 rounded-full text-sm font-medium">
                          -{tour.discount}%
                        </div>
                      )}
                      <button className="absolute bottom-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full text-rose-500 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                        {tour.title}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-emerald-500" /> {tour.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>
                      <div className="flex items-center mt-3 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">(32 сэтгэгдэл)</span>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                          <span>{tour.duration} өдөр</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-emerald-500" />
                          <span>2-8 хүн</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                        <Link href={`/tours/${tour.id}`}>
                          Дэлгэрэнгүй <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Link href="/tours" className="flex items-center">
                  Бүх аялалыг харах <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Destinations Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-1">ЧИГЛЭЛҮҮД</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Алдартай чиглэлүүд</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Монгол орны хамгийн үзэсгэлэнтэй, аялагчдын дунд алдартай газруудаар аялаарай
              </p>
            </div>

            {featuredDestinations.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* First destination is larger */}
                <div className="relative col-span-2 row-span-2 rounded-xl overflow-hidden group">
                  <img
                    src={featuredDestinations[0]?.image || "/khovsgol-tranquility.png"}
                    alt={featuredDestinations[0]?.name || "Хөвсгөл нуур"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ height: "500px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {featuredDestinations[0]?.name || "Хөвсгөл нуур"}
                    </h3>
                    <div className="flex items-center text-white/90">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{featuredDestinations[0]?.location || "Хөвсгөл аймаг"}</span>
                    </div>
                  </div>
                  <Link
                    href={`/tours?destination=${featuredDestinations[0]?.slug || "khovsgol"}`}
                    className="absolute inset-0 z-10"
                  >
                    <span className="sr-only">{featuredDestinations[0]?.name || "Хөвсгөл нуур"} аялалууд</span>
                  </Link>
                </div>

                {/* Other destinations */}
                {featuredDestinations.slice(1, 5).map((destination, index) => (
                  <div key={destination.id} className="relative rounded-xl overflow-hidden group">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ height: "240px" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{destination.name}</h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{destination.location}</span>
                      </div>
                    </div>
                    <Link href={`/tours?destination=${destination.slug}`} className="absolute inset-0 z-10">
                      <span className="sr-only">{destination.name} аялалууд</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-emerald-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-800 text-emerald-100 hover:bg-emerald-700 px-4 py-1">
                БИДНИЙ ТУХАЙ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Яагаад бидэнтэй аялах вэ?</h2>
              <p className="text-emerald-100 max-w-2xl mx-auto">
                NomadTour нь таны хүсэл сонирхол, төсөвт тохирсон аяллыг санал болгодог
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-emerald-800/50 p-8 rounded-xl hover:bg-emerald-800 transition-colors duration-300">
                <div className="bg-emerald-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">Хэрэглэгчдэд ээлтэй</h3>
                <p className="text-emerald-100 text-center">
                  Таны төсөвт тохирсон аяллыг санал болгож, таны хүсэлд нийцсэн үйлчилгээг үзүүлнэ
                </p>
              </div>

              <div className="bg-emerald-800/50 p-8 rounded-xl hover:bg-emerald-800 transition-colors duration-300">
                <div className="bg-emerald-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">Онцгой чиглэлүүд</h3>
                <p className="text-emerald-100 text-center">Монгол орны үзэсгэлэнт газруудаар аялах боломжийг олгоно</p>
              </div>

              <div className="bg-emerald-800/50 p-8 rounded-xl hover:bg-emerald-800 transition-colors duration-300">
                <div className="bg-emerald-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">Найдвартай үйлчилгээ</h3>
                <p className="text-emerald-100 text-center">
                  Мэргэжлийн хөтөч, аюулгүй тээврийн хэрэгсэл, чанартай үйлчилгээ
                </p>
              </div>

              <div className="bg-emerald-800/50 p-8 rounded-xl hover:bg-emerald-800 transition-colors duration-300">
                <div className="bg-emerald-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">24/7 Дэмжлэг</h3>
                <p className="text-emerald-100 text-center">
                  Аялалын турш 24 цагийн турш холбоо барих боломжтой, асуудал шийдвэрлэх үйлчилгээ
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-1">СЭТГЭГДЛҮҮД</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Үйлчлүүлэгчдийн сэтгэгдэл</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Бидний үйлчилгээг сонгосон үйлчлүүлэгчдийн сэтгэгдлүүд</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <CardContent className="p-8">
                    <div className="flex items-center text-amber-500 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img
                          src={testimonial.avatar || "/placeholder.svg?height=100&width=100"}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.tour}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-emerald-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Монголын үзэсгэлэнт байгальтай танилцах цаг ирлээ</h2>
              <p className="text-xl text-white/90 mb-8">
                Бид таны хүсэл мөрөөдөлд тохирсон аяллыг зохион байгуулж, мартагдашгүй дурсамжийг бүтээхэд тусална
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-lg h-12 px-8" asChild>
                  <Link href="/tours">
                    Аялал захиалах <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 hover:text-white text-lg h-12 px-8"
                  asChild
                >
                  <Link href="/contact">Холбоо барих</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Шинэ аялалын мэдээлэл авах</h2>
                <p className="text-gray-600">
                  Хамгийн сүүлийн үеийн аялалын мэдээлэл, хямдралын санал авахыг хүсвэл бүртгүүлээрэй
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Input type="email" placeholder="Имэйл хаягаа оруулна уу" className="md:flex-1 h-12" />
                <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">Бүртгүүлэх</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const navItems = [
  { label: "Нүүр", href: "/" },
  { label: "Аялалууд", href: "/tours" },
  { label: "Чиглэлүүд", href: "/destinations" },
  { label: "Бидний тухай", href: "/about" },
  { label: "Холбоо барих", href: "/contact" },
]
