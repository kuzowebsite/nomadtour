"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { UserCircle, Mail, Lock, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const { user, login, loginGoogle, loginFacebook, isSocialLoginAvailable } = useAuth()
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

  const handleGoogleLogin = async () => {
    setError("")
    setSocialLoading("google")

    try {
      const result = await loginGoogle()

      if (result.redirecting) {
        // If we're redirecting, show a message
        setRedirecting(true)
        return
      }

      if (!result.success) {
        setError(result.error || "Google-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
      }
      // Successful login will trigger the useEffect above
    } catch (err: any) {
      console.error("Google login error:", err)
      setError("Google-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      if (!redirecting) {
        setSocialLoading(null)
      }
    }
  }

  const handleFacebookLogin = async () => {
    setError("")
    setSocialLoading("facebook")

    try {
      const result = await loginFacebook()

      if (result.redirecting) {
        // If we're redirecting, show a message
        setRedirecting(true)
        return
      }

      if (!result.success) {
        setError(result.error || "Facebook-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
      }
      // Successful login will trigger the useEffect above
    } catch (err: any) {
      console.error("Facebook login error:", err)
      setError("Facebook-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      if (!redirecting) {
        setSocialLoading(null)
      }
    }
  }

  if (redirecting) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Нэвтрэх хуудас руу шилжүүлж байна...</h2>
          <p className="text-gray-600">Түр хүлээнэ үү, таныг нэвтрүүлж байна.</p>
        </div>
      </div>
    )
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

        {error && error.includes("Firebase дээр бүртгэгдээгүй") && (
          <Alert variant="destructive" className="mb-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Хөгжүүлэгчид: Firebase консол дээр "Authentication" хэсэгт "Authorized domains" дотор энэ домэйнийг нэмнэ
              үү.
            </AlertDescription>
          </Alert>
        )}

        {!isSocialLoginAvailable && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-blue-700 text-sm">
              Хөгжүүлэлтийн орчинд нийгмийн сүлжээгээр нэвтрэх боломжгүй байна. И-мэйл, нууц үгээр нэвтэрнэ үү.
            </p>
          </div>
        )}

        {/* Social Login Buttons */}
        {isSocialLoginAvailable && (
          <>
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleLogin}
                disabled={loading || !!socialLoading}
              >
                {socialLoading === "google" ? (
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Google-ээр нэвтрэх</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                onClick={handleFacebookLogin}
                disabled={loading || !!socialLoading}
              >
                {socialLoading === "facebook" ? (
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="#1877F2"
                    />
                  </svg>
                )}
                <span>Facebook-ээр нэвтрэх</span>
              </Button>
            </div>

            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-gray-500 text-sm">эсвэл</span>
              </div>
            </div>
          </>
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

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !!socialLoading}>
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
