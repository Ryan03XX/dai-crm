import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBQhFjEqFJMOXxFrXbi1pNXizZKICDKs8o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dai-crm.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dai-crm',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dai-crm.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '659185513159',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:659185513159:web:4bd2c14d14ae94764604e2',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
)

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage, firebaseConfig }
