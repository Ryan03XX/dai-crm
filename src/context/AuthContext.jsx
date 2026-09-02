import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
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
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

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
