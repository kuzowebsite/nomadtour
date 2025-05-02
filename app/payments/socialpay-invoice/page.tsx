"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, CheckCircle, Copy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PaymentStatus } from "@/lib/payment-providers"

export default function SocialpayInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const bookingId = searchParams.get("id")
  const amount = searchParams.get("amount")

  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [qrData, setQrData] = useState("")
  const [countdown, setCountdown] = useState(900) // 15 minutes in seconds
  const [invoiceData, setInvoiceData] = useState({
    invoiceId: "",
    deepLink: "",
  })

  // Төлбөрийн мэдээлэл ачаалах
  useEffect(() => {
    if (!bookingId || !amount) {
      toast({
        title: "Алдаа гарлаа",
        description: "Захиалгын мэдээлэл дутуу байна",
        variant: "destructive",
      })
      router.push("/tours")
      return
    }

    // Жишээ QR код үүсгэх
    const generateQrCode = () => {
      setIsLoading(true)

      // Жишээ QR код дата (бодит тохиолдолд SocialPay API-аас авна)
      const invoiceId = `INV${Date.now()}`
      const deepLink = `https://socialpay.mn/payment/${invoiceId}`

      setQrData(deepLink)
      setInvoiceData({
        invoiceId,
        deepLink,
      })
      setIsLoading(false)
    }

    generateQrCode()
  }, [bookingId, amount, router, toast])

  // Цаг тоологч
  useEffect(() => {
    if (countdown <= 0 || paymentStatus === PaymentStatus.COMPLETED) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, paymentStatus])

  // Төлбөрийн төлөв шалгах
  const checkPaymentStatus = async () => {
    if (!bookingId) return

    setIsChecking(true)

    try {
      const response = await fetch(`/api/payments?bookingId=${bookingId}`)
      const data = await response.json()

      if (data.success && data.payment) {
        setPaymentStatus(data.payment.status)

        if (data.payment.status === PaymentStatus.COMPLETED) {
          toast({
            title: "Төлбөр амжилттай",
            description: "Таны төлбөр амжилттай хийгдлээ",
          })

          // 3 секундын дараа захиалга амжилттай хуудас руу шилжих
          setTimeout(() => {
            router.push(`/bookings/success?id=${bookingId}`)
          }, 3000)
        } else if (data.payment.status === PaymentStatus.FAILED) {
          toast({
            title: "Төлбөр амжилтгүй",
            description: "Таны төлбөр амжилтгүй болсон байна",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  // Тогтмол хугацаанд төлбөрийн төлөв шалгах
  useEffect(() => {
    if (paymentStatus === PaymentStatus.COMPLETED) return

    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 10000) // 10 секунд тутамд шалгах

    return () => clearInterval(interval)
  }, [paymentStatus])

  // Цаг тоологчийн форматлах
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // Линк хуулах
  const copyDeepLink = () => {
    navigator.clipboard.writeText(invoiceData.deepLink)
    toast({
      title: "Холбоос хуулагдлаа",
      description: "SocialPay төлбөрийн холбоос хуулагдлаа",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-600 border-green-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">SocialPay төлбөрийн мэдээлэл ачаалж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
        </Button>

        <Card className="shadow-md">
          <CardHeader className="text-center border-b pb-6">
            <div className="mx-auto mb-4 w-16 h-16 relative">
              <Image src="/payment-logos/socialpay.png" alt="SocialPay" fill className="object-contain" />
            </div>
            <CardTitle>SocialPay төлбөр</CardTitle>
            <CardDescription>Доорх QR кодыг уншуулж төлбөрөө хийнэ үү</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {paymentStatus === PaymentStatus.COMPLETED ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">Төлбөр амжилттай</h3>
                <p className="text-gray-600 mb-4">
                  Таны төлбөр амжилттай хийгдлээ. Захиалгын баталгаажуулалт руу шилжиж байна...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{Number(amount).toLocaleString()}₮</div>
                  <div className="text-sm text-gray-500">Захиалга: {bookingId}</div>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={qrData}
                      size={200}
                      level="H"
                      includeMargin
                      imageSettings={{
                        src: "/payment-logos/socialpay.png",
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-green-800">Хүчинтэй хугацаа</div>
                      <div className="text-sm text-green-600">
                        {countdown > 0 ? formatTime(countdown) : "Хугацаа дууссан"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200"
                      onClick={checkPaymentStatus}
                      disabled={isChecking}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? "animate-spin" : ""}`} />
                      Шалгах
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 truncate flex-1">{invoiceData.deepLink}</div>
                    <Button variant="ghost" size="sm" onClick={copyDeepLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col border-t pt-6">
            <div className="text-center text-sm text-gray-500 mb-4">Та SocialPay апп-д нэвтэрч төлбөрөө хийнэ үү</div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="text-green-600 border-green-200"
                onClick={() => window.open("https://socialpay.mn/download", "_blank")}
              >
                SocialPay апп татах
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
