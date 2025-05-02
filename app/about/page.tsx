"use client"

import Link from "next/link"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Бидний тухай</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            NomadTour нь Монгол орны үзэсгэлэнт газрууд болон гадаад орнуудаар аялах боломжийг олгодог туршлагатай
            аяллын компани юм
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Бидний түүх</h2>
            <div className="space-y-4">
              <p>
                NomadTour компани нь 2010 онд үүсгэн байгуулагдсан бөгөөд Монгол орны үзэсгэлэнт газруудаар аялах
                хүсэлтэй гадаад, дотоодын жуулчдад үйлчлэх зорилгоор байгуулагдсан.
              </p>
              <p>
                Анх жилд 100 орчим жуулчинд үйлчилж байсан бол одоо жилд 5000 гаруй жуулчинд үйлчилдэг томоохон аяллын
                компани болон өргөжсөн. Бид Монгол орны үзэсгэлэнт газруудаар аялахаас гадна гадаад орнуудын онцлох
                чиглэлүүдээр аялах боломжийг олгодог.
              </p>
              <p>
                Манай компани нь мэргэжлийн хөтөч, орчуулагч, жолооч нартай бөгөөд тэд олон жилийн туршлагатай, гадаад
                хэлний өндөр мэдлэгтэй, аяллын чиглэлийн талаар гүнзгий мэдлэгтэй мэргэжилтнүүд юм.
              </p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img src="/about-company.png" alt="NomadTour компанийн түүх" className="w-full h-auto" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Бидний үнэт зүйлс</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="h-8 w-8 text-emerald-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Аюулгүй байдал</h3>
              <p className="text-gray-600">
                Бид аяллын үеийн аюулгүй байдлыг хамгийн чухалд тооцдог. Манай бүх тээврийн хэрэгсэл, тоног төхөөрөмж нь
                аюулгүй байдлын шаардлага хангасан.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="h-8 w-8 text-emerald-600"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Байгаль хамгаалал</h3>
              <p className="text-gray-600">
                Бид байгаль орчныг хамгаалах, тогтвортой аялал жуулчлалыг дэмжих зарчмыг баримталдаг. Аяллын үеэр
                байгальд ээлтэй үйл ажиллагааг дэмждэг.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="h-8 w-8 text-emerald-600"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" x2="9.01" y1="9" y2="9" />
                  <line x1="15" x2="15.01" y1="9" y2="9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Хэрэглэгчийн сэтгэл ханамж</h3>
              <p className="text-gray-600">
                Бид хэрэглэгчдийн хүсэл сонирхолд нийцсэн, чанартай үйлчилгээг үзүүлэхийг эрхэмлэдэг. Таны сэтгэл ханамж
                бидний амжилтын үндэс юм.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Манай баг</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-emerald-600 text-sm mb-2">{member.position}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <Tabs defaultValue="achievements">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="achievements">Амжилтууд</TabsTrigger>
              <TabsTrigger value="partners">Хамтрагч байгууллагууд</TabsTrigger>
              <TabsTrigger value="certificates">Гэрчилгээ, шагналууд</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
                  <p className="text-gray-600">Сэтгэл ханамжтай жуулчид</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
                  <p className="text-gray-600">Аяллын чиглэлүүд</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">13</div>
                  <p className="text-gray-600">Жилийн туршлага</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-lg">Онцлох амжилтууд:</h3>
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
                      className="h-5 w-5 mr-2 text-emerald-500"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>2018 онд "Шилдэг аяллын компани" шагнал</span>
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
                      className="h-5 w-5 mr-2 text-emerald-500"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>2020 онд "Байгальд ээлтэй аялал жуулчлал" шагнал</span>
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
                      className="h-5 w-5 mr-2 text-emerald-500"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>2022 онд "Хэрэглэгчийн сэтгэл ханамж өндөр" шагнал</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="partners" className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {partners.map((partner) => (
                  <div key={partner.id} className="text-center">
                    <div className="bg-gray-100 p-4 rounded-lg h-32 flex items-center justify-center mb-2">
                      <img
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        className="max-h-16 max-w-full"
                      />
                    </div>
                    <p className="font-medium">{partner.name}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border rounded-lg p-4">
                  <div className="bg-gray-100 p-4 rounded-lg h-48 flex items-center justify-center mb-4">
                    <img src="/certificate-1.png" alt="Аяллын компанийн гэрчилгээ" className="max-h-40 max-w-full" />
                  </div>
                  <h3 className="font-bold text-center">Аяллын компанийн гэрчилгээ</h3>
                  <p className="text-sm text-gray-600 text-center">2010 он</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="bg-gray-100 p-4 rounded-lg h-48 flex items-center justify-center mb-4">
                    <img src="/certificate-2.png" alt="ISO 9001:2015 гэрчилгээ" className="max-h-40 max-w-full" />
                  </div>
                  <h3 className="font-bold text-center">ISO 9001:2015 гэрчилгээ</h3>
                  <p className="text-sm text-gray-600 text-center">2018 он</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="bg-gray-100 p-4 rounded-lg h-48 flex items-center justify-center mb-4">
                    <img
                      src="/certificate-3.png"
                      alt="Байгальд ээлтэй аялал жуулчлалын гэрчилгээ"
                      className="max-h-40 max-w-full"
                    />
                  </div>
                  <h3 className="font-bold text-center">Байгальд ээлтэй аялал жуулчлалын гэрчилгээ</h3>
                  <p className="text-sm text-gray-600 text-center">2020 он</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-emerald-50 rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Хэрэглэгчдийн сэтгэгдэл</h2>
            <p className="text-gray-600">Манай үйлчилгээг ашигласан хэрэглэгчдийн сэтгэгдэл</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="font-medium">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={i < testimonial.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-400" : "text-gray-300"}`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">{testimonial.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Бидэнтэй хамт аялаарай</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Монгол орны үзэсгэлэнт газрууд болон гадаад орнуудын онцлох чиглэлүүдээр аялах боломжийг танд олгож байна
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/tours">Аялалууд үзэх</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Холбоо барих</Link>
            </Button>
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

const teamMembers = [
  {
    id: 1,
    name: "Батбаяр Д.",
    position: "Гүйцэтгэх захирал",
    description: "10 жилийн аяллын менежментийн туршлагатай. Олон улсын аялал жуулчлалын мэргэжилтэн.",
    image: "/team-member-1.png",
  },
  {
    id: 2,
    name: "Оюунчимэг Б.",
    position: "Аяллын менежер",
    description: "7 жилийн аяллын зохион байгуулалтын туршлагатай. Англи, Орос, Хятад хэлтэй.",
    image: "/team-member-2.png",
  },
  {
    id: 3,
    name: "Ганбаатар Т.",
    position: "Ахлах хөтөч",
    description: "12 жилийн хөтчийн туршлагатай. Монголын түүх, соёлын мэргэжилтэн.",
    image: "/team-member-3.png",
  },
  {
    id: 4,
    name: "Сарангэрэл Ч.",
    position: "Маркетингийн менежер",
    description: "5 жилийн маркетингийн туршлагатай. Олон улсын маркетингийн мэргэжилтэн.",
    image: "/team-member-4.png",
  },
]

const partners = [
  {
    id: 1,
    name: "Монгол Аялал Жуулчлалын Холбоо",
    logo: "/partner-1.png",
  },
  {
    id: 2,
    name: "MIAT Монгол Агаарын Тээвэр",
    logo: "/partner-2.png",
  },
  {
    id: 3,
    name: "Shangri-La Улаанбаатар",
    logo: "/partner-3.png",
  },
  {
    id: 4,
    name: "Хүннү Аялал",
    logo: "/partner-4.png",
  },
  {
    id: 5,
    name: "Байгаль Хамгаалах Сан",
    logo: "/partner-5.png",
  },
  {
    id: 6,
    name: "Монголын Зочид Буудлын Холбоо",
    logo: "/partner-6.png",
  },
  {
    id: 7,
    name: "Аялал Жуулчлалын Яам",
    logo: "/partner-7.png",
  },
  {
    id: 8,
    name: "Дэлхийн Аялал Жуулчлалын Байгууллага",
    logo: "/partner-8.png",
  },
]

const testimonials = [
  {
    id: 1,
    name: "Болд Б.",
    location: "Улаанбаатар",
    rating: 5,
    comment: "Маш гайхалтай аялал байлаа. Хөтөч маш мэдлэгтэй, үйлчилгээ сайтай байсан. Заавал дахин аялах болно.",
  },
  {
    id: 2,
    name: "Сараа Д.",
    location: "Дархан",
    rating: 4,
    comment:
      "Байгаль үзэсгэлэнтэй, аялал сайхан болсон. Зарим газар бэлтгэл сайнгүй байсан ч ерөнхийдөө сэтгэл ханамжтай.",
  },
  {
    id: 3,
    name: "Бат-Эрдэнэ Г.",
    location: "Эрдэнэт",
    rating: 5,
    comment:
      "Гэр бүлээрээ аялсан, хүүхдүүд маш их таалсан. Хоол хүнс амттай, байр тухтай байсан. Заавал бусдад санал болгоно.",
  },
]
