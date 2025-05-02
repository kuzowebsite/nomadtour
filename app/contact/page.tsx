"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Globe, Mail, MapPin, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactMethod: "email",
    inquiryType: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contactMethod: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally send the form data to your backend
    console.log("Form submitted:", formData)

    toast({
      title: "Амжилттай илгээгдлээ",
      description: "Таны хүсэлтийг хүлээн авлаа. Удахгүй тантай холбогдох болно.",
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      contactMethod: "email",
      inquiryType: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Холбоо барих</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Та бидэнтэй холбогдож, аяллын талаар асууж, санал хүсэлтээ илгээх боломжтой
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Хаяг</h3>
              <p className="text-gray-600">
                Улаанбаатар хот, Сүхбаатар дүүрэг,
                <br />
                8-р хороо, Бага тойруу 14,
                <br />
                NomadTour оффис, 301 тоот
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Утас</h3>
              <p className="text-gray-600">
                +976 9911-2233
                <br />
                +976 7711-2233
                <br />
                +976 11-312233
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">И-мэйл</h3>
              <p className="text-gray-600">
                info@nomadtour.mn
                <br />
                booking@nomadtour.mn
                <br />
                support@nomadtour.mn
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">Бидэнтэй холбогдох</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Нэр</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Таны нэр"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">И-мэйл</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Таны и-мэйл"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Утасны дугаар</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Таны утасны дугаар"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiryType">Асуултын төрөл</Label>
                  <Select
                    value={formData.inquiryType}
                    onValueChange={(value) => handleSelectChange("inquiryType", value)}
                  >
                    <SelectTrigger id="inquiryType">
                      <SelectValue placeholder="Сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tour">Аяллын талаар</SelectItem>
                      <SelectItem value="booking">Захиалгын талаар</SelectItem>
                      <SelectItem value="price">Үнийн талаар</SelectItem>
                      <SelectItem value="other">Бусад</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Гарчиг</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Таны асуултын гарчиг"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Мессеж</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Таны асуулт эсвэл санал хүсэлт"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Холбогдох арга</Label>
                <RadioGroup value={formData.contactMethod} onValueChange={handleRadioChange} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-method" />
                    <Label htmlFor="email-method">И-мэйл</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone-method" />
                    <Label htmlFor="phone-method">Утас</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both-method" />
                    <Label htmlFor="both-method">Аль аль нь</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full">
                Илгээх
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Байршил</h2>
            <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.7631953545006!2d106.91716937673591!3d47.91857697121198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96ed3ac0f79c75%3A0x8c0a6dbb55c4b89f!2sSukhbaatar%20Square!5e0!3m2!1sen!2sus!4v1682345678901!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Ажлын цаг</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Даваа - Баасан:</div>
                  <div className="font-medium">09:00 - 18:00</div>
                  <div className="text-gray-600">Бямба:</div>
                  <div className="font-medium">10:00 - 16:00</div>
                  <div className="text-gray-600">Ням:</div>
                  <div className="font-medium">Амарна</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Түгээмэл асуултууд</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold mb-2">Аяллын урьдчилгаа төлбөр хэд вэ?</h4>
                  <p className="text-gray-600 text-sm">
                    Аяллын нийт үнийн 30%-ийг урьдчилгаа болгон төлнө. Үлдэгдэл төлбөрийг аялал эхлэхээс 7 хоногийн өмнө
                    төлж дуусгана.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold mb-2">Аялал цуцлах тохиолдолд төлбөр буцаах уу?</h4>
                  <p className="text-gray-600 text-sm">
                    Аялал эхлэхээс 30 хоногийн өмнө цуцалбал 100%, 15-30 хоногийн өмнө цуцалбал 50%, 7-14 хоногийн өмнө
                    цуцалбал 25% буцаана. 7 хоногоос бага хугацаанд цуцалбал төлбөр буцаахгүй.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold mb-2">Аяллын хөтөч ямар хэл дээр ярьдаг вэ?</h4>
                  <p className="text-gray-600 text-sm">
                    Манай хөтчүүд Монгол, Англи, Орос, Хятад, Япон, Солонгос хэлээр үйлчилдэг. Аялал захиалах үед таны
                    хэлний хэрэгцээг урьдчилан мэдэгдэхэд бид тохирох хөтөчийг томилох болно.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Бидэнтэй холбогдох бусад арга</h2>
            <p className="text-gray-600">Та доорх сошиал медиа сувгуудаар бидэнтэй холбогдох боломжтой</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <a href="#" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
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
                  className="h-6 w-6 text-blue-600"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">Facebook</h3>
              <p className="text-gray-600 text-sm">@nomadtourmongolia</p>
            </a>

            <a href="#" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
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
                  className="h-6 w-6 text-pink-600"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">Instagram</h3>
              <p className="text-gray-600 text-sm">@nomadtour_mongolia</p>
            </a>

            <a href="#" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
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
                  className="h-6 w-6 text-blue-400"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">Twitter</h3>
              <p className="text-gray-600 text-sm">@nomadtour_mn</p>
            </a>

            <a href="#" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
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
                  className="h-6 w-6 text-red-600"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">YouTube</h3>
              <p className="text-gray-600 text-sm">NomadTour Mongolia</p>
            </a>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Асуултаа илгээгээрэй</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Та аяллын талаар асуух зүйл байвал бидэнтэй холбогдоорой. Бид таны асуултанд хариулахад таатай байх болно.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/tours">Аялалууд үзэх</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.scrollTo(0, 0)}>
              Холбоо барих
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-16">
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
