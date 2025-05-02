import { NextResponse } from "next/server"

// Dummy database for tours
const tours = [
  {
    id: 1,
    title: "Хөвсгөл нуурын аялал",
    location: "Хөвсгөл аймаг",
    description: "Монголын хамгийн том цэнгэг усны нуур, үзэсгэлэнт байгаль, цэвэр агаар",
    fullDescription:
      "Хөвсгөл нуур нь Монгол улсын хойд хэсэгт оршдог Монголын хамгийн том, дэлхийн хоёр дахь том цэнгэг усны нуур юм. Энэ нуур нь 136 км урт, 262 метр гүн бөгөөд Монголын нийт цэнгэг усны 70%-ийг агуулдаг. Хөвсгөл нуурын эргэн тойрон үзэсгэлэнт ой, уул, бэлчээр газраар хүрээлэгдсэн бөгөөд олон төрлийн ховор амьтад, ургамал байдаг.",
    price: 450000,
    duration: 5,
    image: "/khovsgol-tranquility.png",
  },
  {
    id: 2,
    title: "Говийн аялал",
    location: "Өмнөговь аймаг",
    description: "Говийн үзэсгэлэнт газрууд, Хонгорын элс, Баянзаг, Ёлын ам",
    fullDescription:
      "Говь цөл нь Монгол улсын өмнөд хэсэгт оршдог бөгөөд дэлхийн хамгийн том цөлүүдийн нэг юм. Энэ аялалаар та Хонгорын элс, Баянзаг, Ёлын ам зэрэг говийн үзэсгэлэнт газруудаар аялах болно. Баянзаг нь дэлхийд алдартай динозаврын олдворт газар бөгөөд 'Улаан хад' хэмээн нэрлэгддэг. Хонгорын элс нь 180 км урт, 3-15 км өргөн, 80-300 метр өндөр элсэн манхан юм.",
    price: 650000,
    duration: 7,
    image: "/gobi-desert-landscape.png",
  },
  {
    id: 3,
    title: "Тэрэлжийн аялал",
    location: "Төв аймаг",
    description: "Улаанбаатар хотоос ойрхон, үзэсгэлэнт байгаль, амралт, зугаалга",
    fullDescription:
      "Тэрэлж нь Улаанбаатар хотоос ойролцоогоор 55 км зайд оршдог үзэсгэлэнт байгалийн цогцолбор газар юм. Энэ бүс нутаг нь үзэсгэлэнт уул, хад, ой, гол горхиор баялаг бөгөөд амралт, зугаалгад тохиромжтой газар юм. Тэрэлжид алдарт Мэлхий хад, Их Өвгөн хад зэрэг сонирхолтой хад чулуунууд байдаг бөгөөд мөн Ариун Гандан хийд зэрэг түүхэн дурсгалт газрууд байдаг.",
    price: 150000,
    duration: 2,
    image: "/terelj-valley-landscape.png",
  },
  {
    id: 4,
    title: "Хархорин аялал",
    location: "Өвөрхангай аймаг",
    description: "Монголын эртний нийслэл, Эрдэнэзуу хийд, түүхэн дурсгалт газрууд",
    price: 350000,
    duration: 4,
    image: "/karakorum-landscape.png",
  },
  {
    id: 5,
    title: "Алтай нурууны аялал",
    location: "Баян-Өлгий аймаг",
    description: "Монголын хамгийн өндөр уулс, бүргэдчид, казах соёл",
    price: 850000,
    duration: 9,
    image: "/placeholder.svg?height=200&width=300&query=altai%20mountains%20mongolia",
  },
  {
    id: 6,
    title: "Хустайн нурууны аялал",
    location: "Төв аймаг",
    description: "Тахь адуу, байгалийн цогцолбор газар, амьтан ургамал",
    price: 250000,
    duration: 3,
    image: "/placeholder.svg?height=200&width=300&query=hustai%20national%20park%20mongolia",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Get filter parameters
  const minPrice = searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : 0
  const maxPrice = searchParams.get("maxPrice")
    ? Number.parseInt(searchParams.get("maxPrice")!)
    : Number.POSITIVE_INFINITY
  const location = searchParams.get("location")
  const minDuration = searchParams.get("minDuration") ? Number.parseInt(searchParams.get("minDuration")!) : 0
  const maxDuration = searchParams.get("maxDuration")
    ? Number.parseInt(searchParams.get("maxDuration")!)
    : Number.POSITIVE_INFINITY

  // Filter tours based on parameters
  const filteredTours = tours.filter((tour) => {
    const priceMatch = tour.price >= minPrice && tour.price <= maxPrice
    const durationMatch = tour.duration >= minDuration && tour.duration <= maxDuration
    const locationMatch = !location || tour.location.toLowerCase().includes(location.toLowerCase())

    return priceMatch && durationMatch && locationMatch
  })

  return NextResponse.json(filteredTours)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.tourId || !data.date || !data.participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the tour
    const tour = tours.find((t) => t.id === Number.parseInt(data.tourId))
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Calculate total price
    const totalPrice = tour.price * data.participants

    // In a real application, you would save the booking to a database here

    return NextResponse.json({
      success: true,
      booking: {
        id: Math.floor(Math.random() * 1000000),
        tourId: data.tourId,
        tourName: tour.title,
        date: data.date,
        participants: data.participants,
        totalPrice: totalPrice,
        status: "confirmed",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
