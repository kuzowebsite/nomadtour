import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
} from "firebase/auth"
import { getDatabase, ref, set, get } from "firebase/database"
import { app } from "./firebase"

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

// Add scopes for better user data
googleProvider.addScope("profile")
googleProvider.addScope("email")
facebookProvider.addScope("email")

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Check if we're in development mode
const isDevelopment = isBrowser
  ? process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("vercel.app")
  : process.env.NODE_ENV === "development"

// List of known authorized domains
const AUTHORIZED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "nomadtour.mn", // Replace with your actual production domain
]

// Check if current domain is likely authorized
const isLikelyAuthorized = () => {
  if (!isBrowser) return true // Default to true on server-side

  const hostname = window.location.hostname
  return AUTHORIZED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

export const register = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store additional user data in the database
    const db = getDatabase()
    await set(ref(db, `users/${user.uid}`), {
      email,
      firstName: name,
      lastName: "",
      phone: "",
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      authProvider: "email",
    })

    return { success: true, user }
  } catch (error: any) {
    console.error("Registration error:", error)

    // Provide more user-friendly error messages in Mongolian
    if (error.code === "auth/email-already-in-use") {
      return { success: false, error: "Энэ и-мэйл хаяг бүртгэлтэй байна" }
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "Нууц үг хэтэрхий богино байна. 6-аас дээш тэмдэгт оруулна уу" }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "И-мэйл хаяг буруу байна" }
    }

    return { success: false, error: error.message }
  }
}

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    console.error("Login error:", error)

    // Provide more user-friendly error messages in Mongolian
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      return {
        success: false,
        error: "И-мэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.",
      }
    } else if (error.code === "auth/user-disabled") {
      return { success: false, error: "Энэ хэрэглэгчийн эрх хаагдсан байна" }
    } else if (error.code === "auth/too-many-requests") {
      return {
        success: false,
        error: "Хэт олон удаа буруу оролдлого хийсэн тул түр хүлээнэ үү",
      }
    }

    return { success: false, error: "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу." }
  }
}

export const loginWithGoogle = async () => {
  // Early check for unauthorized domain to avoid unnecessary API calls
  if (isDevelopment && !isLikelyAuthorized()) {
    return {
      success: false,
      error: "Энэ домэйн Firebase дээр бүртгэгдээгүй байна. Хөгжүүлэгчид: Firebase консол дээр энэ домэйнийг нэмнэ үү.",
      unauthorizedDomain: true,
    }
  }

  try {
    // Try redirect method first as it works better across browsers and mobile devices
    try {
      await signInWithRedirect(auth, googleProvider)
      // The result will be handled by getRedirectResult in the useEffect
      return { success: true, redirecting: true }
    } catch (redirectError: any) {
      console.log("Redirect failed, trying popup:", redirectError)

      // If redirect fails, try popup as fallback
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Store or update user data
      await storeUserDataFromSocialLogin(user, "google")

      return { success: true, user }
    }
  } catch (error: any) {
    console.error("Google login error:", error)

    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, error: "Нэвтрэх цонх хаагдсан байна" }
    } else if (error.code === "auth/popup-blocked") {
      return { success: false, error: "Таны хөтөч popup цонхыг хаасан байна. Зөвшөөрөл өгнө үү" }
    } else if (error.code === "auth/unauthorized-domain") {
      return {
        success: false,
        error:
          "Энэ домэйн Firebase дээр бүртгэгдээгүй байна. Хөгжүүлэгчид: Firebase консол дээр энэ домэйнийг нэмнэ үү.",
        unauthorizedDomain: true,
      }
    }

    return { success: false, error: "Google-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу." }
  }
}

export const loginWithFacebook = async () => {
  // Early check for unauthorized domain to avoid unnecessary API calls
  if (isDevelopment && !isLikelyAuthorized()) {
    return {
      success: false,
      error: "Энэ домэйн Firebase дээр бүртгэгдээгүй байна. Хөгжүүлэгчид: Firebase консол дээр энэ домэйнийг нэмнэ үү.",
      unauthorizedDomain: true,
    }
  }

  try {
    // Try redirect method first
    try {
      await signInWithRedirect(auth, facebookProvider)
      // The result will be handled by getRedirectResult in the useEffect
      return { success: true, redirecting: true }
    } catch (redirectError: any) {
      console.log("Redirect failed, trying popup:", redirectError)

      // If redirect fails, try popup as fallback
      const result = await signInWithPopup(auth, facebookProvider)
      const user = result.user

      // Store or update user data
      await storeUserDataFromSocialLogin(user, "facebook")

      return { success: true, user }
    }
  } catch (error: any) {
    console.error("Facebook login error:", error)

    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, error: "Нэвтрэх цонх хаагдсан байна" }
    } else if (error.code === "auth/popup-blocked") {
      return { success: false, error: "Таны хөтөч popup цонхыг хаасан байна. Зөвшөөрөл өгнө үү" }
    } else if (error.code === "auth/account-exists-with-different-credential") {
      return { success: false, error: "Энэ и-мэйл хаягтай өөр бүртгэл байна" }
    } else if (error.code === "auth/unauthorized-domain") {
      return {
        success: false,
        error:
          "Энэ домэйн Firebase дээр бүртгэгдээгүй байна. Хөгжүүлэгчид: Firebase консол дээр энэ домэйнийг нэмнэ үү.",
        unauthorizedDomain: true,
      }
    }

    return { success: false, error: "Facebook-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу." }
  }
}

// Helper function to store user data from social login
async function storeUserDataFromSocialLogin(user: User, provider: string) {
  const db = getDatabase()
  const userRef = ref(db, `users/${user.uid}`)
  const snapshot = await get(userRef)

  if (!snapshot.exists()) {
    // New user - store their data
    const names = user.displayName ? user.displayName.split(" ") : ["", ""]
    const firstName = names[0] || ""
    const lastName = names.length > 1 ? names.slice(1).join(" ") : ""

    await set(userRef, {
      email: user.email,
      firstName,
      lastName,
      phone: user.phoneNumber || "",
      role: "user",
      createdAt: new Date().toISOString(),
      authProvider: provider,
      photoURL: user.photoURL || "",
    })
  }
}

// Function to check for redirect result
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      // User successfully signed in after redirect
      const user = result.user

      // Determine provider - add null check for providerId
      const providerId = result.providerId || ""
      const provider = providerId.includes("google")
        ? "google"
        : providerId.includes("facebook")
          ? "facebook"
          : "unknown"

      // Store user data
      await storeUserDataFromSocialLogin(user, provider)

      return { success: true, user }
    }
    return { success: false, noRedirect: true }
  } catch (error: any) {
    console.error("Redirect result error:", error)
    return {
      success: false,
      error:
        error.code === "auth/unauthorized-domain"
          ? "Энэ домэйн Firebase дээр бүртгэгдээгүй байна"
          : "Нэвтрэхэд алдаа гарлаа",
      unauthorizedDomain: error.code === "auth/unauthorized-domain",
    }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error)

    // Provide more user-friendly error messages in Mongolian
    if (error.code === "auth/user-not-found") {
      return { success: false, error: "Энэ и-мэйл хаягтай хэрэглэгч олдсонгүй" }
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "И-мэйл хаяг буруу байна" }
    }

    return { success: false, error: error.message }
  }
}

export const getUserData = async (userId: string) => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${userId}`)
    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() }
    } else {
      return { success: false, error: "User data not found" }
    }
  } catch (error: any) {
    console.error("Get user data error:", error)
    return { success: false, error: error.message }
  }
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const user = auth.currentUser

    if (!user || !user.email) {
      return { success: false, error: "Хэрэглэгч олдсонгүй" }
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Change password
    await updatePassword(user, newPassword)

    return { success: true }
  } catch (error: any) {
    console.error("Password change error:", error)

    // Provide more user-friendly error messages
    if (error.code === "auth/wrong-password") {
      return { success: false, error: "Одоогийн нууц үг буруу байна" }
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "Шинэ нууц үг хэтэрхий сул байна" }
    } else if (error.code === "auth/requires-recent-login") {
      return { success: false, error: "Дахин нэвтэрч оролдоно уу" }
    }

    return { success: false, error: error.message }
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const getCurrentUser = () => {
  return auth.currentUser
}

// Function to check if social login is available in current environment
export const isSocialLoginAvailable = () => {
  // Default to false on server-side to be safe
  if (!isBrowser) return false

  return isLikelyAuthorized() || !isDevelopment
}
