import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { searchText } from '../utils'

const NAV = [
  { to: '/', label: '仪表盘' },
  { to: '/leads', label: '线索' },
  { to: '/companies', label: '公司' },
  { to: '/contacts', label: '联系人' },
  { to: '/deals', label: '商机' },
  { to: '/pipeline', label: '销售管道' },
  { to: '/activities', label: '活动' },
  { to: '/tasks', label: '任务' },
]

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth()
  const data = useData()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    const keyword = q.trim()
    if (keyword.length < 2) return []
    const groups = [
      ['线索', 'leads', (row) => `/leads/${row.id}`],
      ['公司', 'companies', (row) => `/companies/${row.id}`],
      ['联系人', 'contacts', (row) => (row.companyId ? `/companies/${row.companyId}` : '/contacts')],
      ['商机', 'deals', (row) => `/deals?id=${row.id}`],
      ['销售', 'users', () => '/users'],
    ]
    return groups.flatMap(([label, key, toPath]) =>
      data[key]
        .filter((row) => searchText(row, keyword))
        .slice(0, 5)
        .map((row) => ({
          id: row.id,
          label,
          title: row.name,
          path: toPath(row),
        }))
    )
  }, [q, data])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>DAI CRM</strong>
          <span>Phase 1 · MVP</span>
        </div>
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <i className="mark" />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/users">
              <i className="mark" />
              用户
            </NavLink>
          )}
        </nav>
        <div className="sidebar-foot">
          <div>{profile?.name}</div>
          <small>{isAdmin ? 'Admin · 可看全部客户' : 'Sales · 只看自己的客户'}</small>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="search-wrap">
            <input
              placeholder="搜索客户、联系人、商机、销售..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q.trim().length >= 2 && (
              <div className="search-results">
                {results.length === 0 && <div className="empty-search">没有匹配结果</div>}
                {results.map((item) => (
                  <a
                    key={`${item.label}-${item.id}`}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault()
                      setQ('')
                      navigate(item.path)
                    }}
                  >
                    <small>{item.label}</small>
                    {item.title}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="user-chip">
            <div className="avatar">{(profile?.name || 'U').slice(0, 1)}</div>
            <button className="ghost" onClick={signOut}>
              退出
            </button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
