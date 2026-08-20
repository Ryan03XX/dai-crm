import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isFirebaseConfigured) return <SetupGuide />
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await signIn(email, password)
      else await signUp(name, email, password)
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'Incorrect email or password',
        'auth/invalid-email': 'Please enter a valid email',
        'auth/email-already-in-use': 'This email is already registered',
        'auth/weak-password': 'Password must be at least 6 characters',
        'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase',
      }
      setError(messages[err.code] || err.message || 'Unable to sign in')
    } finally {
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-brand">
          <div className="auth-mark">D</div>
          <strong>DAI CRM</strong>
          <p>A simple workspace for your sales team.</p>
        </aside>
        <div className="auth-card">
          <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p>{isLogin ? 'Sign in to continue' : 'Set up your DAI CRM account'}</p>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="field">
                <span>Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="btn auth-submit" disabled={busy}>
              {busy ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button className="linkish" onClick={() => setMode(isLogin ? 'register' : 'login')}>
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function SetupGuide() {
  return (
    <div className="auth-page">
      <div className="setup">
        <h1>Connect Firebase first</h1>
        <p>Copy `.env.example` to `.env`, add your Firebase web app config, then run `npm run dev` again.</p>
        <ol>
          <li>Open Firebase Console and create a project</li>
          <li>Enable Authentication → Email/Password</li>
          <li>Create a Firestore database, then publish `firestore.rules`</li>
          <li>Project settings → Your apps → add a Web app and copy the config</li>
        </ol>
        <pre>{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
      </div>
    </div>
  )
}
