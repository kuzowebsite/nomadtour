"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ref, get, update, remove } from "firebase/database"
import { format } from "date-fns"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { database } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Booking {
  id: string
  tourId: string
  tourTitle: string
  date: string
  adults: number
  children: number
  totalPrice: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  status: string
  createdAt: number
  paymentStatus: string
}

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [sortField, setSortField] = useState<keyof Booking>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const bookingsPerPage = 10

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const bookingsRef = ref(database, "bookings")
        const snapshot = await get(bookingsRef)

        if (snapshot.exists()) {
          const bookingsData = snapshot.val()
          const bookingsArray = Object.entries(bookingsData).map(([id, data]) => ({
            id,
            ...(data as Omit<Booking, "id">),
          }))
          setBookings(bookingsArray)
        } else {
          setBookings([])
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Захиалгын мэдээлэл авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  useEffect(() => {
    // Apply filters and sorting
    let result = [...bookings]

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      result = result.filter((booking) => booking.paymentStatus === paymentFilter)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.customerName?.toLowerCase().includes(query) ||
          booking.customerEmail?.toLowerCase().includes(query) ||
          booking.customerPhone?.includes(query) ||
          booking.tourTitle?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        // For numbers and dates
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    setFilteredBookings(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [bookings, searchQuery, statusFilter, paymentFilter, sortField, sortDirection])

  const handleSort = (field: keyof Booking) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const bookingRef = ref(database, `bookings/${bookingId}`)
      await update(bookingRef, { status })

      // Update local state
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))

      toast({
        title: "Статус шинэчлэгдлээ",
        description: "Захиалгын статус амжилттай шинэчлэгдлээ",
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Захиалгын статус шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const updatePaymentStatus = async (bookingId: string, paymentStatus: string) => {
    try {
      const bookingRef = ref(database, `bookings/${bookingId}`)
      await update(bookingRef, { paymentStatus })

      // Update local state
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, paymentStatus } : booking)))

      toast({
        title: "Төлбөрийн статус шинэчлэгдлээ",
        description: "Захиалгын төлбөрийн статус амжилттай шинэчлэгдлээ",
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Төлбөрийн статус шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (bookingId: string) => {
    setBookingToDelete(bookingId)
    setDeleteDialogOpen(true)
  }

  const deleteBooking = async () => {
    if (!bookingToDelete) return

    try {
      const bookingRef = ref(database, `bookings/${bookingToDelete}`)
      await remove(bookingRef)

      // Update local state
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete))

      toast({
        title: "Захиалга устгагдлаа",
        description: "Захиалга амжилттай устгагдлаа",
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Захиалга устгахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBookingToDelete(null)
    }
  }

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking)
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A"
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm")
    } catch (error) {
      return "Invalid date"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-emerald-600 border-emerald-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Захиалгын мэдээлэл ачаалж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Захиалгууд</h1>
          <p className="text-gray-500">Бүх аялалын захиалгуудын жагсаалт</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Шүүлтүүр</CardTitle>
          <CardDescription>Захиалгуудыг шүүх, хайх</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Хайх</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Нэр, имэйл, утас, аялал..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Захиалгын төлөв</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Бүх төлөв" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
                  <SelectItem value="confirmed">Баталгаажсан</SelectItem>
                  <SelectItem value="cancelled">Цуцлагдсан</SelectItem>
                  <SelectItem value="completed">Дууссан</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Төлбөрийн төлөв</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Бүх төлөв" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  <SelectItem value="unpaid">Төлөгдөөгүй</SelectItem>
                  <SelectItem value="paid">Төлөгдсөн</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("customerName")}>
                    Хэрэглэгч
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("tourTitle")}>
                    Аялал
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("date")}>
                    Огноо
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("totalPrice")}>
                    Үнэ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("status")}>
                    Төлөв
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("paymentStatus")}>
                    Төлбөр
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("createdAt")}>
                    Үүсгэсэн
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Захиалга олдсонгүй
                  </TableCell>
                </TableRow>
              ) : (
                currentBookings.map((booking, index) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{indexOfFirstBooking + index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.tourTitle}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.totalPrice?.toLocaleString()}₮</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {booking.status === "pending"
                          ? "Хүлээгдэж буй"
                          : booking.status === "confirmed"
                            ? "Баталгаажсан"
                            : booking.status === "cancelled"
                              ? "Цуцлагдсан"
                              : "Дууссан"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.paymentStatus === "paid" ? "Төлөгдсөн" : "Төлөгдөөгүй"}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(booking.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Цэс нээх</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Үйлдлүүд</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/tours/${booking.tourId}`} target="_blank">
                              Аялал харах
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Захиалгын төлөв</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, "pending")}>
                            <span className="text-yellow-600 mr-2">⬤</span> Хүлээгдэж буй
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                            <span className="text-blue-600 mr-2">⬤</span> Баталгаажсан
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, "cancelled")}>
                            <span className="text-red-600 mr-2">⬤</span> Цуцлагдсан
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, "completed")}>
                            <span className="text-green-600 mr-2">⬤</span> Дууссан
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Төлбөрийн төлөв</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => updatePaymentStatus(booking.id, "unpaid")}>
                            <span className="text-gray-600 mr-2">⬤</span> Төлөгдөөгүй
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePaymentStatus(booking.id, "paid")}>
                            <span className="text-green-600 mr-2">⬤</span> Төлөгдсөн
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => confirmDelete(booking.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Устгах
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-500">
            Нийт: {filteredBookings.length} захиалга ({indexOfFirstBooking + 1}-
            {Math.min(indexOfLastBooking, filteredBookings.length)} харуулж байна)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Захиалга устгах</DialogTitle>
            <DialogDescription>
              Та энэ захиалгыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={deleteBooking}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
