"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { UserCircle, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl") || "/profile"

  useEffect(() => {
    // If user is already logged in, redirect to return URL
    if (user) {
      router.push(returnUrl)
    }
  }, [user, router, returnUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate inputs before sending to Firebase
      if (!email.trim()) {
        setError("И-мэйл хаягаа оруулна уу")
        setLoading(false)
        return
      }

      if (!password) {
        setError("Нууц үгээ оруулна уу")
        setLoading(false)
        return
      }

      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
      }
      // Successful login will trigger the useEffect above
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex justify-center mb-6">
          <UserCircle className="h-16 w-16 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Нэвтрэх</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">И-мэйл</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="таны@имэйл.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Нууц үг</Label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Нууц үгээ мартсан?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Бүртгэлгүй юу?{" "}
            <Link
              href={`/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
              className="text-blue-600 hover:underline font-medium"
            >
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
