import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, labelOf } from '../constants'
import { moneyOf } from '../utils'
import { Pill } from '../components/ui'

export default function Pipeline() {
  const { deals, update } = useData()
  const navigate = useNavigate()

  function onDrop(stage, event) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (id) update('deals', id, { stage })
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <p>Drag deal cards to update the stage until Won or Lost</p>
        </div>
      </div>
      <div className="kanban">
        {DEAL_STAGES.map((stage) => (
          <section
            key={stage.id}
            className="kanban-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(stage.id, e)}
          >
            <header>
              <span>{stage.label}</span>
              <span>{deals.filter((d) => d.stage === stage.id).length}</span>
            </header>
            {deals
              .filter((d) => d.stage === stage.id)
              .map((deal) => (
                <article
                  key={deal.id}
                  className="deal-card"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', deal.id)}
                  onClick={() => navigate(`/deals?id=${deal.id}`)}
                >
                  <b>{deal.name}</b>
                  <div className="meta">{deal.companyName}</div>
                  <div className="meta">{moneyOf(deal)}</div>
                  <div style={{ marginTop: 8 }}>
                    <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
                  </div>
                </article>
              ))}
          </section>
        ))}
      </div>
    </div>
  )
}
