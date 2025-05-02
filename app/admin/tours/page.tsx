"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ref, get, remove, update, set } from "firebase/database"
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Filter,
  ChevronDown,
  Globe,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"

import { database } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Tour type definition
interface Tour {
  id: string
  title: string
  location: string
  description: string
  adultPrice: number
  childPrice: number
  duration: number
  image: string
  types: string[]
  category: string
  status: string
}

export default function AdminTours() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tourToDelete, setTourToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const toursPerPage = 5

  // Fetch tours from Firebase
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true)
      try {
        const toursRef = ref(database, "tours")
        const snapshot = await get(toursRef)

        if (snapshot.exists()) {
          const toursData = snapshot.val()
          const toursArray = Object.keys(toursData).map((key) => ({
            id: key,
            ...toursData[key],
          }))
          setTours(toursArray)
        } else {
          setTours([])
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching tours:", err)
        setError("Аялалуудыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
        setTours([])
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [])

  // Filter tours based on search query and filters
  const filteredTours = tours.filter((tour) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply category filter
    const matchesCategory = categoryFilter === "all" || tour.category === categoryFilter

    // Apply status filter
    const matchesStatus = statusFilter === "all" || tour.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination
  const indexOfLastTour = currentPage * toursPerPage
  const indexOfFirstTour = indexOfLastTour - toursPerPage
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour)
  const totalPages = Math.ceil(filteredTours.length / toursPerPage)

  // Handle tour deletion
  const confirmDeleteTour = (id: string) => {
    setTourToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTour = async () => {
    if (!tourToDelete) return

    try {
      await remove(ref(database, `tours/${tourToDelete}`))

      setTours((prevTours) => prevTours.filter((tour) => tour.id !== tourToDelete))

      toast({
        title: "Аялал устгагдлаа",
        description: `Аялал амжилттай устгагдлаа.`,
      })
    } catch (err) {
      console.error("Error deleting tour:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Аялалыг устгахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTourToDelete(null)
    }
  }

  // Handle tour status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await update(ref(database, `tours/${id}`), {
        status: newStatus,
      })

      setTours((prevTours) => prevTours.map((tour) => (tour.id === id ? { ...tour, status: newStatus } : tour)))

      toast({
        title: "Төлөв шинэчлэгдлээ",
        description: `Аялалын төлөв амжилттай шинэчлэгдлээ.`,
      })
    } catch (err) {
      console.error("Error updating tour status:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Аялалын төлөвийг шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    }
  }

  // Initialize database with sample data if empty
  const initializeDatabase = async () => {
    try {
      setLoading(true)
      const toursRef = ref(database, "tours")
      const snapshot = await get(toursRef)

      if (!snapshot.exists()) {
        // Sample data
        const sampleTours = {
          tour1: {
            title: "Хөвсгөл нуурын аялал",
            location: "Хөвсгөл аймаг",
            description: "Монголын хамгийн том цэнгэг усны нуур, үзэсгэлэнт байгаль, цэвэр агаар",
            adultPrice: 450000,
            childPrice: 350000,
            duration: 5,
            image: "/khovsgol-tranquility.png",
            types: ["Байгаль", "Амралт"],
            category: "domestic",
            status: "active",
          },
          tour2: {
            title: "Говийн аялал",
            location: "Өмнөговь аймаг",
            description: "Говийн үзэсгэлэнт газрууд, Хонгорын элс, Баянзаг, Ёлын ам",
            adultPrice: 650000,
            childPrice: 520000,
            duration: 7,
            image: "/gobi-desert-landscape.png",
            types: ["Байгаль", "Адал явдал"],
            category: "domestic",
            status: "active",
          },
          tour3: {
            title: "Тэрэлжийн аялал",
            location: "Төв аймаг",
            description: "Улаанбаатар хотоос ойрхон, үзэсгэлэнт байгаль, амралт, зугаалга",
            adultPrice: 150000,
            childPrice: 120000,
            duration: 2,
            image: "/terelj-valley-landscape.png",
            types: ["Байгаль", "Амралт", "Гэр бүлийн"],
            category: "domestic",
            status: "active",
          },
        }

        await set(toursRef, sampleTours)

        toast({
          title: "Өгөгдлийн сан үүсгэгдлээ",
          description: "Жишээ аялалууд амжилттай үүсгэгдлээ.",
        })

        // Fetch the newly created tours
        const newSnapshot = await get(toursRef)
        if (newSnapshot.exists()) {
          const toursData = newSnapshot.val()
          const toursArray = Object.keys(toursData).map((key) => ({
            id: key,
            ...toursData[key],
          }))
          setTours(toursArray)
        }
      }
    } catch (err) {
      console.error("Error initializing database:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Өгөгдлийн санг үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Аялалууд</h2>
          <p className="text-gray-500 mt-1">Бүх аялалуудын жагсаалт болон удирдлага.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/admin/tours/new">
              <Plus className="mr-2 h-4 w-4" /> Шинэ аялал
            </Link>
          </Button>
          {tours.length === 0 && !loading && (
            <Button variant="outline" onClick={initializeDatabase}>
              Жишээ өгөгдөл үүсгэх
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Аялалууд</CardTitle>
              <CardDescription>Нийт {filteredTours.length} аялал байна.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                Шүүлтүүр
                <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
              </Button>
              <Button variant="outline" size="sm">
                Экспортлох
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isFilterOpen && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Аялал хайх..."
                    className="pl-8 border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                    <SelectValue placeholder="Бүх төрөл" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Бүх төрөл</SelectItem>
                    <SelectItem value="domestic">Дотоод</SelectItem>
                    <SelectItem value="international">Гадаад</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                    <SelectValue placeholder="Бүх төлөв" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Бүх төлөв</SelectItem>
                    <SelectItem value="active">Идэвхтэй</SelectItem>
                    <SelectItem value="inactive">Идэвхгүй</SelectItem>
                    <SelectItem value="draft">Ноорог</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700"
                onClick={() => window.location.reload()}
              >
                Дахин оролдох
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Аялалуудыг ачааллаж байна...</span>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Аялал олдсонгүй</h3>
              <p className="text-gray-500 mb-4">Одоогоор аялал бүртгэгдээгүй байна.</p>
              <Button asChild>
                <Link href="/admin/tours/new">
                  <Plus className="mr-2 h-4 w-4" /> Шинэ аялал үүсгэх
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Зураг</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Нэр</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Байршил</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Төрөл</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Үнэ</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Хугацаа</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Төлөв</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentTours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tour.id.substring(0, 6)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="h-10 w-10 rounded-md overflow-hidden shadow-sm">
                          <img
                            src={tour.image || "/placeholder.svg"}
                            alt={tour.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                        {tour.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {tour.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={`${
                            tour.category === "domestic"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          } border-none`}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {tour.category === "domestic" ? "Дотоод" : "Гадаад"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {tour.adultPrice.toLocaleString()}₮
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {tour.duration} өдөр
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 px-2 text-xs ${
                                tour.status === "active"
                                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                                  : tour.status === "inactive"
                                    ? "border-gray-300 text-gray-700 bg-gray-50"
                                    : "border-amber-500 text-amber-700 bg-amber-50"
                              }`}
                            >
                              {tour.status === "active"
                                ? "Идэвхтэй"
                                : tour.status === "inactive"
                                  ? "Идэвхгүй"
                                  : "Ноорог"}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(tour.id, "active")}>
                              Идэвхтэй
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(tour.id, "inactive")}>
                              Идэвхгүй
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(tour.id, "draft")}>
                              Ноорог
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Цэс</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tours/${tour.id}`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" /> Засах
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/tours/${tour.id}`} target="_blank" className="flex items-center">
                                <Globe className="mr-2 h-4 w-4" /> Харах
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteTour(tour.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Устгах
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {!loading && tours.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              Нийт {filteredTours.length} аялалаас {indexOfFirstTour + 1}-
              {Math.min(indexOfLastTour, filteredTours.length)} харуулж байна
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Аялалыг устгах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь аялалыг бүх өгөгдлийн сангаас бүрмөсөн устгах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTour} className="bg-red-600 hover:bg-red-700">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
