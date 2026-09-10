import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getApps, initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db, firebaseConfig, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

function secondaryServices() {
  const name = 'Secondary'
  const secondaryApp = getApps().find((item) => item.name === name) || initializeApp(firebaseConfig, name)
  return {
    auth: getAuth(secondaryApp),
    db: getFirestore(secondaryApp),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined

    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setLoading(false)
      }
    })

    return unsubAuth
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() })
        setLoading(false)
      }
    })

    const timeout = setTimeout(() => setLoading(false), 4000)
    return () => {
      unsubProfile()
      clearTimeout(timeout)
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      async signIn(email, password, remember = true) {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
        await signInWithEmailAndPassword(auth, email, password)
      },
      async signUp(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: name })
        const usersSnap = await getDocs(collection(db, 'users'))
        const role = usersSnap.empty ? 'admin' : 'sales'
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          role,
          createdAt: serverTimestamp(),
        })
      },
      async signOut() {
        await firebaseSignOut(auth)
      },
      async createUser({ name, email, password, role = 'sales' }) {
        const secondary = secondaryServices()
        await setPersistence(secondary.auth, inMemoryPersistence)
        try {
          const cred = await createUserWithEmailAndPassword(secondary.auth, email, password)
          await updateProfile(cred.user, { displayName: name })
          await setDoc(doc(secondary.db, 'users', cred.user.uid), {
            name,
            email,
            role: role === 'admin' ? 'admin' : 'sales',
            createdAt: serverTimestamp(),
          })
          return cred.user.uid
        } finally {
          await firebaseSignOut(secondary.auth)
        }
      },
    }),
    [user, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
