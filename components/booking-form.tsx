"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { PaymentMethodSelector } from "@/app/components/payment-method-selector"
import { useToast } from "@/hooks/use-toast"

interface BookingFormProps {
  tourId: string
  tourName: string
  tourPrice?: number
  price?: number // For backward compatibility
  startDate?: Date
  endDate?: Date
}

export default function BookingForm({ tourId, tourName, tourPrice, price, startDate, endDate }: BookingFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(startDate)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Payment related states
  const [bookingCreated, setBookingCreated] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Use tourPrice if provided, otherwise fall back to price, or default to 0
  const actualPrice = tourPrice || price || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = `/tours/${tourId}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!date) {
      setError("Аялах өдрөө сонгоно уу")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Get user data from Firebase
      const userRef = ref(database, `users/${user.uid}`)
      const userSnapshot = await get(userRef)
      const userData = userSnapshot.exists() ? userSnapshot.val() : {}

      const childPrice = actualPrice * 0.5
      const totalPrice = actualPrice * adults + childPrice * children

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tourId,
          tourName,
          date: date.toISOString(),
          adults,
          children,
          totalPrice,
          userId: user.uid,
          customerName: userData.displayName || user.displayName || "",
          customerEmail: userData.email || user.email || "",
          customerPhone: userData.phoneNumber || "",
          specialRequests: "",
        }),
      })

      if (!response.ok) {
        throw new Error("Захиалга үүсгэхэд алдаа гарлаа")
      }

      const data = await response.json()
      setBookingId(data.id)
      setBookingCreated(true)
    } catch (err) {
      console.error("Error creating booking:", err)
      setError("Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
    }
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

    if (!bookingId) return

    setPaymentLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: actualPrice * adults + actualPrice * 0.5 * children,
          provider: selectedPaymentMethod,
          customerEmail: user?.email || "",
          customerName: user?.displayName || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Төлбөр үүсгэхэд алдаа гарлаа")
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        router.push(`/bookings/success?bookingId=${bookingId}`)
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

  // Assume children pay 50% of adult price (you can adjust this as needed)
  const childPrice = actualPrice * 0.5
  const totalPrice = actualPrice * adults + childPrice * children

  // If booking is created, show payment options
  if (bookingCreated && bookingId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Төлбөр төлөх</h3>

        <div className="mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
            <p className="text-green-800 font-medium">Захиалга амжилттай үүслээ!</p>
            <p className="text-green-700 text-sm">Төлбөрийн хэлбэрээ сонгоно уу.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Том хүн (x{adults})</span>
                <span>₮{actualPrice.toLocaleString()}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Хүүхэд (x{children})</span>
                  <span>₮{childPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Нийт үнэ:</span>
                  <span>₮{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <PaymentMethodSelector onSelect={setSelectedPaymentMethod} selectedProvider={selectedPaymentMethod} />
            </div>

            <Button onClick={handlePayment} disabled={paymentLoading || !selectedPaymentMethod} className="w-full mt-4">
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

            <div className="text-center mt-4">
              <Link href={`/bookings/${bookingId}`} className="text-blue-600 hover:underline text-sm">
                Захиалгын дэлгэрэнгүй харах
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Захиалга хийх</h3>

      {!user ? (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 mb-2">Захиалга хийхийн тулд та нэвтэрсэн байх шаардлагатай.</p>
          <Link
            href={`/login?returnUrl=${encodeURIComponent(`/tours/${tourId}`)}`}
            className="text-blue-600 hover:underline font-medium"
          >
            Нэвтрэх эсвэл Бүртгүүлэх
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Аялах өдөр</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Өдөр сонгох"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => {
                      // Disable dates before today
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="adults">Том хүний тоо</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="20"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number.parseInt(e.target.value) || 1))}
                />
              </div>

              <div>
                <Label htmlFor="children">Хүүхдийн тоо (0-12 нас)</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number.parseInt(e.target.value) || 0))}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Үнэ (1 том хүн):</span>
                <span>{actualPrice.toLocaleString()}₮</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span>Үнэ (1 хүүхэд):</span>
                  <span>{childPrice.toLocaleString()}₮</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg">
                <span>Нийт үнэ:</span>
                <span>{totalPrice.toLocaleString()}₮</span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Захиалж байна..." : "Захиалах"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
