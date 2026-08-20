import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { TASK_STATUSES, labelOf } from '../constants'
import { formatDate, isOverdue } from '../utils'
import { Empty, Field, Modal, NewButton, Pill } from '../components/ui'

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
          <h1>Tasks</h1>
          <p>Follow-up task, due date and status</p>
        </div>
        <NewButton onClick={() => setOpen(true)}>New task</NewButton>
      </div>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="open">Open</option>
          <option value="done">Done</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="card table-wrap">
        {rows.length === 0 && <Empty text="No tasks" />}
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Related to</th>
              <th>Due date</th>
              <th>Owner</th>
              <th>Status</th>
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
                        isOverdue(task.dueDate, task.status) ? 'Overdue' : labelOf(TASK_STATUSES, task.status)
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
        <Modal title="New task" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Task" className="full">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Follow up ABC Customer tomorrow"
                  required
                />
              </Field>
              <Field label="Due date">
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </Field>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
