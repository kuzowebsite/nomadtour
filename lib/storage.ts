import { ref, set, push } from "firebase/database"
import { database } from "@/lib/firebase"

/**
 * Convert a file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Upload an image to Firebase Realtime Database as base64
 * @param file The file to upload
 * @param folder The folder to categorize the image (used as path in database)
 * @returns The key of the uploaded image in the database
 */
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(file)

    // Create a reference to the images location in the database
    const imagesRef = ref(database, `images/${folder}`)

    // Generate a unique key for the image
    const newImageRef = push(imagesRef)

    // Store the image data
    const imageData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      data: base64Image,
      uploadedAt: Date.now(),
    }

    // Save the image data to the database
    await set(newImageRef, imageData)

    // Return the base64 data directly as the "URL"
    return base64Image
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(file)

    // Create a reference to the profile images location in the database
    const profileImagesRef = ref(database, `profileImages/${userId}`)

    // Generate a unique key for the image
    const newImageRef = push(profileImagesRef)

    // Store the image data
    const imageData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      data: base64Image,
      uploadedAt: Date.now(),
    }

    // Save the image data to the database
    await set(newImageRef, imageData)

    // Return the base64 data directly as the "URL"
    return base64Image
  } catch (error) {
    console.error("Error uploading profile image:", error)
    throw new Error("Failed to upload profile image")
  }
}

/**
 * Delete an image from Firebase Realtime Database
 * This is a placeholder since we don't have a direct way to reference images for deletion
 * In a real implementation, you would store the database key when saving the image URL
 */
export const deleteImage = async (imageKey: string): Promise<void> => {
  try {
    // This would need the actual database path to the image
    console.warn("Image deletion not fully implemented for database storage")
  } catch (error) {
    console.error("Error deleting image:", error)
  }
}
