import { NextResponse } from "next/server"

// Dummy database for tours
const tours = [
  {
    id: 1,
    title: "Хөвсгөл нуурын аялал",
    location: "Хөвсгөл аймаг",
    description: "Монголын хамгийн том цэнгэг усны нуур, үзэсгэлэнт байгаль, цэвэр агаар",
    price: 450000,
    duration: 5,
    image: "/khovsgol-tranquility.png",
    type: ["Байгаль", "Амралт"],
  },
  {
    id: 2,
    title: "Говийн аялал",
    location: "Өмнөговь аймаг",
    description: "Говийн үзэсгэлэнт газрууд, Хонгорын элс, Баянзаг, Ёлын ам",
    price: 650000,
    duration: 7,
    image: "/gobi-desert-landscape.png",
    type: ["Байгаль", "Адал явдал"],
  },
  {
    id: 3,
    title: "Тэрэлжийн аялал",
    location: "Төв аймаг",
    description: "Улаанбаатар хотоос ойрхон, үзэсгэлэнт байгаль, амралт, зугаалга",
    price: 150000,
    duration: 2,
    image: "/terelj-valley-landscape.png",
    type: ["Байгаль", "Амралт", "Гэр бүлийн"],
  },
  {
    id: 4,
    title: "Хархорин аялал",
    location: "Өвөрхангай аймаг",
    description: "Монголын эртний нийслэл, Эрдэнэзуу хийд, түүхэн дурсгалт газрууд",
    price: 350000,
    duration: 4,
    image: "/karakorum-landscape.png",
    type: ["Түүх соёл", "Гэр бүлийн"],
  },
  {
    id: 5,
    title: "Алтай нурууны аялал",
    location: "Баян-Өлгий аймаг",
    description: "Монголын хамгийн өндөр уулс, бүргэдчид, казах соёл",
    price: 850000,
    duration: 9,
    image: "/placeholder.svg?height=200&width=300&query=altai%20mountains%20mongolia",
    type: ["Байгаль", "Адал явдал", "Түүх соёл"],
  },
  {
    id: 6,
    title: "Хустайн нурууны аялал",
    location: "Төв аймаг",
    description: "Тахь адуу, байгалийн цогцолбор газар, амьтан ургамал",
    price: 250000,
    duration: 3,
    image: "/placeholder.svg?height=200&width=300&query=hustai%20national%20park%20mongolia",
    type: ["Байгаль", "Гэр бүлийн"],
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Get budget parameter
  const budget = searchParams.get("budget") ? Number.parseInt(searchParams.get("budget")!) : 0
  const preferredType = searchParams.get("type")

  // Filter tours based on budget
  let recommendedTours = tours.filter((tour) => tour.price <= budget)

  // If preferred type is provided, prioritize tours of that type
  if (preferredType) {
    recommendedTours.sort((a, b) => {
      const aHasType = a.type.includes(preferredType) ? 1 : 0
      const bHasType = b.type.includes(preferredType) ? 1 : 0
      return bHasType - aHasType
    })
  }

  // Sort by price (highest first to maximize budget usage)
  recommendedTours.sort((a, b) => b.price - a.price)

  // If no tours match the budget, recommend the cheapest tours
  if (recommendedTours.length === 0) {
    recommendedTours = [...tours].sort((a, b) => a.price - b.price).slice(0, 3)
  }

  return NextResponse.json(recommendedTours.slice(0, 5))
}
