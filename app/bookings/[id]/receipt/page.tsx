"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { ArrowLeft, FileText, Printer, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false)
        setError("Захиалгын ID олдсонгүй")
        return
      }

      try {
        const bookingRef = ref(database, `bookings/${bookingId}`)
        const snapshot = await get(bookingRef)

        if (!snapshot.exists()) {
          setError("Захиалга олдсонгүй")
          setLoading(false)
          return
        }

        const bookingData = {
          id: snapshot.key,
          ...snapshot.val(),
        }

        // Төлбөр төлөгдсөн эсэхийг шалгах
        if (bookingData.paymentStatus !== "paid") {
          setError("Захиалгын төлбөр төлөгдөөгүй байна")
          setLoading(false)
          return
        }

        // Хэрэглэгч өөрийн захиалга эсэхийг шалгах
        if (user && bookingData.userId !== user.uid && !user.isAdmin) {
          setError("Та энэ захиалгын баримтыг үзэх эрхгүй байна")
          setLoading(false)
          return
        }

        setBooking(bookingData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching booking:", error)
        setError("Захиалгын мэдээлэл авахад алдаа гарлаа")
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, user])

  // Баримт хэвлэх
  const printReceipt = () => {
    window.print()
  }

  // Баримт татах
  const downloadReceipt = () => {
    window.open(`/api/receipts/${bookingId}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Алдаа гарлаа</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Буцах
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Захиалга олдсонгүй</h1>
            <p className="text-gray-600 mb-6">Таны хайсан захиалга олдсонгүй эсвэл устгагдсан байна.</p>
            <div className="flex justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Буцах
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const receiptNumber = `R-${booking.id.slice(0, 8).toUpperCase()}`
  const paymentDate = booking.paidAt
    ? new Date(booking.paidAt).toLocaleDateString("mn-MN")
    : new Date().toLocaleDateString("mn-MN")
  const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString("mn-MN") : "Тодорхойгүй"
  const createdDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("mn-MN") : "Тодорхойгүй"

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Буцах
          </Button>
          <div className="flex gap-2 print:hidden">
            <Button onClick={printReceipt} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Хэвлэх
            </Button>
            <Button onClick={downloadReceipt}>
              <Download className="mr-2 h-4 w-4" />
              Татах
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 print:shadow-none print:p-0">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-blue-600">NomadTour</h1>
            <p className="text-xl font-semibold mt-2">Төлбөрийн баримт</p>
            <p className="text-gray-600 mt-1">Баримтын дугаар: {receiptNumber}</p>
            <p className="text-gray-600">Огноо: {paymentDate}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Захиалгын мэдээлэл</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Захиалгын дугаар:</span>
                  <span>{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Захиалга үүсгэсэн:</span>
                  <span>{createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Аялал:</span>
                  <span>{booking.tourTitle || "Тодорхойгүй"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Аялах өдөр:</span>
                  <span>{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Хүний тоо:</span>
                  <span>
                    {booking.adults} том хүн{booking.children > 0 ? `, ${booking.children} хүүхэд` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Захиалагчийн мэдээлэл</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Нэр:</span>
                  <span>{booking.customerName || "Тодорхойгүй"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Имэйл:</span>
                  <span>{booking.customerEmail || "Тодорхойгүй"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Утас:</span>
                  <span>{booking.customerPhone || "Тодорхойгүй"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Төлбөрийн мэдээлэл</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-4">Тайлбар</th>
                  <th className="text-center py-2 px-4">Тоо</th>
                  <th className="text-right py-2 px-4">Нэгж үнэ</th>
                  <th className="text-right py-2 px-4">Нийт</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4">Том хүн</td>
                  <td className="py-2 px-4 text-center">{booking.adults}</td>
                  <td className="py-2 px-4 text-right">
                    ₮{Math.round(booking.totalPrice / booking.adults).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ₮{(booking.adults * Math.round(booking.totalPrice / booking.adults)).toLocaleString()}
                  </td>
                </tr>
                {booking.children > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-4">Хүүхэд</td>
                    <td className="py-2 px-4 text-center">{booking.children}</td>
                    <td className="py-2 px-4 text-right">₮{Math.round(booking.totalPrice * 0.5).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">
                      ₮{(booking.children * Math.round(booking.totalPrice * 0.5)).toLocaleString()}
                    </td>
                  </tr>
                )}
                {booking.discount > 0 && (
                  <tr className="border-b border-gray-100 text-green-600">
                    <td className="py-2 px-4">Хөнгөлөлт</td>
                    <td className="py-2 px-4 text-center"></td>
                    <td className="py-2 px-4 text-right"></td>
                    <td className="py-2 px-4 text-right">-₮{booking.discount.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td className="py-2 px-4" colSpan={3}>
                    Нийт дүн
                  </td>
                  <td className="py-2 px-4 text-right">₮{booking.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Төлбөрийн арга</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Төлбөрийн хэлбэр:</span>
                <span>{booking.paymentProvider ? booking.paymentProvider.toUpperCase() : "Тодорхойгүй"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Төлбөрийн ID:</span>
                <span>{booking.paymentId || "Тодорхойгүй"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Төлбөр төлсөн огноо:</span>
                <span>{paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Төлөв:</span>
                <span className="text-green-600 font-medium">Төлөгдсөн</span>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
            <p>NomadTour ХХК | Регистрийн дугаар: 1234567890 | Утас: +976 99112233</p>
            <p>Хаяг: Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо, Сүхбаатарын талбай</p>
            <p>Имэйл: info@nomadtour.mn | Вэб: www.nomadtour.mn</p>
            <div className="flex items-center justify-center mt-4">
              <FileText className="h-4 w-4 mr-1" />
              <p>Энэхүү баримт нь албан ёсны төлбөрийн баримт болно.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
