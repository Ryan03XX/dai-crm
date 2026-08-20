import { useState } from 'react'
import { ACTIVITY_TYPES } from '../constants'
import { Field } from './ui'

export function QuickActivity({ onSubmit }) {
  const [type, setType] = useState('followup')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({ type, title, description })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: 12 }}>
      <Field label="类型">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {ACTIVITY_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="标题">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="例如 电话沟通需求" />
      </Field>
      <Field label="内容" className="full">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <div>
        <button className="btn light">记录活动</button>
      </div>
    </form>
  )
}

export function QuickTask({ onSubmit, defaultTitle = '' }) {
  const [title, setTitle] = useState(defaultTitle)
  const [dueDate, setDueDate] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({ title, dueDate, status: 'open' })
    setTitle(defaultTitle)
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <Field label="Follow-up Task">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Due Date">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </Field>
      <div>
        <button className="btn light">添加任务</button>
      </div>
    </form>
  )
}
