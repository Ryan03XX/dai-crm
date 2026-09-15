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
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db, firebaseConfig, isFirebaseConfigured } from '../firebase'
import { canEditRecord } from '../utils'

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
  const [blockedReason, setBlockedReason] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined

    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      setLoading(true)
      setUser(nextUser)
    })

    return unsubAuth
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists()) {
        setLoading(false)
        return
      }
      const nextProfile = { id: snap.id, ...snap.data() }
      if (nextProfile.status === 'inactive') {
        setBlockedReason('This account is inactive. Contact an admin.')
        setLoading(false)
        firebaseSignOut(auth)
        return
      }
      setBlockedReason('')
      setProfile(nextProfile)
      setLoading(false)
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
      blockedReason,
      isAdmin: profile?.role === 'admin' && profile?.status !== 'inactive',
      isActive: profile?.status !== 'inactive',
      canEdit(record) {
        if (!record || profile?.status === 'inactive') return false
        return canEditRecord(record, user?.uid, profile?.role === 'admin')
      },
      async signIn(email, password, remember = true) {
        setBlockedReason('')
        setLoading(true)
        try {
          await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          if (snap.data()?.status === 'inactive') {
            setBlockedReason('This account is inactive. Contact an admin.')
            await firebaseSignOut(auth)
            const err = new Error('This account is inactive. Contact an admin.')
            err.code = 'auth/user-inactive'
            throw err
          }
        } catch (err) {
          if (err.code !== 'auth/user-inactive') setLoading(false)
          throw err
        }
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
          status: 'active',
          createdAt: serverTimestamp(),
        })
      },
      async signOut() {
        await firebaseSignOut(auth)
      },
      async sendPasswordReset(email) {
        await sendPasswordResetEmail(auth, email.trim())
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
            status: 'active',
            createdAt: serverTimestamp(),
          })
          return cred.user.uid
        } finally {
          await firebaseSignOut(secondary.auth)
        }
      },
    }),
    [user, profile, loading, blockedReason]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
