"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { Calendar, MapPin, Users, CreditCard, ArrowLeft, Clock, CheckCircle, XCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from "@/app/components/payment-method-selector"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [tour, setTour] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  useEffect(() => {
    const fetchBookingAndTour = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        // Fetch booking
        const bookingRef = ref(database, `bookings/${bookingId}`)
        const bookingSnapshot = await get(bookingRef)

        if (bookingSnapshot.exists()) {
          const bookingData = {
            id: bookingSnapshot.key,
            ...bookingSnapshot.val(),
          }
          setBooking(bookingData)

          // Fetch tour details
          if (bookingData.tourId) {
            const tourRef = ref(database, `tours/${bookingData.tourId}`)
            const tourSnapshot = await get(tourRef)

            if (tourSnapshot.exists()) {
              setTour({
                id: tourSnapshot.key,
                ...tourSnapshot.val(),
              })
            }
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching booking:", error)
        setLoading(false)
      }
    }

    fetchBookingAndTour()
  }, [bookingId])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Төлбөрийн хэлбэр сонгоно уу",
        variant: "destructive",
      })
      return
    }

    if (!booking) return

    setPaymentLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
          provider: selectedPaymentMethod,
          customerEmail: booking.customerEmail || "",
          customerName: booking.customerName || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Төлбөр үүсгэхэд алдаа гарлаа")
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        toast({
          title: "Алдаа гарлаа",
          description: "Төлбөрийн хуудас руу шилжих боломжгүй байна",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Төлбөр үүсгэхэд алдаа гарлаа",
        description: error instanceof Error ? error.message : "Дахин оролдоно уу",
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  // Check if user is authorized to view this booking
  const isAuthorized = () => {
    if (!user || !booking) return false
    return user.uid === booking.userId || user.isAdmin
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Захиалга олдсонгүй</h1>
            <p className="text-gray-600 mb-6">Таны хайсан захиалга олдсонгүй эсвэл устгагдсан байна.</p>
            <div className="flex justify-center">
              <Link
                href="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Миний захиалгууд руу буцах
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized()) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Хандах эрхгүй</h1>
            <p className="text-gray-600 mb-6">Та энэ захиалгын мэдээллийг үзэх эрхгүй байна.</p>
            <div className="flex justify-center">
              <Link
                href="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Миний захиалгууд руу буцах
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isPaid = booking.paymentStatus === "paid"
  const isConfirmed = booking.status === "confirmed"

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
        </Button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Захиалгын дэлгэрэнгүй</h1>
                <p className="text-gray-600">Захиалгын дугаар: #{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex flex-col items-end">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isConfirmed
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isConfirmed
                    ? "Баталгаажсан"
                    : booking.status === "pending"
                      ? "Хүлээгдэж буй"
                      : booking.status === "cancelled"
                        ? "Цуцлагдсан"
                        : booking.status}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  {new Date(booking.createdAt).toLocaleDateString("mn-MN")}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Аяллын мэдээлэл</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{booking.tourTitle}</p>
                      {tour && <p className="text-gray-600 text-sm">{tour.location || "Монгол"}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Аялах өдөр</p>
                      <p className="text-gray-600 text-sm">{formatDate(booking.date)}</p>
                    </div>
                  </div>
                  {/* Replace with or add: */}
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Хүний тоо</p>
                      <p className="text-gray-600 text-sm">
                        {booking.adults} том хүн{booking.children > 0 ? `, ${booking.children} хүүхэд` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Захиалагчийн мэдээлэл</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Нэр</p>
                    <p className="font-medium">{booking.customerName || "Бүртгэгдээгүй"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Имэйл</p>
                    <p className="font-medium">{booking.customerEmail || "Бүртгэгдээгүй"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Утасны дугаар</p>
                    <p className="font-medium">{booking.customerPhone || "Бүртгэгдээгүй"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Төлбөрийн мэдээлэл</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Том хүн (x{booking.adults})</span>
                  <span>₮{Math.round(booking.totalPrice / booking.adults).toLocaleString()}</span>
                </div>
                {booking.children > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Хүүхэд (x{booking.children})</span>
                    <span>₮{Math.round(booking.totalPrice * 0.5).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Нийт дүн</span>
                    <span>₮{booking.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Төлбөрийн төлөв</span>
                    <span
                      className={`font-medium ${
                        isPaid
                          ? "text-green-600"
                          : booking.paymentStatus === "processing"
                            ? "text-blue-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {isPaid
                        ? "Төлөгдсөн"
                        : booking.paymentStatus === "processing"
                          ? "Боловсруулж байна"
                          : "Төлөгдөөгүй"}
                    </span>
                  </div>
                  {booking.paymentProvider && (
                    <div className="flex justify-between mt-1 text-sm">
                      <span>Төлбөрийн хэлбэр</span>
                      <span className="font-medium capitalize">{booking.paymentProvider}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isPaid && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Төлбөр төлөх</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <PaymentMethodSelector onSelect={setSelectedPaymentMethod} selectedProvider={selectedPaymentMethod} />

                  <div className="mt-6">
                    <Button
                      onClick={handlePayment}
                      disabled={paymentLoading || !selectedPaymentMethod}
                      className="w-full"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                          Төлбөр үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Төлбөр төлөх
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isPaid && (
              <div className="mt-6">
                <Link
                  href={`/bookings/${booking.id}/receipt`}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Төлбөрийн баримт татах
                </Link>
              </div>
            )}

            {isPaid && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Төлбөр амжилттай төлөгдсөн</p>
                  <p className="text-green-700 text-sm">Таны захиалга баталгаажсан.</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {tour && (
                <Link
                  href={`/tours/${tour.id}`}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Аялалын дэлгэрэнгүй
                </Link>
              )}
              <Link
                href="/profile"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Users className="mr-2 h-4 w-4" />
                Миний захиалгууд
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
