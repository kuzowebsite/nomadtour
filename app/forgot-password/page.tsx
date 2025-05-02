"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"
import { resetPassword } from "@/lib/auth"
import { useAuth } from "@/context/auth-context"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/")
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailError("")
    setGeneralError("")
  }

  const validateForm = () => {
    let isValid = true

    if (!email) {
      setEmailError("И-мэйл хаяг оруулна уу")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Зөв и-мэйл хаяг оруулна уу")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setGeneralError("")

    try {
      const result = await resetPassword(email)

      if (result.success) {
        setIsSuccess(true)
      } else {
        setGeneralError(result.error || "Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа")
      }
    } catch (error) {
      console.error("Password reset failed:", error)
      setGeneralError("Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="NomadTour Logo"
                  width={50}
                  height={50}
                  className="mr-2"
                />
                <span className="text-2xl font-bold text-blue-600">NomadTour</span>
              </div>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Нууц үг сэргээх</h1>
            <p className="mt-2 text-gray-600">
              {isSuccess ? "Нууц үг сэргээх заавар илгээгдлээ" : "Нууц үгээ мартсан бол и-мэйл хаягаа оруулна уу"}
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{generalError}</div>
            )}

            {isSuccess ? (
              <div className="text-center">
                <div className="mb-6 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нууц үг сэргээх заавар илгээгдлээ</h3>
                <p className="text-gray-600 mb-6">
                  Таны <span className="font-medium">{email}</span> хаяг руу нууц үг сэргээх заавар илгээгдлээ. И-мэйлээ
                  шалгаад, заавар дагаж нууц үгээ шинэчилнэ үү.
                </p>
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      Нэвтрэх хуудас руу буцах <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                    }}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Өөр и-мэйл оруулах
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    И-мэйл хаяг
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        emailError ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="tanii@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Илгээж байна...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Нууц үг сэргээх <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Нэвтрэх хуудас руу буцах
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} NomadTour. Бүх эрх хуулиар хамгаалагдсан.</p>
      </div>
    </div>
  )
}
