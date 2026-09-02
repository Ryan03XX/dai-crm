import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { searchText } from '../utils'
import { DaiLogo } from './ui'
import { ICONS } from './icons'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/leads', label: 'Leads', icon: 'leads' },
  { to: '/companies', label: 'Companies', icon: 'companies' },
  { to: '/contacts', label: 'Contacts', icon: 'contacts' },
  { to: '/deals', label: 'Opportunities', icon: 'deals' },
  { to: '/pipeline', label: 'Pipeline', icon: 'pipeline' },
  { to: '/activities', label: 'Activities', icon: 'activities' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
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
      ['Lead', 'leads', (row) => `/leads/${row.id}`],
      ['Company', 'companies', (row) => `/companies/${row.id}`],
      ['Contact', 'contacts', (row) => (row.companyId ? `/companies/${row.companyId}` : '/contacts')],
      ['Opportunity', 'deals', (row) => `/deals?id=${row.id}`],
      ['User', 'users', () => '/users'],
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
          <DaiLogo className="brand-logo" />
          <div>
            <strong>DAI CRM</strong>
            <span>Sales workspace</span>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/users">
              {ICONS.users}
              Users
            </NavLink>
          )}
        </nav>
        <div className="sidebar-foot">
          <div>{profile?.name}</div>
          <small>{isAdmin ? 'Admin · can see all customers' : 'Sales · own customers only'}</small>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="search-wrap">
            <input
              placeholder="Search companies, contacts, opportunities, salespeople..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q.trim().length >= 2 && (
              <div className="search-results">
                {results.length === 0 && <div className="empty-search">No matching results</div>}
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
              Log out
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
