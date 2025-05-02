import { NextResponse } from "next/server"
import { ref, get, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { PaymentStatus } from "@/lib/payment-providers"

// Төлбөрийн системээс ирэх webhook хүсэлтийг хүлээн авах API
export async function POST(request: Request) {
  try {
    // Хүсэлтийн IP хаягийг шалгах (бодит тохиолдолд)
    // const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    // if (!isAllowedIp(clientIp)) {
    //   return NextResponse.json({ success: false, message: "Unauthorized IP" }, { status: 403 });
    // }

    const body = await request.json()

    // Шаардлагатай талбаруудыг шалгах
    if (!body.paymentId || !body.status) {
      return NextResponse.json(
        { success: false, message: "paymentId болон status талбарууд заавал шаардлагатай" },
        { status: 400 },
      )
    }

    // Төлбөрийн мэдээллийг хайх
    const paymentsRef = ref(database, "payments")
    const paymentsSnapshot = await get(paymentsRef)

    if (!paymentsSnapshot.exists()) {
      return NextResponse.json({ success: false, message: "Төлбөрийн мэдээлэл олдсонгүй" }, { status: 404 })
    }

    const payments = paymentsSnapshot.val()
    const paymentKey = Object.keys(payments).find((key) => payments[key].paymentId === body.paymentId)

    if (!paymentKey) {
      return NextResponse.json({ success: false, message: "Төлбөрийн мэдээлэл олдсонгүй" }, { status: 404 })
    }

    const payment = payments[paymentKey]
    const paymentRef = ref(database, `payments/${paymentKey}`)

    // Төлбөрийн төлөвийг шинэчлэх
    await update(paymentRef, {
      status: body.status,
      updatedAt: Date.now(),
    })

    // Захиалгын төлөвийг шинэчлэх
    if (payment.bookingId) {
      const bookingRef = ref(database, `bookings/${payment.bookingId}`)
      const bookingSnapshot = await get(bookingRef)

      if (bookingSnapshot.exists()) {
        let paymentStatus = "processing"
        let bookingStatus = "pending"

        // Төлбөрийн төлөвөөс хамаарч захиалгын төлөвийг шинэчлэх
        if (body.status === PaymentStatus.COMPLETED) {
          paymentStatus = "paid"
          bookingStatus = "confirmed"
        } else if (body.status === PaymentStatus.FAILED || body.status === PaymentStatus.CANCELLED) {
          paymentStatus = "unpaid"
        }

        await update(bookingRef, {
          paymentStatus,
          status: bookingStatus,
          updatedAt: Date.now(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Төлбөрийн төлөв амжилттай шинэчлэгдлээ",
    })
  } catch (error) {
    console.error("Error processing payment webhook:", error)
    return NextResponse.json(
      { success: false, message: "Төлбөрийн webhook боловсруулахад алдаа гарлаа" },
      { status: 500 },
    )
  }
}

// Зөвшөөрөгдсөн IP хаягуудыг шалгах (бодит тохиолдолд)
// function isAllowedIp(ip: string | null): boolean {
//   if (!ip) return false;
//   const allowedIps = process.env.PAYMENT_WEBHOOK_ALLOWED_IPS?.split(",") || [];
//   return allowedIps.includes(ip);
// }
