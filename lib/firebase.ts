import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKUL5WUMzvLm_c4NOVADmKp8H0v9Q6k4E",
  authDomain: "nomadtour-a026f.firebaseapp.com",
  databaseURL: "https://nomadtour-a026f-default-rtdb.firebaseio.com",
  projectId: "nomadtour-a026f",
  storageBucket: "nomadtour-a026f.firebasestorage.app",
  messagingSenderId: "169323310749",
  appId: "1:169323310749:web:3fa10519e0c26472462e74",
  measurementId: "G-266W8JHWKH",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { database, db, app, storage }
