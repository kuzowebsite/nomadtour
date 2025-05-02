import { NextResponse } from "next/server"
import { ref, push, serverTimestamp, get, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { createPayment, type PaymentRequest, PaymentStatus } from "@/lib/payment-providers"

// Төлбөрийн хүсэлт үүсгэх API
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Шаардлагатай талбаруудыг шалгах
    const requiredFields = ["bookingId", "amount", "provider", "customerEmail", "customerName"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} талбар заавал шаардлагатай` }, { status: 400 })
      }
    }

    // Захиалгын мэдээлэл шалгах
    const bookingRef = ref(database, `bookings/${body.bookingId}`)
    const bookingSnapshot = await get(bookingRef)

    if (!bookingSnapshot.exists()) {
      return NextResponse.json({ success: false, message: "Захиалга олдсонгүй" }, { status: 404 })
    }

    const booking = bookingSnapshot.val()

    // Захиалга аль хэдийн төлөгдсөн эсэхийг шалгах
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: false, message: "Захиалга аль хэдийн төлөгдсөн байна" }, { status: 400 })
    }

    // Төлбөрийн хүсэлт үүсгэх
    const paymentRequest: PaymentRequest = {
      bookingId: body.bookingId,
      amount: body.amount,
      currency: "MNT",
      provider: body.provider,
      description: `NomadTour - ${booking.tourTitle} аяллын захиалга`,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/bookings/success?id=${body.bookingId}`,
    }

    // Төлбөрийн хүсэлт үүсгэх
    const paymentResponse = await createPayment(paymentRequest)

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, message: paymentResponse.message || "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа" },
        { status: 500 },
      )
    }

    // Төлбөрийн мэдээллийг хадгалах
    const paymentsRef = ref(database, "payments")
    const newPaymentRef = await push(paymentsRef, {
      bookingId: body.bookingId,
      paymentId: paymentResponse.paymentId,
      amount: body.amount,
      currency: "MNT",
      provider: body.provider,
      status: paymentResponse.status || PaymentStatus.PENDING,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      createdAt: serverTimestamp(),
    })

    // Захиалгын төлбөрийн төлөвийг шинэчлэх
    await update(bookingRef, {
      paymentStatus: "processing",
      paymentId: paymentResponse.paymentId,
      paymentProvider: body.provider,
    })

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.paymentId,
      redirectUrl: paymentResponse.redirectUrl,
      message: "Төлбөрийн хүсэлт амжилттай үүсгэгдлээ",
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ success: false, message: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа" }, { status: 500 })
  }
}

// Төлбөрийн төлөв шалгах API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const bookingId = searchParams.get("bookingId")

    if (!paymentId && !bookingId) {
      return NextResponse.json(
        { success: false, message: "paymentId эсвэл bookingId заавал шаардлагатай" },
        { status: 400 },
      )
    }

    let paymentRef
    let paymentSnapshot

    if (paymentId) {
      // Төлбөрийн ID-гаар хайх
      const paymentsRef = ref(database, "payments")
      const allPaymentsSnapshot = await get(paymentsRef)

      if (allPaymentsSnapshot.exists()) {
        const payments = allPaymentsSnapshot.val()
        const paymentKey = Object.keys(payments).find((key) => payments[key].paymentId === paymentId)

        if (paymentKey) {
          paymentRef = ref(database, `payments/${paymentKey}`)
          paymentSnapshot = await get(paymentRef)
        }
      }
    } else if (bookingId) {
      // Захиалгын ID-гаар хайх
      const paymentsRef = ref(database, "payments")
      const allPaymentsSnapshot = await get(paymentsRef)

      if (allPaymentsSnapshot.exists()) {
        const payments = allPaymentsSnapshot.val()
        const paymentKey = Object.keys(payments).find((key) => payments[key].bookingId === bookingId)

        if (paymentKey) {
          paymentRef = ref(database, `payments/${paymentKey}`)
          paymentSnapshot = await get(paymentRef)
        }
      }
    }

    if (!paymentSnapshot || !paymentSnapshot.exists()) {
      return NextResponse.json({ success: false, message: "Төлбөрийн мэдээлэл олдсонгүй" }, { status: 404 })
    }

    const payment = paymentSnapshot.val()

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.paymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ success: false, message: "Төлбөрийн төлөв шалгахад алдаа гарлаа" }, { status: 500 })
  }
}
