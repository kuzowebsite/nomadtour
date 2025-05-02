import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, push, serverTimestamp, get } from "firebase/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tourId,
      tourName,
      date,
      adults,
      children,
      totalPrice,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
    } = body

    // Validate required fields
    if (!tourId || !tourName || !date || !adults || !totalPrice || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create booking in Firebase Realtime Database
    const bookingData = {
      tourId,
      tourTitle: tourName,
      date,
      adults,
      children: children || 0,
      totalPrice,
      userId,
      customerName: customerName || "Unknown",
      customerEmail: customerEmail || "Unknown",
      customerPhone: customerPhone || "Unknown",
      specialRequests: specialRequests || "",
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: serverTimestamp(),
    }

    const bookingsRef = ref(database, "bookings")
    const newBookingRef = await push(bookingsRef, bookingData)

    return NextResponse.json(
      {
        id: newBookingRef.key,
        ...bookingData,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (id) {
      // Get specific booking
      const bookingRef = ref(database, `bookings/${id}`)
      const snapshot = await get(bookingRef)

      if (!snapshot.exists()) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        booking: {
          id: snapshot.key,
          ...snapshot.val(),
        },
      })
    } else if (userId) {
      // Get all bookings for a user
      const bookingsRef = ref(database, "bookings")
      const snapshot = await get(bookingsRef)

      if (!snapshot.exists()) {
        return NextResponse.json({ success: true, bookings: [] })
      }

      const bookings: any[] = []
      snapshot.forEach((childSnapshot) => {
        const booking = childSnapshot.val()
        if (booking.userId === userId) {
          bookings.push({
            id: childSnapshot.key,
            ...booking,
          })
        }
      })

      return NextResponse.json({ success: true, bookings })
    }

    return NextResponse.json({ error: "Missing id or userId parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error in bookings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
