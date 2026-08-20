import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { formatDate, isOverdue, money } from '../utils'
import { labelOf, DEAL_STAGES, TASK_STATUSES } from '../constants'
import { Empty, Pill } from '../components/ui'

export default function Dashboard() {
  const { leads, deals, tasks, activities, loading } = useData()
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const pipelineValue = openDeals.reduce((sum, d) => sum + Number(d.value || 0), 0)
  const won = deals.filter((d) => d.stage === 'won')
  const lost = deals.filter((d) => d.stage === 'lost')
  const upcoming = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, 6)

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Sales dashboard</h1>
          <p>Leads, open deals, pipeline value, won/lost, and upcoming tasks</p>
        </div>
        <Link className="btn" to="/leads">
          New lead
        </Link>
      </div>

      <div className="grid stats">
        <Stat label="Leads" value={leads.length} />
        <Stat label="Open deals" value={openDeals.length} />
        <Stat label="Pipeline value" value={money(pipelineValue)} />
        <Stat label="Won" value={won.length} />
        <Stat label="Lost" value={lost.length} />
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Upcoming tasks</h3>
          {loading && <Empty text="Loading..." />}
          {!loading && upcoming.length === 0 && <Empty text="No open tasks" />}
          <div className="table-wrap">
            <table>
              <tbody>
                {upcoming.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      <Pill
                        value={isOverdue(task.dueDate, task.status) ? 'lost' : task.status}
                        label={isOverdue(task.dueDate, task.status) ? 'Overdue' : labelOf(TASK_STATUSES, task.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3>Recent activities</h3>
          {activities.slice(0, 6).length === 0 && <Empty text="No activities yet" />}
          <div className="timeline">
            {activities.slice(0, 6).map((item) => (
              <div className="timeline-item" key={item.id}>
                <b>{item.title}</b>
                <div className="muted">
                  {item.relatedName} · {item.ownerName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Pipeline overview</h3>
        <div className="grid three">
          {DEAL_STAGES.map((stage) => {
            const rows = deals.filter((d) => d.stage === stage.id)
            const total = rows.reduce((sum, d) => sum + Number(d.value || 0), 0)
            return (
              <div key={stage.id}>
                <div className="stat-label">{stage.label}</div>
                <div className="stat-value">{rows.length}</div>
                <div className="muted">{money(total)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
