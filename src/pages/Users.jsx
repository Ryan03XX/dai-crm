import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Pill } from '../components/ui'

export default function Users() {
  const { isAdmin } = useAuth()
  const { users, update } = useData()

  if (!isAdmin) return <p>只有 Admin 可以管理用户。</p>

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>用户</h1>
          <p>Sales 只管理自己的客户，Admin 可以看全部</p>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>Email</th>
              <th>角色</th>
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
