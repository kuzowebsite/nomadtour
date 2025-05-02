"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { MapPin, Clock, Search, Star, ChevronRight, Calendar, Users, SlidersHorizontal, X, Tag } from "lucide-react"
import Header from "@/components/header"

// Updated interface to match the actual data structure from Firebase
interface Tour {
  id: string
  title: string
  description: string
  adultPrice: number
  childPrice?: number
  duration: number
  location: string
  image: string
  startDate?: string
  endDate?: string
  maxGroupSize?: number
  types: string[]
  category: string
  featured?: boolean
  rating?: number
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [duration, setDuration] = useState("all")
  const [location, setLocation] = useState("all")
  const [rating, setRating] = useState("all")
  const [tourType, setTourType] = useState("all")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const { toast } = useToast()

  // Get unique locations from tours
  const locations = [...new Set(tours.map((tour) => tour.location).filter(Boolean))]

  // Get unique tour types from tours
  const tourTypes = [...new Set(tours.flatMap((tour) => tour.types || []).filter(Boolean))]

  // Determine if a tour is domestic or international based on category
  const isDomestic = (category: string) => {
    return category === "domestic"
  }

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true)
        // Fetch all tours without ordering by createdAt
        const toursRef = ref(database, "tours")
        const snapshot = await get(toursRef)

        if (snapshot.exists()) {
          const toursData = snapshot.val()
          const toursArray = Object.keys(toursData).map((key) => ({
            id: key,
            ...toursData[key],
            // Add random rating if not present for demo purposes
            rating: toursData[key].rating || Math.floor(Math.random() * 2) + 3 + Math.random(),
          }))

          // Sort tours by title if available, safely handle missing properties
          const sortedTours = toursArray.sort((a, b) => {
            // Check if title exists before using localeCompare
            if (a.title && b.title) {
              return a.title.localeCompare(b.title)
            }
            // Fallback sorting logic if title is missing
            return 0
          })

          setTours(sortedTours)
          setFilteredTours(sortedTours)
        } else {
          setTours([])
          setFilteredTours([])
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
        toast({
          title: "Алдаа",
          description: "Аялалуудыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [toast])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (activeTab !== "all") count++
    if (priceRange !== "all") count++
    if (duration !== "all") count++
    if (location !== "all") count++
    if (rating !== "all") count++
    if (selectedTypes.length > 0) count++
    if (searchQuery) count++

    setActiveFiltersCount(count)

    // Filter tours based on all criteria
    let filtered = [...tours]

    // Filter by tab (all, domestic, international)
    if (activeTab === "domestic") {
      filtered = filtered.filter((tour) => isDomestic(tour.category))
    } else if (activeTab === "international") {
      filtered = filtered.filter((tour) => !isDomestic(tour.category))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tour) =>
          (tour.title && tour.title.toLowerCase().includes(query)) ||
          (tour.description && tour.description.toLowerCase().includes(query)) ||
          (tour.location && tour.location.toLowerCase().includes(query)),
      )
    }

    // Filter by price range
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter((tour) => {
        const price = tour.adultPrice || 0
        return price >= min && (max ? price <= max : true)
      })
    }

    // Filter by duration
    if (duration !== "all") {
      const [min, max] = duration.split("-").map(Number)
      filtered = filtered.filter((tour) => {
        const tourDuration = tour.duration || 0
        return tourDuration >= min && (max ? tourDuration <= max : true)
      })
    }

    // Filter by location
    if (location !== "all") {
      filtered = filtered.filter((tour) => tour.location === location)
    }

    // Filter by rating
    if (rating !== "all") {
      const minRating = Number.parseFloat(rating)
      filtered = filtered.filter((tour) => {
        const tourRating = tour.rating || 0
        return tourRating >= minRating
      })
    }

    // Filter by selected tour types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((tour) => {
        // If tour has no types, filter it out when types are selected
        if (!tour.types || tour.types.length === 0) return false

        // Check if any of the tour's types match any of the selected types
        return selectedTypes.some((type) => tour.types.includes(type))
      })
    }

    setFilteredTours(filtered)
  }, [tours, activeTab, searchQuery, priceRange, duration, location, rating, selectedTypes])

  const resetFilters = () => {
    setActiveTab("all")
    setSearchQuery("")
    setPriceRange("all")
    setDuration("all")
    setLocation("all")
    setRating("all")
    setSelectedTypes([])
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Get featured tours
  const featuredTours = tours.filter((tour) => tour.featured)

  // Function to render star rating
  const renderRating = (rating = 0) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "text-yellow-500 fill-yellow-500"
                : i === fullStars && hasHalfStar
                  ? "text-yellow-500 fill-yellow-500 opacity-60"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 h-[40vh] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/mongolian-mountain-vista.png"
            alt="Монгол уулс"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Бидний Аялалууд</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Монгол орны үзэсгэлэнт газруудаар аялах болон гадаад орнуудын соёл, түүхийг танин мэдэх аяллуудыг санал
            болгож байна
          </p>
        </div>
      </div>

      <main className="container mx-auto py-8 px-4">
        {/* Search and Main Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 -mt-10 relative z-20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Аялал хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg rounded-lg border-gray-200"
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 min-w-[300px]">
                <TabsTrigger value="all" className="text-sm md:text-base">
                  Бүх Аялалууд
                </TabsTrigger>
                <TabsTrigger value="domestic" className="text-sm md:text-base">
                  Дотоодын
                </TabsTrigger>
                <TabsTrigger value="international" className="text-sm md:text-base">
                  Гадаадын
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-2 py-6 px-4 border-gray-200 relative"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Шүүлтүүр</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Дэлгэрэнгүй шүүлтүүр</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4 mr-1" />
                  Цэвэрлэх
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Үнийн хязгаар</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Үнийн хязгаар" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх үнэ</SelectItem>
                      <SelectItem value="0-500000">₮500,000 хүртэл</SelectItem>
                      <SelectItem value="500000-1000000">₮500,000 - ₮1,000,000</SelectItem>
                      <SelectItem value="1000000-2000000">₮1,000,000 - ₮2,000,000</SelectItem>
                      <SelectItem value="2000000-5000000">₮2,000,000 - ₮5,000,000</SelectItem>
                      <SelectItem value="5000000">₮5,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Хугацаа</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Хугацаа" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх хугацаа</SelectItem>
                      <SelectItem value="1-3">1-3 өдөр</SelectItem>
                      <SelectItem value="4-7">4-7 өдөр</SelectItem>
                      <SelectItem value="8-14">8-14 өдөр</SelectItem>
                      <SelectItem value="15">15+ өдөр</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Байршил</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Байршил" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх байршил</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Үнэлгээ</label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Үнэлгээ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх үнэлгээ</SelectItem>
                      <SelectItem value="5">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">5 од</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">4+ од</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">3+ од</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">2+ од</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">1+ од</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tour Types Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Аялалын төрөл</label>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tourTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => handleTypeChange(type)}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2 py-1">Идэвхтэй шүүлтүүр:</span>

                  {activeTab !== "all" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      {activeTab === "domestic" ? "Дотоодын" : "Гадаадын"}
                      <button onClick={() => setActiveTab("all")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {searchQuery && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Хайлт: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {priceRange !== "all" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Үнэ:{" "}
                      {priceRange === "0-500000"
                        ? "₮500,000 хүртэл"
                        : priceRange === "500000-1000000"
                          ? "₮500,000 - ₮1,000,000"
                          : priceRange === "1000000-2000000"
                            ? "₮1,000,000 - ₮2,000,000"
                            : priceRange === "2000000-5000000"
                              ? "₮2,000,000 - ₮5,000,000"
                              : "₮5,000,000+"}
                      <button onClick={() => setPriceRange("all")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {duration !== "all" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Хугацаа:{" "}
                      {duration === "1-3"
                        ? "1-3 өдөр"
                        : duration === "4-7"
                          ? "4-7 өдөр"
                          : duration === "8-14"
                            ? "8-14 өдөр"
                            : "15+ өдөр"}
                      <button onClick={() => setDuration("all")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {location !== "all" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Байршил: {location}
                      <button onClick={() => setLocation("all")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {rating !== "all" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Үнэлгээ: {rating}+ од
                      <button onClick={() => setRating("all")} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {selectedTypes.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                      Төрөл: {selectedTypes.length} сонгосон
                      <button onClick={() => setSelectedTypes([])} className="ml-1 hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                    Бүгдийг цэвэрлэх
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured Tours Section */}
        {featuredTours.length > 0 && !loading && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                Онцлох Аялалууд
              </h2>
              <Link href="/tours?featured=true" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Бүгдийг харах
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTours.slice(0, 3).map((tour) => (
                <Link href={`/tours/${tour.id}`} key={tour.id}>
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                    <div className="relative h-56">
                      <img
                        src={tour.image || "/placeholder.svg?height=400&width=600&query=tour"}
                        alt={tour.title || "Аялал"}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-lg font-medium">
                        Онцлох
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                          {tour.title || "Нэргүй аялал"}
                        </h3>
                        <p className="text-lg font-bold text-blue-600">₮{(tour.adultPrice || 0).toLocaleString()}</p>
                      </div>

                      {/* Rating */}
                      {tour.rating && <div className="mb-2">{renderRating(tour.rating)}</div>}

                      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description || "Тайлбар байхгүй"}</p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{tour.location || "Байршил"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{tour.duration || 0} өдөр</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>{tour.category === "domestic" ? "Дотоодын" : "Гадаадын"}</span>
                        </div>
                      </div>

                      {/* Tour Types */}
                      {tour.types && tour.types.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tour.types.slice(0, 3).map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {type}
                            </span>
                          ))}
                          {tour.types.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{tour.types.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Дэлгэрэнгүй үзэх</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Tours Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === "all"
              ? "Бүх Аялалууд"
              : activeTab === "domestic"
                ? "Дотоодын Аялалууд"
                : "Гадаадын Аялалууд"}
            {filteredTours.length > 0 && (
              <span className="text-gray-500 font-normal text-lg ml-2">({filteredTours.length})</span>
            )}
          </h2>

          {/* Tours Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg">
                  <Skeleton className="h-56 w-full" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-7 w-3/5 mb-2" />
                      <Skeleton className="h-7 w-1/5" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-4/5 mb-4" />
                    <div className="flex gap-3 mb-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <Link href={`/tours/${tour.id}`} key={tour.id}>
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                    <div className="relative h-56">
                      <img
                        src={tour.image || "/placeholder.svg?height=400&width=600&query=tour"}
                        alt={tour.title || "Аялал"}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      {tour.featured && (
                        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-lg font-medium">
                          Онцлох
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                          {tour.title || "Нэргүй аялал"}
                        </h3>
                        <p className="text-lg font-bold text-blue-600">₮{(tour.adultPrice || 0).toLocaleString()}</p>
                      </div>

                      {/* Rating */}
                      {tour.rating && <div className="mb-2">{renderRating(tour.rating)}</div>}

                      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description || "Тайлбар байхгүй"}</p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{tour.location || "Байршил"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{tour.duration || 0} өдөр</span>
                        </div>
                        {tour.maxGroupSize && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{tour.maxGroupSize} хүн</span>
                          </div>
                        )}
                      </div>

                      {/* Tour Types */}
                      {tour.types && tour.types.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tour.types.slice(0, 3).map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {type}
                            </span>
                          ))}
                          {tour.types.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{tour.types.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Дэлгэрэнгүй үзэх</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-medium mb-2">Аялал олдсонгүй</h3>
                <p className="text-gray-500 mb-6">Шүүлтүүр эсвэл хайлтын утгаа өөрчилнө үү</p>
                <Button onClick={resetFilters} size="lg">
                  Бүх шүүлтүүрийг арилгах
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
