import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Field, Modal, NewButton } from '../components/ui'

const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'sales', label: 'Sales' },
]

const emptyUser = { name: '', email: '', password: '', role: 'sales' }

export default function Users() {
  const { isAdmin, createUser } = useAuth()
  const { users, update } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyUser)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isAdmin) return <p>Only Admin can manage users.</p>

  async function save(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await createUser(form)
      setOpen(false)
      setForm(emptyUser)
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Please enter a valid email',
        'auth/weak-password': 'Password must be at least 6 characters',
      }
      setError(messages[err.code] || err.message || 'Unable to add this user')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Sales can manage their own customers. Admin can see everyone.</p>
        </div>
        <NewButton onClick={() => {
          setError('')
          setForm(emptyUser)
          setOpen(true)
        }}>
          Add user
        </NewButton>
      </div>
      <div className="card table-wrap users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>
                  <RoleSelect value={person.role} onChange={(role) => update('users', person.id, { role })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Add user" onClose={() => setOpen(false)}>
          <p className="muted">Create a login for a teammate. Share the email and password with them after saving.</p>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Full name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="off" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="off" />
              </Field>
              <Field label="Temporary password">
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Adding...' : 'Add user'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = ROLES.find((role) => role.id === value) || ROLES[1]

  useEffect(() => {
    function onDocClick(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="role-menu" ref={ref}>
      <button
        type="button"
        className={`pill role-trigger ${current.id}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <span className="chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="role-dropdown" role="listbox">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              className={role.id === value ? 'active' : ''}
              onClick={() => {
                onChange(role.id)
                setOpen(false)
              }}
            >
              <span className={`dot ${role.id}`} />
              {role.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
