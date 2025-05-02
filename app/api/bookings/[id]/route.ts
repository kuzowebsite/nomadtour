import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, update } from "firebase/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id
    const body = await request.json()
    const { status, userId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    // Get the booking to verify ownership
    const bookingRef = ref(database, `bookings/${bookingId}`)
    const snapshot = await get(bookingRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = snapshot.val()

    // Verify that the user owns this booking or is an admin
    if (booking.userId !== userId && !body.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if booking is already paid
    if (booking.paymentStatus === "paid" && status === "cancelled" && !body.isAdmin) {
      return NextResponse.json(
        { error: "Cannot cancel a paid booking. Please contact customer support." },
        { status: 400 },
      )
    }

    // Update booking status
    await update(bookingRef, { status })

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const bookingRef = ref(database, `bookings/${bookingId}`)
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
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const isAdmin = searchParams.get("isAdmin") === "true"

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get the booking to verify ownership
    const bookingRef = ref(database, `bookings/${bookingId}`)
    const snapshot = await get(bookingRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = snapshot.val()

    // Verify that the user owns this booking or is an admin
    if (booking.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Instead of deleting, update status to cancelled
    await update(bookingRef, { status: "cancelled" })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
