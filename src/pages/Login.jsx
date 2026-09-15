import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { DaiLogo } from '../components/ui'

const REMEMBER_EMAIL_KEY = 'dai-crm-remember-email'

export default function Login() {
  const { user, signIn, sendPasswordReset } = useAuth()
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_EMAIL_KEY) || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isFirebaseConfigured) return <SetupGuide />
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (remember) localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      else localStorage.removeItem(REMEMBER_EMAIL_KEY)
      await signIn(email, password, remember)
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'Incorrect email or password',
        'auth/invalid-email': 'Please enter a valid email',
        'auth/user-inactive': 'This account is inactive. Contact an admin.',
        'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase',
      }
      setError(messages[err.code] || err.message || 'Unable to sign in')
    } finally {
      setBusy(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await sendPasswordReset(email)
      setNotice(`A reset link has been sent to ${email}. Check your inbox, including junk.`)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setNotice(`A reset link has been sent to ${email}. Check your inbox, including junk.`)
      } else {
        const messages = {
          'auth/invalid-email': 'Please enter a valid email',
          'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
          'auth/missing-email': 'Please enter your email',
        }
        setError(messages[err.code] || err.message || 'Unable to send reset link')
      }
    } finally {
      setBusy(false)
    }
  }

  function openReset() {
    setError('')
    setNotice('')
    setMode('reset')
  }

  function backToSignIn() {
    setError('')
    setNotice('')
    setMode('signin')
  }

  const resetting = mode === 'reset'

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-brand">
          <DaiLogo className="auth-logo" />
          <p>Track leads, opportunities and pipeline in one workspace.</p>
        </aside>
        <div className="auth-card">
          <h1>{resetting ? 'Forgot password' : 'Welcome back'}</h1>
          <p>{resetting ? 'We will email you a reset link' : 'Sign in to continue'}</p>
          <form onSubmit={resetting ? handleReset : handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            {!resetting && (
              <>
                <label className="field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </label>
                <div className="auth-row">
                  <label className="remember-me">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="linkish" onClick={openReset}>
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {error && <div className="error">{error}</div>}
            {notice && <div className="notice">{notice}</div>}
            <button className="btn auth-submit" disabled={busy}>
              {busy ? 'Please wait...' : resetting ? (notice ? 'Resend link' : 'Send reset link') : 'Sign in'}
            </button>
            {resetting && (
              <button type="button" className="linkish auth-back" onClick={backToSignIn}>
                Back to sign in
              </button>
            )}
          </form>
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
