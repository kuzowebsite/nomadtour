"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDatabase, ref, get } from "firebase/database"
import { Calendar, Clock, MapPin, Users, Star, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import BookingForm from "@/components/booking-form"
import SaveTourButton from "@/components/save-tour-button"
import Link from "next/link"

export default function TourDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tour, setTour] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<string>("description")
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const db = getDatabase()
        const tourRef = ref(db, `tours/${id}`)
        const snapshot = await get(tourRef)

        if (snapshot.exists()) {
          setTour({ id: snapshot.key, ...snapshot.val() })
        } else {
          setError("Аялал олдсонгүй")
        }
      } catch (err) {
        console.error("Error fetching tour:", err)
        setError("Аялалын мэдээлэл авахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTour()
    }
  }, [id])

  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection("")
    } else {
      setOpenSection(section)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Алдаа</h1>
            <p className="text-gray-600 mb-6">{error || "Аялалын мэдээлэл олдсонгүй"}</p>
            <Link href="/tours" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Бүх аялалууд руу буцах
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ensure price is a number
  const tourPrice =
    typeof tour.price === "number" ? tour.price : typeof tour.adultPrice === "number" ? tour.adultPrice : 0

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tour Header */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={tour.imageUrl || tour.image || "/placeholder.svg?height=500&width=1000"}
            alt={tour.name || tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tour.name || tour.title}</h1>
                  <div className="flex items-center text-white/90 mb-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{tour.location}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/90 rounded-lg px-3 py-1 flex items-center mr-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{tour.rating || "4.5"}</span>
                  </div>
                  <SaveTourButton
                    tourId={tour.id}
                    tourData={{
                      name: tour.name || tour.title,
                      price: tourPrice,
                      duration: tour.duration,
                      imageUrl: tour.imageUrl || tour.image,
                    }}
                    className="bg-white/90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500">Үргэлжлэх хугацаа</span>
                  <span className="font-medium">{tour.duration} өдөр</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500">Бүлгийн хэмжээ</span>
                  <span className="font-medium">
                    {tour.minGroupSize || 2}-{tour.maxGroupSize || 10} хүн
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500">Эхлэх цаг</span>
                  <span className="font-medium">{tour.startTime || "08:00"}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500">Аялалын төрөл</span>
                  <span className="font-medium">{tour.type || tour.category || "Хөтөчтэй"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("description")}
              >
                <h2 className="text-xl font-bold text-gray-800">Аялалын тухай</h2>
                {openSection === "description" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {openSection === "description" && (
                <div className="mt-4 prose max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">{tour.description || tour.fullDescription}</p>
                </div>
              )}
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("itinerary")}
              >
                <h2 className="text-xl font-bold text-gray-800">Аялалын хөтөлбөр</h2>
                {openSection === "itinerary" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {openSection === "itinerary" && (
                <div className="mt-4">
                  {tour.itinerary ? (
                    <div className="space-y-6">
                      {Object.entries(tour.itinerary).map(([day, content]: [string, any]) => (
                        <div key={day} className="border-l-2 border-blue-500 pl-4">
                          <h3 className="font-bold text-lg mb-2">Өдөр {day}</h3>
                          <p className="text-gray-600 whitespace-pre-line">
                            {typeof content === "string" ? content : content.description || "Мэдээлэл байхгүй"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Аялалын хөтөлбөр оруулаагүй байна.</p>
                  )}
                </div>
              )}
            </div>

            {/* Included/Not Included */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("included")}
              >
                <h2 className="text-xl font-bold text-gray-800">Үнэд багтсан/багтаагүй</h2>
                {openSection === "included" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {openSection === "included" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-green-600">Үнэд багтсан</h3>
                    {tour.included && Array.isArray(tour.included) ? (
                      <ul className="space-y-2">
                        {tour.included.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600 mr-2">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Мэдээлэл оруулаагүй байна.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-red-600">Үнэд багтаагүй</h3>
                    {tour.notIncluded && Array.isArray(tour.notIncluded) ? (
                      <ul className="space-y-2">
                        {tour.notIncluded.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600 mr-2">
                              ✕
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Мэдээлэл оруулаагүй байна.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("additional")}
              >
                <h2 className="text-xl font-bold text-gray-800">Нэмэлт мэдээлэл</h2>
                {openSection === "additional" ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              {openSection === "additional" && (
                <div className="mt-4 prose max-w-none">
                  {tour.additionalInfo ? (
                    <div className="text-gray-600 whitespace-pre-line">{tour.additionalInfo}</div>
                  ) : (
                    <p className="text-gray-500 italic">Нэмэлт мэдээлэл оруулаагүй байна.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{tourPrice.toLocaleString()}₮</h2>
                  <span className="text-sm text-gray-500">нэг хүний үнэ</span>
                </div>
                {tour.originalPrice && tour.originalPrice > tourPrice && (
                  <div className="flex items-center mb-2">
                    <span className="text-gray-500 line-through mr-2">{tour.originalPrice.toLocaleString()}₮</span>
                    <span className="text-green-600 text-sm">
                      {Math.round(((tour.originalPrice - tourPrice) / tour.originalPrice) * 100)}% хямдрал
                    </span>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <BookingForm tourId={tour.id} tourPrice={tourPrice} tourName={tour.name || tour.title} />
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 mb-3">Захиалга хийхийн тулд та нэвтэрсэн байх шаардлагатай.</p>
                  <div className="flex flex-col space-y-2">
                    <Link
                      href={`/login?returnUrl=/tours/${tour.id}`}
                      className="w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
                    >
                      Нэвтрэх
                    </Link>
                    <Link
                      href={`/register?returnUrl=/tours/${tour.id}`}
                      className="w-full py-2 bg-white border border-blue-600 text-blue-600 text-center rounded-md hover:bg-blue-50"
                    >
                      Бүртгүүлэх
                    </Link>
                  </div>
                </div>
              )}

              {/* Tour Features */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-medium text-gray-800 mb-3">Аялалын онцлог</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">
                      ✓
                    </span>
                    <span className="text-gray-600">Мэргэжлийн хөтөч</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">
                      ✓
                    </span>
                    <span className="text-gray-600">Урьдчилан захиалга хийх боломжтой</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">
                      ✓
                    </span>
                    <span className="text-gray-600">Цуцлах боломжтой</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
