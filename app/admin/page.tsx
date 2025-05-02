"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  MoreHorizontal,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  BarChart3,
  Activity,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Хянах самбар</h2>
          <p className="text-gray-500 mt-1">Таны бизнесийн гол үзүүлэлтүүд болон сүүлийн үеийн мэдээллүүд.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[400px]">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="24h">24 цаг</TabsTrigger>
              <TabsTrigger value="7d">7 хоног</TabsTrigger>
              <TabsTrigger value="30d">30 хоног</TabsTrigger>
              <TabsTrigger value="90d">Улирал</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Нийт орлого</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₮ 45,231,890</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-emerald-600 inline-flex items-center font-medium">
                +20.1% <TrendingUp className="ml-1 h-3 w-3" />
              </span>{" "}
              <span className="ml-1 text-gray-500">
                өмнөх {timeRange === "24h" ? "өдрөөс" : timeRange === "7d" ? "долоо хоногоос" : "сараас"}
              </span>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "70%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Захиалгууд</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">+24</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-emerald-600 inline-flex items-center font-medium">
                +12.2% <TrendingUp className="ml-1 h-3 w-3" />
              </span>{" "}
              <span className="ml-1 text-gray-500">
                өмнөх {timeRange === "24h" ? "өдрөөс" : timeRange === "7d" ? "долоо хоногоос" : "сараас"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-white rounded-lg p-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 mb-1" />
                <span className="text-xs font-medium">18</span>
                <span className="text-[10px] text-gray-500">Баталгаажсан</span>
              </div>
              <div className="flex flex-col items-center bg-white rounded-lg p-2 shadow-sm">
                <Clock className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-xs font-medium">5</span>
                <span className="text-[10px] text-gray-500">Хүлээгдэж буй</span>
              </div>
              <div className="flex flex-col items-center bg-white rounded-lg p-2 shadow-sm">
                <XCircle className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-xs font-medium">1</span>
                <span className="text-[10px] text-gray-500">Цуцлагдсан</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Шинэ хэрэглэгчид</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">+573</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-emerald-600 inline-flex items-center font-medium">
                +8.1% <TrendingUp className="ml-1 h-3 w-3" />
              </span>{" "}
              <span className="ml-1 text-gray-500">
                өмнөх {timeRange === "24h" ? "өдрөөс" : timeRange === "7d" ? "долоо хоногоос" : "сараас"}
              </span>
            </div>
            <div className="mt-4 relative pt-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <div>0</div>
                <div>Зорилт: 1000</div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                <div
                  style={{ width: "57%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 rounded-full"
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Төлбөрийн хувь</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">92.4%</div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-emerald-600 inline-flex items-center font-medium">
                +2.4% <TrendingUp className="ml-1 h-3 w-3" />
              </span>{" "}
              <span className="ml-1 text-gray-500">
                өмнөх {timeRange === "24h" ? "өдрөөс" : timeRange === "7d" ? "долоо хоногоос" : "сараас"}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
                <span className="text-xs text-gray-600">Төлсөн</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span className="text-xs text-gray-600">Хүлээгдэж буй</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs text-gray-600">Цуцлагдсан</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Сүүлийн захиалгууд</CardTitle>
                <CardDescription>Сүүлийн 10 захиалгын мэдээлэл</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                <Link href="/admin/bookings">Бүгдийг харах</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">ID</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Хэрэглэгч</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Аялал</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Огноо</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Төлөв</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Үнэ</th>
                      <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{booking.id}</td>
                        <td className="py-3 text-sm">{booking.customer}</td>
                        <td className="py-3 text-sm max-w-[150px] truncate">{booking.tour}</td>
                        <td className="py-3 text-sm text-gray-500">{booking.date}</td>
                        <td className="py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === "Баталгаажсан"
                                ? "bg-emerald-100 text-emerald-700"
                                : booking.status === "Хүлээгдэж буй"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status === "Баталгаажсан" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {booking.status === "Хүлээгдэж буй" && <Clock className="mr-1 h-3 w-3" />}
                            {booking.status === "Цуцлагдсан" && <XCircle className="mr-1 h-3 w-3" />}
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-medium">{booking.amount.toLocaleString()}₮</td>
                        <td className="py-3 text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Цэс</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Дэлгэрэнгүй</DropdownMenuItem>
                              <DropdownMenuItem>Засах</DropdownMenuItem>
                              <DropdownMenuItem>Цуцлах</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Эрэлттэй аялалууд</CardTitle>
                <CardDescription>Хамгийн их захиалагдсан аялалууд</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                <Link href="/admin/tours">Бүгдийг харах</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {popularTours.map((tour, index) => (
                <div
                  key={tour.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${index % 2 === 0 ? "bg-gray-50" : ""}`}
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden shadow-sm">
                    <img
                      src={tour.image || "/placeholder.svg"}
                      alt={tour.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{tour.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{tour.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{tour.bookings} захиалга</p>
                    <p className="text-sm text-emerald-600 font-medium">{tour.revenue.toLocaleString()}₮</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Аяллын төрлүүд</CardTitle>
                <CardDescription>Аяллын төрлүүдийн харьцаа</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Сүүлийн 30 хоног
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Сүүлийн 7 хоног</DropdownMenuItem>
                  <DropdownMenuItem>Сүүлийн 30 хоног</DropdownMenuItem>
                  <DropdownMenuItem>Сүүлийн 90 хоног</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                  <span className="text-sm">Дотоод аялал</span>
                  <span className="ml-auto font-medium">65%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Гадаад аялал</span>
                  <span className="ml-auto font-medium">35%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Тусгай аялал</span>
                  <span className="ml-auto font-medium">15%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">Бүлгийн аялал</span>
                  <span className="ml-auto font-medium">25%</span>
                </div>
              </div>
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">125</div>
                    <div className="text-xs text-gray-500">Нийт аялал</div>
                  </div>
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="87.92"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="163.28"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="213.52"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="188.4"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Орлогын тренд</CardTitle>
                <CardDescription>Сүүлийн 7 хоногийн орлогын тренд</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <BarChart3 className="h-4 w-4 mr-1" /> Дэлгэрэнгүй
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 80, 90, 75].map((value, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  <div
                    className={`w-10 rounded-t-md ${index === 5 ? "bg-emerald-500" : "bg-emerald-100"}`}
                    style={{ height: `${value * 1.8}px` }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-500">
                    {["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"][index]}
                  </div>
                  {index === 5 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs py-1 px-2 rounded">
                      +12%
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Өнөөдрийн орлого</div>
                <div className="text-xl font-bold">₮ 1,250,000</div>
              </div>
              <div className="flex items-center text-emerald-600">
                <Activity className="h-4 w-4 mr-1" />
                <span className="font-medium">+8.2% өсөлт</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const recentBookings = [
  {
    id: "B-2305",
    customer: "Батбаяр Д.",
    tour: "Хөвсгөл нуурын аялал",
    date: "2023-05-15",
    status: "Баталгаажсан",
    amount: 900000,
  },
  {
    id: "B-2304",
    customer: "Оюунчимэг Б.",
    tour: "Говийн аялал",
    date: "2023-05-14",
    status: "Баталгаажсан",
    amount: 1300000,
  },
  {
    id: "B-2303",
    customer: "Ганбаатар Т.",
    tour: "Тэрэлжийн аялал",
    date: "2023-05-13",
    status: "Хүлээгдэж буй",
    amount: 300000,
  },
  {
    id: "B-2302",
    customer: "Сарангэрэл Ч.",
    tour: "Японы сакура үзэх аялал",
    date: "2023-05-12",
    status: "Баталгаажсан",
    amount: 4900000,
  },
  {
    id: "B-2301",
    customer: "Болд Б.",
    tour: "Хархорин аялал",
    date: "2023-05-11",
    status: "Цуцлагдсан",
    amount: 700000,
  },
]

const popularTours = [
  {
    id: 1,
    name: "Хөвсгөл нуурын аялал",
    location: "Хөвсгөл аймаг",
    bookings: 24,
    revenue: 10800000,
    image: "/khovsgol-tranquility.png",
  },
  {
    id: 2,
    name: "Говийн аялал",
    location: "Өмнөговь аймаг",
    bookings: 18,
    revenue: 11700000,
    image: "/gobi-desert-landscape.png",
  },
  {
    id: 3,
    name: "Тэрэлжийн аялал",
    location: "Төв аймаг",
    bookings: 15,
    revenue: 2250000,
    image: "/terelj-valley-landscape.png",
  },
  {
    id: 8,
    name: "Японы сакура үзэх аялал",
    location: "Япон",
    bookings: 12,
    revenue: 29400000,
    image: "/japan-sakura.png",
  },
]
