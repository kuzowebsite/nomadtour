import { NextResponse } from "next/server"
import { ref, set } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { routes } = await request.json()

    // Save each route to Firebase
    for (const [id, routeData] of Object.entries(routes)) {
      await set(ref(database, `routes/${id}`), routeData)
    }

    return NextResponse.json({ success: true, message: "Маршрутууд амжилттай үүсгэгдлээ" }, { status: 200 })
  } catch (error) {
    console.error("Error initializing routes:", error)
    return NextResponse.json({ success: false, message: "Маршрутуудыг үүсгэхэд алдаа гарлаа", error }, { status: 500 })
  }
}
