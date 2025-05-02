"use client"

import { useState, useEffect } from "react"
import { ref, get, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Check, CreditCard, DollarSign, Download, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="mr-1 h-3 w-3" /> Амжилттай
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Хүлээгдэж буй
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="mr-1 h-3 w-3" /> Амжилтгүй
        </Badge>
      )
    case "refunded":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <RefundIcon className="mr-1 h-3 w-3" /> Буцаагдсан
        </Badge>
      )
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Тодорхойгүй</Badge>
  }
}

// Payment method badge component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  switch (method) {
    case "credit_card":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <CreditCard className="mr-1 h-3 w-3" /> Кредит карт
        </Badge>
      )
    case "bank_transfer":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Bank className="mr-1 h-3 w-3" /> Банк шилжүүлэг
        </Badge>
      )
    case "cash":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Wallet className="mr-1 h-3 w-3" /> Бэлэн мөнгө
        </Badge>
      )
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Тодорхойгүй</Badge>
  }
}

export default function AdminPayments() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [stats, setStats] = useState({
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  })

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)

        // Fetch payments from Firebase
        const paymentsRef = ref(database, "payments")
        const snapshot = await get(paymentsRef)

        if (snapshot.exists()) {
          const paymentsData = snapshot.val()

          // Convert object to array and add id
          const paymentsArray = Object.entries(paymentsData).map(([id, data]) => ({
            id,
            ...(data as any),
          }))

          // Sort by date (newest first)
          paymentsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setPayments(paymentsArray)
          setFilteredPayments(paymentsArray)

          // Calculate statistics
          calculateStats(paymentsArray)
        }
      } catch (error) {
        console.error("Error fetching payments:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Төлбөрийн мэдээлэл ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [toast])

  // Calculate payment statistics
  const calculateStats = (paymentsArray: any[]) => {
    const stats = {
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0,
      failedAmount: 0,
      totalCount: paymentsArray.length,
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
    }

    paymentsArray.forEach((payment) => {
      stats.totalAmount += payment.amount

      if (payment.status === "completed") {
        stats.completedAmount += payment.amount
        stats.completedCount++
      } else if (payment.status === "pending") {
        stats.pendingAmount += payment.amount
        stats.pendingCount++
      } else if (payment.status === "failed") {
        stats.failedAmount += payment.amount
        stats.failedCount++
      }
    })

    setStats(stats)
  }

  // Filter payments based on search term, status, and date
  useEffect(() => {
    let filtered = [...payments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.tourName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    // Filter by date
    if (dateFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((payment) => new Date(payment.date) >= today)
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter((payment) => new Date(payment.date) >= weekAgo)
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = filtered.filter((payment) => new Date(payment.date) >= monthAgo)
    }

    setFilteredPayments(filtered)
  }, [searchTerm, statusFilter, dateFilter, payments])

  // Update payment status
  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const paymentRef = ref(database, `payments/${paymentId}`)
      await update(paymentRef, { status: newStatus })

      // Update local state
      const updatedPayments = payments.map((payment) => {
        if (payment.id === paymentId) {
          return { ...payment, status: newStatus }
        }
        return payment
      })

      setPayments(updatedPayments)
      calculateStats(updatedPayments)

      toast({
        title: "Төлөв шинэчлэгдлээ",
        description: "Төлбөрийн төлөв амжилттай шинэчлэгдлээ.",
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Төлбөрийн төлөв шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: "MNT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get recent payments (last 24 hours)
  const getRecentPayments = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return payments.filter((payment) => new Date(payment.date) >= yesterday)
  }

  // Get payments that need attention (failed or pending for more than 3 days)
  const getAttentionPayments = () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    return payments.filter(
      (payment) =>
        payment.status === "failed" || (payment.status === "pending" && new Date(payment.date) <= threeDaysAgo),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Төлбөрүүд</h2>
        <p className="text-muted-foreground">Бүх төлбөрүүдийн жагсаалт болон удирдлага.</p>
      </div>

      {/* Payment statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт төлбөр</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalCount} төлбөр</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Амжилттай төлбөр</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.completedAmount)}</div>
            <p className="text-xs text-muted-foreground">{stats.completedCount} төлбөр</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж буй төлбөр</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCount} төлбөр</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Амжилтгүй төлбөр</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.failedAmount)}</div>
            <p className="text-xs text-muted-foreground">{stats.failedCount} төлбөр</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Хайх..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Төлөв" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүгд</SelectItem>
            <SelectItem value="completed">Амжилттай</SelectItem>
            <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
            <SelectItem value="failed">Амжилтгүй</SelectItem>
            <SelectItem value="refunded">Буцаагдсан</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Огноо" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх огноо</SelectItem>
            <SelectItem value="today">Өнөөдөр</SelectItem>
            <SelectItem value="week">Сүүлийн 7 хоног</SelectItem>
            <SelectItem value="month">Сүүлийн сар</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" /> Экспорт
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Бүх төлбөрүүд</TabsTrigger>
          <TabsTrigger value="recent">Сүүлийн гүйлгээнүүд</TabsTrigger>
          <TabsTrigger value="attention">Анхаарал хандуулах</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Бүх төлбөрүүд</CardTitle>
              <CardDescription>Нийт {filteredPayments.length} төлбөрийн жагсаалт.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Аялал</TableHead>
                    <TableHead>Дүн</TableHead>
                    <TableHead>Төлбөрийн хэлбэр</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Ачаалж байна...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Төлбөрийн мэдээлэл олдсонгүй.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>{payment.tourName}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <PaymentMethodBadge method={payment.method} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={payment.status}
                            onValueChange={(value) => updatePaymentStatus(payment.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Төлөв өөрчлөх" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Амжилттай</SelectItem>
                              <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
                              <SelectItem value="failed">Амжилтгүй</SelectItem>
                              <SelectItem value="refunded">Буцаагдсан</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Сүүлийн гүйлгээнүүд</CardTitle>
              <CardDescription>Сүүлийн 24 цагийн гүйлгээний мэдээлэл.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Аялал</TableHead>
                    <TableHead>Дүн</TableHead>
                    <TableHead>Төлбөрийн хэлбэр</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Ачаалж байна...
                      </TableCell>
                    </TableRow>
                  ) : getRecentPayments().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Сүүлийн 24 цагт гүйлгээ хийгдээгүй байна.
                      </TableCell>
                    </TableRow>
                  ) : (
                    getRecentPayments().map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>{payment.tourName}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <PaymentMethodBadge method={payment.method} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attention">
          <Card>
            <CardHeader>
              <CardTitle>Анхаарал хандуулах шаардлагатай төлбөрүүд</CardTitle>
              <CardDescription>Амжилтгүй болон 3-аас дээш хоног хүлээгдэж буй төлбөрүүд.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Аялал</TableHead>
                    <TableHead>Дүн</TableHead>
                    <TableHead>Төлбөрийн хэлбэр</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Ачаалж байна...
                      </TableCell>
                    </TableRow>
                  ) : getAttentionPayments().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Анхаарал хандуулах шаардлагатай төлбөр байхгүй байна.
                      </TableCell>
                    </TableRow>
                  ) : (
                    getAttentionPayments().map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>{payment.tourName}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <PaymentMethodBadge method={payment.method} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={payment.status}
                            onValueChange={(value) => updatePaymentStatus(payment.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Төлөв өөрчлөх" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Амжилттай</SelectItem>
                              <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
                              <SelectItem value="failed">Амжилтгүй</SelectItem>
                              <SelectItem value="refunded">Буцаагдсан</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing components
const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const RefundIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
    <path d="M12 3v6" />
  </svg>
)

const Bank = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M4 4h16a1 1 0 0 1 1 1v4H3V5a1 1 0 0 1 1-1z" />
    <path d="M7 15h.01" />
    <path d="M11 15h.01" />
    <path d="M15 15h.01" />
  </svg>
)

const Wallet = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)
