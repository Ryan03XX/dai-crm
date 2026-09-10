import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Field, Modal, NewButton, Pill } from '../components/ui'

const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'sales', label: 'Sales' },
]

const STATUSES = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]

const emptyUser = { name: '', email: '', password: '', role: 'sales', status: 'active' }

function isActive(person) {
  return person?.status !== 'inactive'
}

export default function Users() {
  const { user, isAdmin, createUser } = useAuth()
  const { users, update } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyUser)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const activeAdmins = users.filter((person) => person.role === 'admin' && isActive(person))

  if (!isAdmin) return <p>Only Admin can manage users.</p>

  function openAdd() {
    setError('')
    setForm(emptyUser)
    setModal('add')
  }

  function openEdit(person) {
    setError('')
    setForm({
      name: person.name || '',
      email: person.email || '',
      password: '',
      role: person.role || 'sales',
      status: isActive(person) ? 'active' : 'inactive',
    })
    setModal(person)
  }

  function closeModal() {
    setModal(null)
    setForm(emptyUser)
    setError('')
  }

  function guardChange(person, nextRole, nextStatus) {
    const becomingInactive = nextStatus === 'inactive'
    const losingAdmin = person.role === 'admin' && isActive(person) && (nextRole !== 'admin' || becomingInactive)
    if (person.id === user.uid && becomingInactive) {
      return 'You cannot deactivate your own account.'
    }
    if (losingAdmin && activeAdmins.length <= 1) {
      return 'Keep at least one active admin.'
    }
    return ''
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (modal === 'add') {
        await createUser(form)
      } else {
        const message = guardChange(modal, form.role, form.status)
        if (message) {
          setError(message)
          return
        }
        await update('users', modal.id, {
          name: form.name.trim(),
          role: form.role === 'admin' ? 'admin' : 'sales',
          status: form.status === 'inactive' ? 'inactive' : 'active',
        })
      }
      closeModal()
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Please enter a valid email',
        'auth/weak-password': 'Password must be at least 6 characters',
      }
      setError(messages[err.code] || err.message || 'Unable to save this user')
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(person, status) {
    const message = guardChange(person, person.role, status)
    if (message) {
      alert(message)
      return
    }
    await update('users', person.id, { status })
  }

  const isAdd = modal === 'add'

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Sales can manage their own customers. Admin can see everyone.</p>
        </div>
        <NewButton onClick={openAdd}>Add user</NewButton>
      </div>
      <div className="card table-wrap users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((person) => (
              <tr key={person.id} className={isActive(person) ? '' : 'inactive-row'}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>
                  <RoleSelect
                    value={person.role}
                    onChange={(role) => {
                      const message = guardChange(person, role, isActive(person) ? 'active' : 'inactive')
                      if (message) {
                        alert(message)
                        return
                      }
                      update('users', person.id, { role })
                    }}
                  />
                </td>
                <td>
                  <Pill
                    value={isActive(person) ? 'active' : 'inactive'}
                    label={isActive(person) ? 'Active' : 'Inactive'}
                  />
                </td>
                <td>
                  <div className="user-actions">
                    <button type="button" className="btn light btn-small" onClick={() => openEdit(person)}>
                      Edit
                    </button>
                    {isActive(person) ? (
                      <button type="button" className="btn light btn-small" onClick={() => setStatus(person, 'inactive')}>
                        Deactivate
                      </button>
                    ) : (
                      <button type="button" className="btn btn-small" onClick={() => setStatus(person, 'active')}>
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={isAdd ? 'Add user' : 'Edit user'} onClose={closeModal}>
          <p className="muted">
            {isAdd
              ? 'Create a login for a teammate. Share the email and password with them after saving.'
              : 'Update the name, role or status. Email is the login and cannot be changed here.'}
          </p>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Full name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="off" />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="off"
                  disabled={!isAdd}
                />
              </Field>
              {isAdd && (
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
              )}
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
              {!isAdd && (
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Saving...' : isAdd ? 'Add user' : 'Save'}
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
