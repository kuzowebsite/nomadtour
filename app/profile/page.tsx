"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  Calendar,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Home,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { logoutUser, changePassword } from "@/lib/auth"
import { getDatabase, ref, onValue, query, orderByChild, limitToLast, set } from "firebase/database"
import ProfileImageUpload from "@/components/profile-image-upload"
import CancelBookingDialog from "@/components/cancel-booking-dialog"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  const { user, userData, isLoading, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [savedTours, setSavedTours] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [savedToursLoading, setSavedToursLoading] = useState(true)
  const [profileSuccess, setProfileSuccess] = useState("")

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const fetchBookings = () => {
    if (user?.uid) {
      // Fetch recent bookings
      const db = getDatabase()
      const bookingsRef = query(ref(db, `bookings`), orderByChild("userId"), limitToLast(50))

      const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
        const bookings: any[] = []
        snapshot.forEach((childSnapshot) => {
          const booking = childSnapshot.val()
          if (booking.userId === user.uid) {
            bookings.push({
              id: childSnapshot.key,
              ...booking,
            })
          }
        })
        setRecentBookings(bookings.reverse())
        setBookingsLoading(false)
      })

      return unsubscribeBookings
    }
  }

  useEffect(() => {
    if (user?.uid) {
      // Fetch bookings
      const unsubscribeBookings = fetchBookings()

      // Fetch saved tours
      const db = getDatabase()
      const savedToursRef = ref(db, `users/${user.uid}/savedTours`)
      const unsubscribeSavedTours = onValue(savedToursRef, (snapshot) => {
        const savedToursData = snapshot.val()
        if (savedToursData) {
          // Convert object to array
          const toursArray = Object.keys(savedToursData).map((key) => ({
            id: key,
            ...savedToursData[key],
          }))
          setSavedTours(toursArray)
        } else {
          setSavedTours([])
        }
        setSavedToursLoading(false)
      })

      return () => {
        if (unsubscribeBookings) unsubscribeBookings()
        unsubscribeSavedTours()
      }
    }
  }, [user])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset messages
    setPasswordError("")
    setPasswordSuccess("")

    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Одоогийн нууц үгээ оруулна уу")
      return
    }

    if (!newPassword) {
      setPasswordError("Шинэ нууц үгээ оруулна уу")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Шинэ нууц үг таарахгүй байна")
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await changePassword(currentPassword, newPassword)

      if (result.success) {
        setPasswordSuccess("Нууц үг амжилттай солигдлоо")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordError(result.error || "Нууц үг солиход алдаа гарлаа")
      }
    } catch (error: any) {
      console.error("Password change error:", error)
      setPasswordError("Нууц үг солиход алдаа гарлаа")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleProfileImageUpdate = (imageUrl: string) => {
    if (user?.uid && userData) {
      const db = getDatabase()
      const userRef = ref(db, `users/${user.uid}`)

      // Update user data with profile image URL
      set(userRef, {
        ...userData,
        profileImageUrl: imageUrl,
      })
        .then(() => {
          setProfileSuccess("Профайл зураг амжилттай шинэчлэгдлээ")
          // Clear success message after 3 seconds
          setTimeout(() => {
            setProfileSuccess("")
          }, 3000)
        })
        .catch((error) => {
          console.error("Error updating profile image:", error)
        })
    }
  }

  const handleBookingCancelled = () => {
    // Refresh bookings
    fetchBookings()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"

    // Try to create a valid date object
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    return new Intl.DateTimeFormat("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Баталгаажсан"
      case "pending":
        return "Хүлээгдэж буй"
      case "cancelled":
        return "Цуцлагдсан"
      case "completed":
        return "Дууссан"
      default:
        return "Тодорхойгүй"
    }
  }

  // Check if a booking can be cancelled
  const canCancelBooking = (booking: any) => {
    // Can't cancel if already cancelled or completed
    if (booking.status === "cancelled" || booking.status === "completed") {
      return false
    }

    // Can cancel if not paid yet
    if (booking.paymentStatus !== "paid") {
      return true
    }

    // If paid, check if the tour date is in the future and at least 3 days away
    const tourDate = new Date(booking.date)
    const today = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(today.getDate() + 3)

    return tourDate > threeDaysFromNow
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Profile */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                  {userData?.profileImageUrl ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={userData.profileImageUrl || "/placeholder.svg"}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-500" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-gray-500 text-sm">{userData?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Нүүр хуудас
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  Хянах самбар
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "bookings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Захиалгууд
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "saved" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Heart className="mr-3 h-5 w-5" />
                  Хадгалсан аялалууд
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "settings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Тохиргоо
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Гарах
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Сайн байна уу, {userData?.firstName}!</h1>
                  <p className="text-gray-600">
                    Таны хянах самбарт тавтай морил. Энд та өөрийн захиалга болон хадгалсан аялалуудаа харах боломжтой.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 mr-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Нийт захиалга</p>
                        <p className="text-2xl font-bold text-gray-800">{recentBookings.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 mr-4">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Зарцуулсан мөнгө</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {recentBookings
                            .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
                            .toLocaleString()}
                          ₮
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 mr-4">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Хадгалсан аялал</p>
                        <p className="text-2xl font-bold text-gray-800">{savedTours.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Сүүлийн захиалгууд</h2>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Бүгдийг харах
                    </button>
                  </div>

                  {bookingsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recentBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Аялал
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Огноо
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Үнэ
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Төлөв
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentBookings.slice(0, 3).map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  href={`/bookings/${booking.id}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {booking.tourName || booking.tourTitle || "Аялал"}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(booking.bookingDate || booking.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(booking.totalAmount || booking.totalPrice)?.toLocaleString()}₮
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                                >
                                  {getStatusText(booking.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Танд одоогоор захиалга байхгүй байна.</p>
                      <Link href="/tours" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                        Аялалуудыг үзэх
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Миний захиалгууд</h2>

                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : recentBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Аялал
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Огноо
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Үнэ
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Төлөв
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Үйлдэл
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/bookings/${booking.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {booking.tourName || booking.tourTitle || "Аялал"}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(booking.bookingDate || booking.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(booking.totalAmount || booking.totalPrice)?.toLocaleString()}₮
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                              >
                                {getStatusText(booking.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-2">
                                <Link href={`/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-800">
                                  Дэлгэрэнгүй
                                </Link>
                                {canCancelBooking(booking) && (
                                  <CancelBookingDialog
                                    bookingId={booking.id}
                                    userId={user.uid}
                                    isPaid={booking.paymentStatus === "paid"}
                                    onCancelled={handleBookingCancelled}
                                  >
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Цуцлах
                                    </Button>
                                  </CancelBookingDialog>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Танд одоогоор захиалга байхгүй байна.</p>
                    <Link href="/tours" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                      Аялалуудыг үзэх
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Saved Tours Tab */}
            {activeTab === "saved" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Хадгалсан аялалууд</h2>

                {savedToursLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : savedTours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedTours.map((tour) => (
                      <div
                        key={tour.id}
                        className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={tour.imageUrl || "/placeholder.svg?height=200&width=400"}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              // Remove from saved tours
                              const db = getDatabase()
                              const savedTourRef = ref(db, `users/${user?.uid}/savedTours/${tour.id}`)
                              set(savedTourRef, null)
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50"
                          >
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{tour.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{tour.duration} өдөр</p>
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-lg">{tour.price?.toLocaleString()}₮</p>
                            <Link href={`/tours/${tour.id}`} className="text-blue-600 hover:text-blue-800">
                              Дэлгэрэнгүй
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Танд одоогоор хадгалсан аялал байхгүй байна.</p>
                    <Link href="/tours" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                      Аялалуудыг үзэх
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Хувийн мэдээлэл</h2>

                {profileSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{profileSuccess}</p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Профайл зураг</h3>
                  <ProfileImageUpload
                    userId={user?.uid || ""}
                    currentImageUrl={userData?.profileImageUrl || null}
                    onImageUploaded={handleProfileImageUpdate}
                  />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const firstName = formData.get("firstName") as string
                    const lastName = formData.get("lastName") as string
                    const phone = formData.get("phone") as string

                    if (user?.uid && userData) {
                      const db = getDatabase()
                      const userRef = ref(db, `users/${user.uid}`)

                      // Update only the fields that can be changed
                      set(userRef, {
                        ...userData,
                        firstName,
                        lastName,
                        phone,
                      })
                        .then(() => {
                          setProfileSuccess("Мэдээлэл амжилттай шинэчлэгдлээ")
                          // Clear success message after 3 seconds
                          setTimeout(() => {
                            setProfileSuccess("")
                          }, 3000)
                        })
                        .catch((error) => {
                          console.error("Error updating profile:", error)
                          alert("Алдаа гарлаа: " + error.message)
                        })
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Нэр
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        defaultValue={userData?.firstName || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Овог
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        defaultValue={userData?.lastName || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      И-мэйл
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={userData?.email || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">И-мэйл хаягийг өөрчлөх боломжгүй</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Утасны дугаар
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      defaultValue={userData?.phone || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Хадгалах
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Нууц үг солих</h3>

                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{passwordSuccess}</p>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Одоогийн нууц үг
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Шинэ нууц үг
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Хамгийн багадаа 6 тэмдэгт байх ёстой</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Шинэ нууц үгээ давтах
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Солиж байна...
                          </div>
                        ) : (
                          "Нууц үг солих"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
