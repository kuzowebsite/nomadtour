"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ref, get, remove } from "firebase/database"
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
  Route,
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

// Route type definition
interface RouteStop {
  name: string
  description: string
  duration: number // hours at this stop
}

interface TourRoute {
  id: string
  name: string
  type: "domestic" | "international"
  description: string
  stops: RouteStop[]
  totalDuration: number // days
  status: "active" | "inactive" | "draft"
  createdAt: string
  updatedAt: string
}

export default function AdminRoutes() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [routes, setRoutes] = useState<TourRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const routesPerPage = 5

  // Fetch routes from Firebase
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true)
      try {
        const routesRef = ref(database, "routes")
        const snapshot = await get(routesRef)

        if (snapshot.exists()) {
          const routesData = snapshot.val()
          const routesArray = Object.keys(routesData).map((key) => ({
            id: key,
            ...routesData[key],
          }))
          setRoutes(routesArray)
        } else {
          setRoutes([])
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching routes:", err)
        setError("Маршрутуудыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
        setRoutes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [])

  // Filter routes based on search query and filters
  const filteredRoutes = routes.filter((route) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply type filter
    const matchesType = typeFilter === "all" || route.type === typeFilter

    // Apply status filter
    const matchesStatus = statusFilter === "all" || route.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination
  const indexOfLastRoute = currentPage * routesPerPage
  const indexOfFirstRoute = indexOfLastRoute - routesPerPage
  const currentRoutes = filteredRoutes.slice(indexOfFirstRoute, indexOfLastRoute)
  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage)

  // Handle route deletion
  const confirmDeleteRoute = (id: string) => {
    setRouteToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return

    try {
      await remove(ref(database, `routes/${routeToDelete}`))

      setRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== routeToDelete))

      toast({
        title: "Маршрут устгагдлаа",
        description: `Маршрут амжилттай устгагдлаа.`,
      })
    } catch (err) {
      console.error("Error deleting route:", err)
      toast({
        title: "Алдаа гарлаа",
        description: "Маршрутыг устгахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setRouteToDelete(null)
    }
  }

  // Initialize database with sample data
  const initializeDatabase = async () => {
    try {
      setLoading(true)
      const routesRef = ref(database, "routes")
      const snapshot = await get(routesRef)

      if (!snapshot.exists()) {
        // Sample data
        const sampleRoutes = {
          route1: {
            name: "Хөвсгөл нуур - Хатгал - Жанхай",
            type: "domestic",
            description: "Хөвсгөл нуурын эргийн дагуух аялал",
            stops: [
              {
                name: "Мөрөн",
                description: "Хөвсгөл аймгийн төв",
                duration: 3,
              },
              {
                name: "Хатгал",
                description: "Хөвсгөл нуурын эрэг дэх тосгон",
                duration: 24,
              },
              {
                name: "Жанхай",
                description: "Хөвсгөл нуурын баруун эрэг",
                duration: 12,
              },
            ],
            totalDuration: 5,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          route2: {
            name: "Улаанбаатар - Хархорин - Өвөрхангай",
            type: "domestic",
            description: "Монголын түүхэн газруудаар аялах",
            stops: [
              {
                name: "Улаанбаатар",
                description: "Монгол улсын нийслэл",
                duration: 2,
              },
              {
                name: "Хархорин",
                description: "Монголын эртний нийслэл",
                duration: 12,
              },
              {
                name: "Эрдэнэзуу хийд",
                description: "Түүхэн дурсгалт газар",
                duration: 6,
              },
              {
                name: "Хужирт",
                description: "Рашаан сувилал",
                duration: 8,
              },
            ],
            totalDuration: 4,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          route3: {
            name: "Токио - Киото - Осака",
            type: "international",
            description: "Японы алдартай хотуудаар аялах",
            stops: [
              {
                name: "Токио",
                description: "Японы нийслэл",
                duration: 24,
              },
              {
                name: "Киото",
                description: "Японы хуучин нийслэл",
                duration: 24,
              },
              {
                name: "Осака",
                description: "Японы томоохон хот",
                duration: 24,
              },
            ],
            totalDuration: 7,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }

        // Set sample data in Firebase
        await fetch("/api/initialize-routes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ routes: sampleRoutes }),
        })

        toast({
          title: "Өгөгдлийн сан үүсгэгдлээ",
          description: "Жишээ маршрутууд амжилттай үүсгэгдлээ.",
        })

        // Fetch the newly created routes
        const newSnapshot = await get(routesRef)
        if (newSnapshot.exists()) {
          const routesData = newSnapshot.val()
          const routesArray = Object.keys(routesData).map((key) => ({
            id: key,
            ...routesData[key],
          }))
          setRoutes(routesArray)
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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Маршрутууд</h2>
          <p className="text-gray-500 mt-1">Аялалын маршрутуудын жагсаалт болон удирдлага.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/admin/routes/new">
              <Plus className="mr-2 h-4 w-4" /> Шинэ маршрут
            </Link>
          </Button>
          {routes.length === 0 && !loading && (
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
              <CardTitle className="text-xl font-bold text-gray-900">Маршрутууд</CardTitle>
              <CardDescription>Нийт {filteredRoutes.length} маршрут байна.</CardDescription>
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
                    placeholder="Маршрут хайх..."
                    className="pl-8 border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <span className="ml-2 text-gray-600">Маршрутуудыг ачааллаж байна...</span>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Route className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Маршрут олдсонгүй</h3>
              <p className="text-gray-500 mb-4">Одоогоор маршрут бүртгэгдээгүй байна.</p>
              <Button asChild>
                <Link href="/admin/routes/new">
                  <Plus className="mr-2 h-4 w-4" /> Шинэ маршрут үүсгэх
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Нэр</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Төрөл</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Зогсоолууд</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Хугацаа</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Төлөв</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Үүсгэсэн</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.id.substring(0, 6)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                        {route.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={`${
                            route.type === "domestic"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          } border-none`}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {route.type === "domestic" ? "Дотоод" : "Гадаад"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {route.stops?.length || 0} зогсоол
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {route.totalDuration} өдөр
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={`${
                            route.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : route.status === "inactive"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          } border-none`}
                        >
                          {route.status === "active" ? "Идэвхтэй" : route.status === "inactive" ? "Идэвхгүй" : "Ноорог"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(route.createdAt).toLocaleDateString("mn-MN")}
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
                              <Link href={`/admin/routes/${route.id}`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" /> Засах
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteRoute(route.id)}>
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
        {!loading && routes.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              Нийт {filteredRoutes.length} маршрутаас {indexOfFirstRoute + 1}-
              {Math.min(indexOfLastRoute, filteredRoutes.length)} харуулж байна
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
            <AlertDialogTitle>Маршрутыг устгах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь маршрутыг бүх өгөгдлийн сангаас бүрмөсөн устгах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoute} className="bg-red-600 hover:bg-red-700">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
