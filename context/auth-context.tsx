"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  onAuthStateChange,
  loginWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  logoutUser,
  resetPassword,
  register as firebaseRegister,
  getUserData,
  checkRedirectResult,
  isSocialLoginAvailable,
} from "@/lib/auth"
import type { User } from "firebase/auth"

type UserData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  createdAt: string
  authProvider?: string
  photoURL?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSocialLoginAvailable: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginGoogle: () => Promise<{ success: boolean; error?: string; redirecting?: boolean; unauthorizedDomain?: boolean }>
  loginFacebook: () => Promise<{
    success: boolean
    error?: string
    redirecting?: boolean
    unauthorizedDomain?: boolean
  }>
  logout: () => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isSocialLoginAvailable: false,
  login: async () => ({ success: false }),
  loginGoogle: async () => ({ success: false }),
  loginFacebook: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
  refreshUserData: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const socialLoginAvailable = isSocialLoginAvailable()

  const fetchUserData = async (user: User) => {
    const result = await getUserData(user.uid)
    if (result.success) {
      setUserData(result.data)
    }
    return result
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user)
    }
  }

  useEffect(() => {
    // Check for redirect result first (for social login redirects)
    const handleRedirectResult = async () => {
      try {
        const result = await checkRedirectResult()
        if (result.success && result.user) {
          // User data will be fetched by the auth state change listener
          console.log("Successfully signed in after redirect")
        } else if (result.error) {
          console.error("Redirect sign-in error:", result.error)
        }
      } catch (error) {
        console.error("Error checking redirect result:", error)
      }
    }

    handleRedirectResult()

    // Set up auth state change listener
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser)

      if (authUser) {
        await fetchUserData(authUser)
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await loginWithEmail(email, password)
      if (result.success && result.user) {
        await fetchUserData(result.user)
      }
      return result
    } catch (error: any) {
      console.error("Login error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const loginGoogle = async () => {
    try {
      const result = await loginWithGoogle()
      // If it's a redirect, we don't need to fetch user data now
      // It will be handled by the redirect result check in useEffect
      if (result.success && result.user && !result.redirecting) {
        await fetchUserData(result.user)
      }
      return result
    } catch (error: any) {
      console.error("Google login error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const loginFacebook = async () => {
    try {
      const result = await loginWithFacebook()
      // If it's a redirect, we don't need to fetch user data now
      // It will be handled by the redirect result check in useEffect
      if (result.success && result.user && !result.redirecting) {
        await fetchUserData(result.user)
      }
      return result
    } catch (error: any) {
      console.error("Facebook login error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        setUserData(null)
      }
      return result
    } catch (error: any) {
      console.error("Logout error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await firebaseRegister(email, password, name)
      if (result.success && result.user) {
        await fetchUserData(result.user)
      }
      return result
    } catch (error: any) {
      console.error("Register error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const result = await resetPassword(email)
      return result
    } catch (error: any) {
      console.error("Password reset error in context:", error)
      return { success: false, error: error.message }
    }
  }

  const isAuthenticated = !!user
  const isAdmin = userData?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isAuthenticated,
        isAdmin,
        isSocialLoginAvailable: socialLoginAvailable,
        login,
        loginGoogle,
        loginFacebook,
        logout,
        register,
        forgotPassword,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
