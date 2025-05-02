"use client"

import Link from "next/link"
import { Globe, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-600">NomadTour</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/tours" className="text-sm font-medium hover:text-emerald-600">
              Аялалууд
            </Link>
            <Link href="/destinations" className="text-sm font-medium text-emerald-600">
              Чиглэлүүд
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-emerald-600">
              Бидний тухай
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-emerald-600">
              Холбоо барих
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Нэвтрэх
            </Button>
            <Button size="sm" className="hidden md:flex">
              Бүртгүүлэх
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <span className="sr-only">Цэс</span>
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
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Аяллын чиглэлүүд</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Монгол орны үзэсгэлэнт газрууд болон гадаад орнуудын онцлох чиглэлүүдээр аялах боломжийг танд олгож байна
          </p>
        </div>

        <Tabs defaultValue="domestic" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="domestic">Дотоод чиглэлүүд</TabsTrigger>
            <TabsTrigger value="international">Гадаад чиглэлүүд</TabsTrigger>
          </TabsList>

          <TabsContent value="domestic">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {domesticDestinations.map((destination) => (
                <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{destination.region}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 text-sm">{destination.description}</p>
                    <div className="mt-3">
                      <div className="text-sm font-medium">Онцлох үзмэрүүд:</div>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {destination.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-emerald-500 mr-2">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/tours?locations=${encodeURIComponent(destination.name)}`}>Аялалууд үзэх</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Монгол орны бүс нутгууд</h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="/mongolia-map.png" alt="Монгол орны газрын зураг" className="w-full h-auto" />
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Хангайн бүс</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хөвсгөл нуур</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Булган</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Орхон хөндий</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хархорин</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Говийн бүс</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Баянзаг</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хонгорын элс</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Ёлын ам</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хэрмэн цав</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Төвийн бүс</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Тэрэлж</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хустай</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Мандалговь</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Богд хан уул</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Баруун бүс</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Алтай нуруу</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Увс нуур</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хяргас нуур</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Ховд</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="international">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {internationalDestinations.map((destination) => (
                <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-1" />
                        <span>{destination.region}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 text-sm">{destination.description}</p>
                    <div className="mt-3">
                      <div className="text-sm font-medium">Онцлох үзмэрүүд:</div>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {destination.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-emerald-500 mr-2">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/tours?locations=${encodeURIComponent(destination.name)}`}>Аялалууд үзэх</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Гадаад орнуудын бүс нутгууд</h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img src="/world-map.png" alt="Дэлхийн газрын зураг" className="w-full h-auto" />
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Зүүн Ази</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Япон</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Солонгос</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Хятад</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Тайвань</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Зүүн Өмнөд Ази</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Тайланд</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Вьетнам</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Сингапур</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Индонез</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Европ</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Франц</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Итали</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Испани</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Герман</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Америк</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>АНУ</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Канад</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Мексик</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span>Бразил</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-emerald-50 rounded-lg p-8 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Тусгай аяллууд</h2>
            <p className="text-gray-600">Онцгой үйл явдал, баяр ёслолд зориулсан тусгай аяллууд</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle>Наадам фестивал</CardTitle>
                <CardDescription>7 сарын 11-13</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Монголын үндэсний баяр наадмыг үзэх, морь уралдаан, бөх барилдаан, сур харвааны тэмцээнүүдэд оролцох
                  боломжтой.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Дэлгэрэнгүй
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle>Сакура цэцэглэх үе</CardTitle>
                <CardDescription>3-4 сар</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Японы сакура цэцэглэх үеэр Токио, Киото, Осака хотуудаар аялж, сакурагийн баярт оролцох боломжтой.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Дэлгэрэнгүй
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle>Шинэ жилийн баяр</CardTitle>
                <CardDescription>12 сарын 25 - 1 сарын 5</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Шинэ жилийн баярыг дулаан орнуудад тэмдэглэх аялал. Тайланд, Сингапур, Бали зэрэг газруудаар аялах
                  боломжтой.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Дэлгэрэнгүй
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-6 w-6 text-emerald-400" />
                <span className="text-xl font-bold text-emerald-400">NomadTour</span>
              </div>
              <p className="text-gray-400 mb-4">Монгол орны үзэсгэлэнт газруудаар аялах хамгийн шилдэг сонголт</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
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
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
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
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
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
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Аялалууд</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Хангай нуруу
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Говь цөл
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Хөвсгөл нуур
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Алтай нуруу
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Тэрэлж
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Тусламж</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Түгээмэл асуултууд
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Аяллын нөхцөл
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Хөтөч
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Аюулгүй байдал
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Холбоо барих
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Холбоо барих</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
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
                    className="h-5 w-5 mr-2 text-gray-400"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-gray-400">+976 9911-2233</span>
                </li>
                <li className="flex items-start">
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
                    className="h-5 w-5 mr-2 text-gray-400"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-gray-400">info@nomadtour.mn</span>
                </li>
                <li className="flex items-start">
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
                    className="h-5 w-5 mr-2 text-gray-400"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400">Улаанбаатар хот, Сүхбаатар дүүрэг</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NomadTour. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const domesticDestinations = [
  {
    id: 1,
    name: "Хөвсгөл нуур",
    region: "Хөвсгөл аймаг",
    description: "Монголын хамгийн том цэнгэг усны нуур, үзэсгэлэнт байгаль, цэвэр агаар",
    image: "/khovsgol-tranquility.png",
    highlights: ["Хөвсгөл нуур", "Хатгал тосгон", "Дархадын хотгор", "Цаатан иргэд"],
  },
  {
    id: 2,
    name: "Говь цөл",
    region: "Өмнөговь аймаг",
    description: "Говийн үзэсгэлэнт газрууд, Хонгорын элс, Баянзаг, Ёлын ам",
    image: "/gobi-desert-landscape.png",
    highlights: ["Хонгорын элс", "Баянзаг (Улаан хад)", "Ёлын ам", "Хэрмэн цав"],
  },
  {
    id: 3,
    name: "Тэрэлж",
    region: "Төв аймаг",
    description: "Улаанбаатар хотоос ойрхон, үзэсгэлэнт байгаль, амралт, зугаалга",
    image: "/terelj-valley-landscape.png",
    highlights: ["Мэлхий хад", "Их Өвгөн хад", "Ариун Гандан хийд", "Чингисийн хөшөө"],
  },
  {
    id: 4,
    name: "Хархорин",
    region: "Өвөрхангай аймаг",
    description: "Монголын эртний нийслэл, Эрдэнэзуу хийд, түүхэн дурсгалт газрууд",
    image: "/karakorum-landscape.png",
    highlights: ["Эрдэнэзуу хийд", "Хархорин музей", "Орхон хөндий", "Хөшөө цайдам"],
  },
  {
    id: 5,
    name: "Алтай нуруу",
    region: "Баян-Өлгий аймаг",
    description: "Монголын хамгийн өндөр уулс, бүргэдчид, казах соёл",
    image: "/altai-vastness.png",
    highlights: ["Таван богд уул", "Потанины мөсөн гол", "Бүргэдчид", "Казах соёл"],
  },
  {
    id: 6,
    name: "Хустайн нуруу",
    region: "Төв аймаг",
    description: "Тахь адуу, байгалийн цогцолбор газар, амьтан ургамал",
    image: "/hustai-wildhorses.png",
    highlights: ["Тахь адуу", "Байгалийн цогцолбор газар", "Ховор амьтад", "Ургамлын аймаг"],
  },
]

const internationalDestinations = [
  {
    id: 1,
    name: "Тайланд",
    region: "Зүүн Өмнөд Ази",
    description: "Тайландын үзэсгэлэнт далайн эрэг, амралт, зугаалга",
    image: "/thailand-beach.png",
    highlights: ["Пхукет арал", "Бангкок хот", "Чианг Май", "Паттая"],
  },
  {
    id: 2,
    name: "Япон",
    region: "Зүүн Ази",
    description: "Японы сакура цэцэглэх үеийн үзэсгэлэнт байгаль, соёл",
    image: "/japan-sakura.png",
    highlights: ["Токио хот", "Киото", "Фүжи уул", "Осака"],
  },
  {
    id: 3,
    name: "Солонгос",
    region: "Зүүн Ази",
    description: "Солонгосын түүх, соёл, хоол, K-pop",
    image: "/korea-culture.png",
    highlights: ["Сөүл хот", "Пусан", "Жежү арал", "Кёнжү"],
  },
  {
    id: 4,
    name: "Хятад",
    region: "Зүүн Ази",
    description: "Хятадын Их Хэрэм, Бээжин хот, түүхэн дурсгалт газрууд",
    image: "/china-great-wall.png",
    highlights: ["Их Хэрэм", "Бээжин хот", "Шанхай", "Шиань"],
  },
  {
    id: 5,
    name: "Сингапур",
    region: "Зүүн Өмнөд Ази",
    description: "Сингапурын орчин үеийн архитектур, технологи, амралт",
    image: "/singapore-city.png",
    highlights: ["Марина Бэй Сэндс", "Гарденс бай зэ Бэй", "Сентоса арал", "Юниверсал Студио"],
  },
  {
    id: 6,
    name: "Франц",
    region: "Европ",
    description: "Францын соёл, урлаг, архитектур, хоол",
    image: "/france-eiffel.png",
    highlights: ["Парис хот", "Эйфелийн цамхаг", "Лувр музей", "Версалийн ордон"],
  },
]
