import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { ACTIVITY_TYPES, labelOf } from '../constants'
import { activitySortValue, formatDate, formatDateTime } from '../utils'
import { Empty, Pill } from '../components/ui'

export default function Activities() {
  const { activities } = useData()
  const [type, setType] = useState('all')
  const rows = useMemo(
    () =>
      activities
        .filter((item) => type === 'all' || item.type === type)
        .slice()
        .sort((a, b) => activitySortValue(b) - activitySortValue(a)),
    [activities, type]
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Activities</h1>
          <p>Call, meeting, note or follow-up, logged against a lead, company or opportunity</p>
        </div>
      </div>
      <div className="toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">All types</option>
          {ACTIVITY_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="card">
        {rows.length === 0 && <Empty text="No activities yet. Log a follow-up from a lead or opportunity." />}
        <div className="timeline">
          {rows.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Pill value={item.type} label={labelOf(ACTIVITY_TYPES, item.type)} />
                <b>{item.title}</b>
              </div>
              <div>{item.description}</div>
              <div className="muted">
                {item.relatedName} · {item.ownerName} · {formatDate(item.activityDate) !== '—' ? formatDate(item.activityDate) : formatDateTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
