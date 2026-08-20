import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Pill } from '../components/ui'

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
      <div className="card table-wrap">
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
                  <select value={person.role} onChange={(e) => update('users', person.id, { role: e.target.value })}>
                    <option value="sales">Sales</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span style={{ marginLeft: 8 }}>
                    <Pill value={person.role === 'admin' ? 'qualified' : 'new'} label={person.role} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
