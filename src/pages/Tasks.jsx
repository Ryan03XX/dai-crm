import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { TASK_STATUSES, labelOf } from '../constants'
import { formatDate, isOverdue } from '../utils'
import { Empty, Field, Modal, Pill } from '../components/ui'

export default function Tasks() {
  const { tasks, create, update } = useData()
  const [status, setStatus] = useState('open')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', dueDate: '', status: 'open' })

  const rows = useMemo(
    () => tasks.filter((item) => status === 'all' || item.status === status),
    [tasks, status]
  )

  async function save(e) {
    e.preventDefault()
    await create('tasks', { ...form, relatedType: '', relatedId: '', relatedName: '' })
    setOpen(false)
    setForm({ title: '', dueDate: '', status: 'open' })
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>任务</h1>
          <p>Follow-up Task + Due Date + Status</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          新建任务
        </button>
      </div>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="open">待办</option>
          <option value="done">已完成</option>
          <option value="all">全部</option>
        </select>
      </div>
      <div className="card table-wrap">
        {rows.length === 0 && <Empty text="没有任务" />}
        <table>
          <thead>
            <tr>
              <th>任务</th>
              <th>关联</th>
              <th>到期日</th>
              <th>负责人</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.relatedName || '—'}</td>
                <td>{formatDate(task.dueDate)}</td>
                <td>{task.ownerName}</td>
                <td>
                  <button
                    className="ghost"
                    onClick={() => update('tasks', task.id, { status: task.status === 'done' ? 'open' : 'done' })}
                  >
                    <Pill
                      value={isOverdue(task.dueDate, task.status) ? 'lost' : task.status}
                      label={
                        isOverdue(task.dueDate, task.status) ? '逾期' : labelOf(TASK_STATUSES, task.status)
                      }
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="新建任务" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="任务" className="full">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="明天 Follow Up ABC Customer"
                  required
                />
              </Field>
              <Field label="Due Date">
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </Field>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setOpen(false)}>
                取消
              </button>
              <button className="btn">保存</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
