// Төлбөрийн системүүдийн тохиргоо
export interface PaymentProvider {
  name: string
  logo: string
  description: string
  supportedMethods: string[]
  processingFee: string
  isActive: boolean
}

// Төлбөрийн системүүдийн жагсаалт
export const paymentProviders: PaymentProvider[] = [
  {
    name: "qpay",
    logo: "/payment-logos/qpay.png",
    description: "QPay ашиглан дурын банкны картаар төлөх",
    supportedMethods: ["Khan Bank", "TDB", "Golomt", "State Bank", "Xac Bank"],
    processingFee: "0%",
    isActive: true,
  },
  {
    name: "monpay",
    logo: "/payment-logos/monpay.png",
    description: "MonPay хэтэвчээр төлөх",
    supportedMethods: ["MonPay App"],
    processingFee: "0%",
    isActive: true,
  },
  {
    name: "socialpay",
    logo: "/payment-logos/socialpay.png",
    description: "SocialPay хэтэвчээр төлөх",
    supportedMethods: ["SocialPay App"],
    processingFee: "0%",
    isActive: true,
  },
  {
    name: "card",
    logo: "/payment-logos/card.png",
    description: "Шууд картаар төлөх",
    supportedMethods: ["Visa", "Mastercard", "UnionPay"],
    processingFee: "2%",
    isActive: false, // Одоогоор идэвхгүй
  },
]

// Төлбөрийн төлөв
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

// Төлбөрийн хүсэлтийн төрөл
export interface PaymentRequest {
  bookingId: string
  amount: number
  currency: string
  provider: string
  description: string
  customerEmail: string
  customerName: string
  returnUrl: string
}

// Төлбөрийн хариу төрөл
export interface PaymentResponse {
  success: boolean
  paymentId?: string
  redirectUrl?: string
  message?: string
  status?: PaymentStatus
}

// QPay төлбөрийн хүсэлт үүсгэх
export async function createQpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Энд бодит QPay API-тай холбогдох код бичигдэнэ
    // Жишээ хариу буцаая
    return {
      success: true,
      paymentId: `QPAY_${Date.now()}`,
      redirectUrl: `/payments/qpay-invoice?id=${request.bookingId}&amount=${request.amount}`,
      status: PaymentStatus.PENDING,
    }
  } catch (error) {
    console.error("QPay payment creation failed:", error)
    return {
      success: false,
      message: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа",
    }
  }
}

// MonPay төлбөрийн хүсэлт үүсгэх
export async function createMonpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Энд бодит MonPay API-тай холбогдох код бичигдэнэ
    // Жишээ хариу буцаая
    return {
      success: true,
      paymentId: `MONPAY_${Date.now()}`,
      redirectUrl: `/payments/monpay-invoice?id=${request.bookingId}&amount=${request.amount}`,
      status: PaymentStatus.PENDING,
    }
  } catch (error) {
    console.error("MonPay payment creation failed:", error)
    return {
      success: false,
      message: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа",
    }
  }
}

// SocialPay төлбөрийн хүсэлт үүсгэх
export async function createSocialpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Энд бодит SocialPay API-тай холбогдох код бичигдэнэ
    // Жишээ хариу буцаая
    return {
      success: true,
      paymentId: `SOCIALPAY_${Date.now()}`,
      redirectUrl: `/payments/socialpay-invoice?id=${request.bookingId}&amount=${request.amount}`,
      status: PaymentStatus.PENDING,
    }
  } catch (error) {
    console.error("SocialPay payment creation failed:", error)
    return {
      success: false,
      message: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа",
    }
  }
}

// Төлбөрийн хүсэлт үүсгэх
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  switch (request.provider) {
    case "qpay":
      return createQpayPayment(request)
    case "monpay":
      return createMonpayPayment(request)
    case "socialpay":
      return createSocialpayPayment(request)
    default:
      return {
        success: false,
        message: "Дэмжигдээгүй төлбөрийн систем",
      }
  }
}

// Төлбөрийн төлөв шалгах
export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  // Энд бодит төлбөрийн системтэй холбогдож төлөв шалгах код бичигдэнэ
  // Жишээ төлөв буцаая
  if (paymentId.includes("QPAY") || paymentId.includes("MONPAY") || paymentId.includes("SOCIALPAY")) {
    // 80% магадлалтай амжилттай төлөгдсөн
    return Math.random() > 0.2 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING
  }

  return PaymentStatus.PENDING
}
