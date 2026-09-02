import { useState } from 'react'
import { ACTIVITY_TYPES } from '../constants'
import { todayInputDate } from '../utils'
import { Field } from './ui'

export function QuickActivity({ onSubmit }) {
  const [type, setType] = useState('followup')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityDate, setActivityDate] = useState(todayInputDate())

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({ type, title, description, activityDate: activityDate || todayInputDate() })
    setTitle('')
    setDescription('')
    setActivityDate(todayInputDate())
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: 12 }}>
      <Field label="Type">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {ACTIVITY_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
      </Field>
      <Field label="Title" className="full">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Called to understand requirements" />
      </Field>
      <Field label="Notes" className="full">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <div>
        <button className="btn light">Log activity</button>
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
      <Field label="Follow-up task">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Due date">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </Field>
      <div>
        <button className="btn light">Add task</button>
      </div>
    </form>
  )
}
