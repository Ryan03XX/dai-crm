import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'sales', label: 'Sales' },
]

export default function Users() {
  const { isAdmin } = useAuth()
  const { users, update } = useData()

  if (!isAdmin) return <p>Only Admin can manage users.</p>

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Sales can manage their own customers. Admin can see everyone.</p>
        </div>
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
