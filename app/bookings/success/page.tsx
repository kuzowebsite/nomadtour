"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { CheckCircle, ArrowRight, Calendar, MapPin, CreditCard, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from "@/app/components/payment-method-selector"
import { useToast } from "@/hooks/use-toast"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const bookingId = searchParams.get("bookingId") || searchParams.get("id")

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        const bookingRef = ref(database, `bookings/${bookingId}`)
        const snapshot = await get(bookingRef)

        if (snapshot.exists()) {
          setBooking({
            id: snapshot.key,
            ...snapshot.val(),
          })
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching booking:", error)
        setLoading(false)
      }
    }

    fetchBooking()
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Захиалгын мэдээлэл олдсонгүй</h1>
            <p className="text-gray-600 mb-6">Захиалгын мэдээлэл олдсонгүй эсвэл алдаа гарлаа. Та дахин оролдоно уу.</p>
            <div className="flex justify-center">
              <Link
                href="/tours"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Аялалууд руу буцах
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isPaid = booking.paymentStatus === "paid"

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Success header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-green-50 p-6 border-b border-green-100">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Захиалга амжилттай!</h1>
                <p className="text-gray-600">Таны захиалгыг хүлээн авлаа.</p>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Захиалгын мэдээлэл</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Захиалгын дугаар</p>
                    <p className="font-medium">#{booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Төлбөрийн төлөв</p>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPaid
                          ? "bg-green-100 text-green-800"
                          : booking.paymentStatus === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isPaid
                        ? "Төлөгдсөн"
                        : booking.paymentStatus === "processing"
                          ? "Боловсруулж байна"
                          : "Төлөгдөөгүй"}
                    </div>
                    {isPaid && (
                      <div className="mt-4">
                        <Link
                          href={`/bookings/${booking.id}/receipt`}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Төлбөрийн баримт татах
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Аялах өдөр</p>
                      <p className="font-medium">{formatDate(booking.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Аялал</p>
                      <p className="font-medium">{booking.tourTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
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
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Хүний тоо</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Том хүний тоо</p>
                    <p className="font-medium">{booking.adults}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Хүүхдийн тоо</p>
                    <p className="font-medium">{booking.children || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {!isPaid && (
              <div className="mb-6">
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

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href={`/bookings/${booking.id}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Захиалгын дэлгэрэнгүй
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/profile"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
              >
                Миний захиалгууд
              </Link>
            </div>
          </div>
        </div>

        {/* Payment instructions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Төлбөрийн заавар</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Төлбөрийн хэлбэр сонгох</p>
                  <p className="text-gray-600 text-sm">QPay, MonPay эсвэл SocialPay төлбөрийн хэлбэрээс сонгоно уу.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">QR код уншуулах</p>
                  <p className="text-gray-600 text-sm">
                    Төлбөрийн хуудас дээрх QR кодыг сонгосон төлбөрийн апп-аар уншуулна уу.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Төлбөр баталгаажуулах</p>
                  <p className="text-gray-600 text-sm">
                    Төлбөр амжилттай хийгдсэний дараа таны захиалга автоматаар баталгаажна.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
