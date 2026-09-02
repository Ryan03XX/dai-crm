import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { activitySortValue, avgAgingDays, formatDate, isOpenDeal, isOverdue, money, opportunities } from '../utils'
import { CURRENCIES, labelOf, DEAL_STAGES, TASK_STATUSES } from '../constants'
import { Empty, NewButton, Pill } from '../components/ui'

function dealCurrency(deal) {
  return deal.currency || 'SGD'
}

export default function Dashboard() {
  const { leads, deals, tasks, activities, loading } = useData()
  const [currency, setCurrency] = useState('SGD')

  const {
    currencyLeads,
    openDeals,
    won,
    lost,
    pipelineValue,
    velocityDays,
    upcoming,
    recentActivities,
    stageDeals,
  } = useMemo(() => {
    const currencyDeals = opportunities(deals).filter((deal) => dealCurrency(deal) === currency)
    const dealIds = new Set(currencyDeals.map((deal) => deal.id))
    const companyIds = new Set(currencyDeals.map((deal) => deal.companyId).filter(Boolean))
    const currencyLeads = leads.filter((lead) => {
      if (lead.convertedDealId) return dealIds.has(lead.convertedDealId)
      return currency === 'SGD'
    })
    const leadIds = new Set(currencyLeads.map((lead) => lead.id))

    function inView(item) {
      if (item.relatedType === 'deal') return dealIds.has(item.relatedId)
      if (item.relatedType === 'lead') return leadIds.has(item.relatedId)
      if (item.relatedType === 'company') return companyIds.has(item.relatedId)
      return currency === 'SGD'
    }

    const openDeals = currencyDeals.filter(isOpenDeal)
    const won = currencyDeals.filter((d) => d.stage === 'won')
    const lost = currencyDeals.filter((d) => d.stage === 'lost')

    return {
      currencyLeads,
      openDeals,
      won,
      lost,
      pipelineValue: openDeals.reduce((sum, d) => sum + Number(d.value || 0), 0),
      velocityDays: avgAgingDays(openDeals),
      upcoming: tasks
        .filter((t) => t.status !== 'done' && inView(t))
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
        .slice(0, 6),
      recentActivities: activities
        .filter(inView)
        .slice()
        .sort((a, b) => activitySortValue(b) - activitySortValue(a))
        .slice(0, 6),
      stageDeals: currencyDeals,
    }
  }, [activities, currency, deals, leads, tasks])

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Sales dashboard</h1>
          <p>Leads, open opportunities, pipeline value, won/lost, and upcoming tasks</p>
        </div>
        <NewButton to="/leads">New lead</NewButton>
      </div>

      <div className="currency-tabs" role="tablist" aria-label="Currency">
        {CURRENCIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={currency === item.id}
            className={currency === item.id ? 'active' : ''}
            onClick={() => setCurrency(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid stats">
        <Stat label="Leads" value={currencyLeads.length} to="/leads" />
        <Stat label="Open opportunities" value={openDeals.length} to="/pipeline" />
        <Stat label="Pipeline value" value={money(pipelineValue, currency)} to="/pipeline" />
        <Stat label="Velocity" value={`${velocityDays}d`} to="/pipeline" />
        <Stat label="Won" value={won.length} to="/deals?filter=won" />
        <Stat label="Lost" value={lost.length} to="/deals?filter=lost" />
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
          <h3>
            <Link className="section-link" to="/activities">
              Recent activities
            </Link>
          </h3>
          {recentActivities.length === 0 && <Empty text="No activities yet" />}
          <div className="timeline">
            {recentActivities.map((item) => (
              <div className="timeline-item" key={item.id}>
                <b>{item.title}</b>
                <div className="muted">
                  {item.relatedName} · {item.ownerName} · {formatDate(item.activityDate || item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link className="card pipeline-overview-card" to="/pipeline" style={{ marginTop: 16, display: 'block' }}>
        <h3>Pipeline overview</h3>
        <div className="grid three">
          {DEAL_STAGES.map((stage) => {
            const rows = stageDeals.filter((d) => d.stage === stage.id)
            const total = rows.reduce((sum, d) => sum + Number(d.value || 0), 0)
            return (
              <div key={stage.id}>
                <div className="stat-label">{stage.label}</div>
                <div className="stat-value">{rows.length}</div>
                <div className="muted">{rows.length ? money(total, currency) : '—'}</div>
              </div>
            )
          })}
        </div>
      </Link>
    </div>
  )
}

function Stat({ label, value, to }) {
  return (
    <Link className="card stat-link" to={to}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </Link>
  )
}
