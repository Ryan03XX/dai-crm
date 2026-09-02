import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, LEAD_CATEGORIES, labelOf } from '../constants'
import { agingLabel, avgAgingDays, isOpenDeal, moneyOf, opportunities, totalsByCurrency } from '../utils'
import { Pill } from '../components/ui'

export default function Pipeline() {
  const { deals, update } = useData()
  const navigate = useNavigate()
  const opps = useMemo(() => opportunities(deals), [deals])
  const openOpps = useMemo(() => opps.filter(isOpenDeal), [opps])
  const size = openOpps.length
  const velocity = avgAgingDays(openOpps)
  const pipelineValue = totalsByCurrency(openOpps)

  function onDrop(stage, event) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (id) update('deals', id, { stage, stageEnteredAt: new Date().toISOString() })
  }

  const shapeTotal = openOpps.length || 1

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <p>Confirmed opportunities only. Drag cards to update the stage until Won or Lost.</p>
        </div>
      </div>

      <div className="grid stats pipeline-metrics">
        <div className="card">
          <div className="stat-label">Size</div>
          <div className="stat-value">{size}</div>
          <div className="muted">Open opportunities</div>
        </div>
        <div className="card">
          <div className="stat-label">Velocity</div>
          <div className="stat-value">{velocity}d</div>
          <div className="muted">Average aging of open opportunities</div>
        </div>
        <div className="card">
          <div className="stat-label">Pipeline $</div>
          <div className="stat-value multi">{pipelineValue}</div>
          <div className="muted">Open value by currency</div>
        </div>
        <div className="card">
          <div className="stat-label">Shape</div>
          <div className="shape-bar" aria-label="Pipeline shape">
            {DEAL_STAGES.filter((stage) => stage.id !== 'won' && stage.id !== 'lost').map((stage) => {
              const count = openOpps.filter((d) => d.stage === stage.id).length
              const pct = (count / shapeTotal) * 100
              return (
                <div
                  key={stage.id}
                  className={`shape-seg ${stage.id}`}
                  style={{ width: `${pct}%` }}
                  title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
                />
              )
            })}
          </div>
          <div className="shape-legend">
            {DEAL_STAGES.filter((stage) => stage.id !== 'won' && stage.id !== 'lost').map((stage) => (
              <span key={stage.id}>
                {stage.label} {openOpps.filter((d) => d.stage === stage.id).length}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="kanban">
        {DEAL_STAGES.map((stage) => {
          const rows = opps.filter((d) => d.stage === stage.id)
          return (
            <section
              key={stage.id}
              className="kanban-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(stage.id, e)}
            >
              <header>
                <span>{stage.label}</span>
                <span>{rows.length}</span>
              </header>
              <div className="kanban-money">{rows.length ? totalsByCurrency(rows) : '—'}</div>
              {rows.map((deal) => (
                <article
                  key={deal.id}
                  className="deal-card"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', deal.id)}
                  onClick={() => navigate(`/deals?id=${deal.id}`)}
                >
                  <b>{deal.name}</b>
                  <div className="meta">{deal.endUser || deal.companyName}</div>
                  <div className="meta">{moneyOf(deal)}</div>
                  {deal.gpuModel && (
                    <div className="meta">
                      {deal.gpuModel}
                      {deal.gpuQty ? ` × ${deal.gpuQty}` : ''}
                    </div>
                  )}
                  {(deal.dcSite || deal.dcVendor) && (
                    <div className="meta">{deal.dcSite || deal.dcVendor}</div>
                  )}
                  <div className="meta">
                    {deal.deliverySchedule || labelOf(LEAD_CATEGORIES, deal.category) || 'Uncategorised'} · Aging {agingLabel(deal.createdAt)}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
                  </div>
                </article>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}
