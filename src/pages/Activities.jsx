import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { ACTIVITY_TYPES, labelOf } from '../constants'
import { formatDateTime } from '../utils'
import { Empty, Pill } from '../components/ui'

export default function Activities() {
  const { activities } = useData()
  const [type, setType] = useState('all')
  const rows = useMemo(
    () => activities.filter((item) => type === 'all' || item.type === type),
    [activities, type]
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>活动</h1>
          <p>Call / Meeting / Note / Follow-up，挂在线索、公司或商机上</p>
        </div>
      </div>
      <div className="toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">全部类型</option>
          {ACTIVITY_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="card">
        {rows.length === 0 && <Empty text="还没有活动。请先到线索或商机里记录跟进。" />}
        <div className="timeline">
          {rows.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Pill value={item.type} label={labelOf(ACTIVITY_TYPES, item.type)} />
                <b>{item.title}</b>
              </div>
              <div>{item.description}</div>
              <div className="muted">
                {item.relatedName} · {item.ownerName} · {formatDateTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
