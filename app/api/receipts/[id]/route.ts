import { NextResponse } from "next/server"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json({ error: "Захиалгын ID заавал шаардлагатай" }, { status: 400 })
    }

    // Захиалгын мэдээлэл авах
    const bookingRef = ref(database, `bookings/${bookingId}`)
    const bookingSnapshot = await get(bookingRef)

    if (!bookingSnapshot.exists()) {
      return NextResponse.json({ error: "Захиалга олдсонгүй" }, { status: 404 })
    }

    const booking = {
      id: bookingSnapshot.key,
      ...bookingSnapshot.val(),
    }

    // Төлбөр төлөгдсөн эсэхийг шалгах
    if (booking.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Захиалгын төлбөр төлөгдөөгүй байна" }, { status: 400 })
    }

    // Төлбөрийн мэдээлэл авах
    let paymentData = null
    const paymentsRef = ref(database, "payments")
    const paymentsSnapshot = await get(paymentsRef)

    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val()
      const paymentKey = Object.keys(payments).find(
        (key) => payments[key].bookingId === bookingId || payments[key].paymentId === booking.paymentId,
      )

      if (paymentKey) {
        paymentData = payments[paymentKey]
      }
    }

    // HTML баримт үүсгэх
    const receiptHtml = generateReceiptHtml(booking, paymentData)

    // HTML баримтыг буцаах
    return new NextResponse(receiptHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Баримт үүсгэхэд алдаа гарлаа" }, { status: 500 })
  }
}

// HTML баримт үүсгэх функц
function generateReceiptHtml(booking: any, payment: any) {
  const receiptNumber = `R-${booking.id.slice(0, 8).toUpperCase()}`
  const paymentDate = payment?.createdAt
    ? new Date(payment.createdAt).toLocaleDateString("mn-MN")
    : new Date().toLocaleDateString("mn-MN")
  const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString("mn-MN") : "Тодорхойгүй"
  const createdDate = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("mn-MN") : "Тодорхойгүй"

  return `
    <!DOCTYPE html>
    <html lang="mn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Төлбөрийн баримт - ${receiptNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .receipt {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .receipt-header h1 {
          margin: 0;
          color: #2563eb;
          font-size: 24px;
        }
        .receipt-header p {
          margin: 5px 0;
          color: #666;
        }
        .receipt-details {
          margin-bottom: 20px;
        }
        .receipt-details h2 {
          font-size: 18px;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
        }
        .receipt-items {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f9fafb;
        }
        .total-row {
          font-weight: bold;
        }
        .receipt-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .print-button {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        .print-button:hover {
          background-color: #1d4ed8;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            padding: 0;
          }
          .receipt {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="receipt-header">
          <h1>NomadTour</h1>
          <p>Төлбөрийн баримт</p>
          <p>Баримтын дугаар: ${receiptNumber}</p>
          <p>Огноо: ${paymentDate}</p>
        </div>
        
        <div class="receipt-details">
          <h2>Захиалгын мэдээлэл</h2>
          <div class="detail-row">
            <span class="detail-label">Захиалгын дугаар:</span>
            <span>${booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Захиалга үүсгэсэн:</span>
            <span>${createdDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Аялал:</span>
            <span>${booking.tourTitle || "Тодорхойгүй"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Аялах өдөр:</span>
            <span>${bookingDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Хүний тоо:</span>
            <span>${booking.adults} том хүн${booking.children > 0 ? `, ${booking.children} хүүхэд` : ""}</span>
          </div>
        </div>
        
        <div class="receipt-details">
          <h2>Захиалагчийн мэдээлэл</h2>
          <div class="detail-row">
            <span class="detail-label">Нэр:</span>
            <span>${booking.customerName || "Тодорхойгүй"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Имэйл:</span>
            <span>${booking.customerEmail || "Тодорхойгүй"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Утас:</span>
            <span>${booking.customerPhone || "Тодорхойгүй"}</span>
          </div>
        </div>
        
        <div class="receipt-items">
          <h2>Төлбөрийн мэдээлэл</h2>
          <table>
            <thead>
              <tr>
                <th>Тайлбар</th>
                <th>Тоо</th>
                <th>Нэгж үнэ</th>
                <th>Нийт</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Том хүн</td>
                <td>${booking.adults}</td>
                <td>₮${Math.round(booking.totalPrice / booking.adults).toLocaleString()}</td>
                <td>₮${(booking.adults * Math.round(booking.totalPrice / booking.adults)).toLocaleString()}</td>
              </tr>
              ${
                booking.children > 0
                  ? `<tr>
                      <td>Хүүхэд</td>
                      <td>${booking.children}</td>
                      <td>₮${Math.round(booking.totalPrice * 0.5).toLocaleString()}</td>
                      <td>₮${(booking.children * Math.round(booking.totalPrice * 0.5)).toLocaleString()}</td>
                    </tr>`
                  : ""
              }
              ${
                booking.discount > 0
                  ? `<tr>
                      <td>Хөнгөлөлт</td>
                      <td></td>
                      <td></td>
                      <td>-₮${booking.discount.toLocaleString()}</td>
                    </tr>`
                  : ""
              }
              <tr class="total-row">
                <td colspan="3">Нийт дүн</td>
                <td>₮${booking.totalPrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="receipt-details">
          <h2>Төлбөрийн арга</h2>
          <div class="detail-row">
            <span class="detail-label">Төлбөрийн хэлбэр:</span>
            <span>${booking.paymentProvider ? booking.paymentProvider.toUpperCase() : "Тодорхойгүй"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Төлбөрийн ID:</span>
            <span>${booking.paymentId || "Тодорхойгүй"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Төлбөр төлсөн огноо:</span>
            <span>${paymentDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Төлөв:</span>
            <span>Төлөгдсөн</span>
          </div>
        </div>
        
        <div class="receipt-footer">
          <p>NomadTour ХХК | Регистрийн дугаар: 1234567890 | Утас: +976 99112233</p>
          <p>Хаяг: Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо, Сүхбаатарын талбай</p>
          <p>Имэйл: info@nomadtour.mn | Вэб: www.nomadtour.mn</p>
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button class="print-button" onclick="window.print()">Хэвлэх</button>
      </div>
      
      <script>
        // Автоматаар хэвлэх диалог нээх
        window.onload = function() {
          // Хэрэглэгч хуудсыг нээсний дараа 1 секундын дараа хэвлэх диалог нээнэ
          setTimeout(function() {
            window.print();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `
}
