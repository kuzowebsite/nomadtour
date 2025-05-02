"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, Calendar, CreditCard, DollarSign, Users, Package, TrendingUp } from "lucide-react"

// Dummy data for initial render
const initialRevenueData = [
  { name: "1-р сар", value: 4000 },
  { name: "2-р сар", value: 3000 },
  { name: "3-р сар", value: 2000 },
  { name: "4-р сар", value: 2780 },
  { name: "5-р сар", value: 1890 },
  { name: "6-р сар", value: 2390 },
  { name: "7-р сар", value: 3490 },
  { name: "8-р сар", value: 4000 },
  { name: "9-р сар", value: 5000 },
  { name: "10-р сар", value: 6000 },
  { name: "11-р сар", value: 7000 },
  { name: "12-р сар", value: 8000 },
]

const initialTourTypeData = [
  { name: "Дотоод аялал", value: 65 },
  { name: "Гадаад аялал", value: 35 },
]

const initialTopToursData = [
  { name: "Хөвсгөл нуур", value: 25 },
  { name: "Говийн гайхамшиг", value: 20 },
  { name: "Тэрэлж", value: 18 },
  { name: "Хархорин", value: 15 },
  { name: "Алтай", value: 12 },
]

const initialDestinationData = [
  { name: "Монгол", value: 65 },
  { name: "Япон", value: 10 },
  { name: "Солонгос", value: 8 },
  { name: "Тайланд", value: 7 },
  { name: "Хятад", value: 5 },
  { name: "Сингапур", value: 5 },
]

const initialPaymentMethodData = [
  { name: "Кредит карт", value: 45 },
  { name: "Банк шилжүүлэг", value: 40 },
  { name: "Бэлэн мөнгө", value: 15 },
]

const initialBookingStatusData = [
  { name: "Баталгаажсан", value: 60 },
  { name: "Хүлээгдэж буй", value: 25 },
  { name: "Цуцлагдсан", value: 15 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export default function AdminStatistics() {
  const [timeRange, setTimeRange] = useState("year")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    conversionRate: 0,
    revenueChange: 0,
    bookingsChange: 0,
    usersChange: 0,
    conversionChange: 0,
  })
  const [revenueData, setRevenueData] = useState(initialRevenueData)
  const [tourTypeData, setTourTypeData] = useState(initialTourTypeData)
  const [topToursData, setTopToursData] = useState(initialTopToursData)
  const [destinationData, setDestinationData] = useState(initialDestinationData)
  const [paymentMethodData, setPaymentMethodData] = useState(initialPaymentMethodData)
  const [bookingStatusData, setBookingStatusData] = useState(initialBookingStatusData)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true)

        // Fetch data from Firebase
        const statsRef = ref(database, "statistics")
        const snapshot = await get(statsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()

          // Update state with fetched data
          if (data.overview) {
            setStats({
              totalRevenue: data.overview.totalRevenue || 0,
              totalBookings: data.overview.totalBookings || 0,
              totalUsers: data.overview.totalUsers || 0,
              conversionRate: data.overview.conversionRate || 0,
              revenueChange: data.overview.revenueChange || 0,
              bookingsChange: data.overview.bookingsChange || 0,
              usersChange: data.overview.usersChange || 0,
              conversionChange: data.overview.conversionChange || 0,
            })
          }

          if (data.revenue) {
            setRevenueData(data.revenue[timeRange] || initialRevenueData)
          }

          if (data.tourTypes) {
            setTourTypeData(data.tourTypes || initialTourTypeData)
          }

          if (data.topTours) {
            setTopToursData(data.topTours || initialTopToursData)
          }

          if (data.destinations) {
            setDestinationData(data.destinations || initialDestinationData)
          }

          if (data.paymentMethods) {
            setPaymentMethodData(data.paymentMethods || initialPaymentMethodData)
          }

          if (data.bookingStatuses) {
            setBookingStatusData(data.bookingStatuses || initialBookingStatusData)
          }
        }
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [timeRange])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Статистик</h2>
          <p className="text-muted-foreground">Бизнесийн гол үзүүлэлтүүд болон тайлан.</p>
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger>
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Хугацаа сонгох" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 хоног</SelectItem>
              <SelectItem value="month">Сар</SelectItem>
              <SelectItem value="quarter">Улирал</SelectItem>
              <SelectItem value="year">Жил</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт орлого</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₮{formatNumber(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  {stats.revenueChange}% өмнөх үеэс
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  {Math.abs(stats.revenueChange)}% өмнөх үеэс
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Захиалгын тоо</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalBookings)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.bookingsChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  {stats.bookingsChange}% өмнөх үеэс
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  {Math.abs(stats.bookingsChange)}% өмнөх үеэс
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хэрэглэгчид</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usersChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  {stats.usersChange}% өмнөх үеэс
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  {Math.abs(stats.usersChange)}% өмнөх үеэс
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Төлбөрийн хувь</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.conversionChange >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  {stats.conversionChange}% өмнөх үеэс
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  {Math.abs(stats.conversionChange)}% өмнөх үеэс
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" /> Ерөнхий
          </TabsTrigger>
          <TabsTrigger value="tours">
            <Package className="mr-2 h-4 w-4" /> Аялалууд
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="mr-2 h-4 w-4" /> Захиалга
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Орлогын тренд</CardTitle>
              <CardDescription>
                {timeRange === "week" && "Сүүлийн 7 хоногийн орлогын тренд"}
                {timeRange === "month" && "Сүүлийн сарын орлогын тренд"}
                {timeRange === "quarter" && "Сүүлийн улирлын орлогын тренд"}
                {timeRange === "year" && "Сүүлийн жилийн орлогын тренд"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Орлого" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Аяллын төрлүүд</CardTitle>
                <CardDescription>Аяллын төрлүүдийн харьцаа</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tourTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tourTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Хамгийн их захиалагдсан аялалууд</CardTitle>
                <CardDescription>Топ 5 аялал</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topToursData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Захиалгын хувь (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аяллын чиглэлүүд</CardTitle>
              <CardDescription>Аяллын чиглэлүүдийн харьцаа</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {destinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Төлбөрийн хэлбэр</CardTitle>
                <CardDescription>Төлбөрийн хэлбэрүүдийн харьцаа</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Захиалгын төлөв</CardTitle>
                <CardDescription>Захиалгын төлвийн харьцаа</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
