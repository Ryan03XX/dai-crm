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
        'auth/invalid-credential': '邮箱或密码不对',
        'auth/invalid-email': '邮箱格式不对',
        'auth/email-already-in-use': '这个邮箱已经注册过了',
        'auth/weak-password': '密码至少 6 位',
        'auth/operation-not-allowed': '请先在 Firebase 启用 Email/Password 登录',
      }
      setError(messages[err.code] || err.message || '登录失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>DAI CRM</h1>
        <p>第一条销售流程：线索 → 跟进 → 转化 → 管道 → 赢单 / 丢单</p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="密码（至少 6 位）" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={busy}>
            {busy ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
        <p>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button className="linkish" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? '注册' : '去登录'}
          </button>
        </p>
        <p className="muted">第一个注册的人会成为 Admin，之后注册的是 Sales。</p>
      </div>
    </div>
  )
}

function SetupGuide() {
  return (
    <div className="auth-page">
      <div className="setup">
        <h1>先接上 Firebase</h1>
        <p>把 `.env.example` 复制成 `.env`，填入 Firebase 网页应用配置后重新运行 `npm run dev`。</p>
        <ol>
          <li>打开 Firebase Console，创建项目</li>
          <li>启用 Authentication → Email/Password</li>
          <li>创建 Firestore Database（测试模式先开，再部署仓库里的 `firestore.rules`）</li>
          <li>Project settings → Your apps → 添加 Web app，复制配置</li>
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
