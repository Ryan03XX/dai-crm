import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { LEAD_SOURCES, LEAD_STATUSES, labelOf } from '../constants'
import { Field, Modal, NewButton, PhoneField, PhoneText, Pill } from '../components/ui'

const emptyLead = {
  name: '',
  company: '',
  phone: '',
  phoneCountry: 'SG',
  email: '',
  source: 'Website',
  status: 'new',
}

export default function Leads() {
  const { leads, create } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyLead)
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const rows = leads.filter((lead) => {
    const matchStatus = status === 'all' || lead.status === status
    const matchQ = `${lead.name} ${lead.company} ${lead.email} ${lead.phone}`.toLowerCase().includes(q.toLowerCase())
    return matchStatus && matchQ
  })

  async function save(e) {
    e.preventDefault()
    const id = await create('leads', form)
    setOpen(false)
    setForm(emptyLead)
    navigate(`/leads/${id}`)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p>Add, edit and view leads. This is where the sales flow starts.</p>
        </div>
        <NewButton onClick={() => setOpen(true)}>New lead</NewButton>
      </div>

      <div className="toolbar">
        <input placeholder="Filter by name / company / phone" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                <td>{lead.name}</td>
                <td>{lead.company || '—'}</td>
                <td><PhoneText record={lead} /></td>
                <td>{lead.email || '—'}</td>
                <td>{lead.source}</td>
                <td>{lead.ownerName}</td>
                <td>
                  <Pill value={lead.status} label={labelOf(LEAD_STATUSES, lead.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="New lead" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Company">
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </Field>
              <PhoneField
                country={form.phoneCountry}
                number={form.phone}
                onCountryChange={(phoneCountry) => setForm({ ...form, phoneCountry })}
                onNumberChange={(phone) => setForm({ ...form, phone })}
              />
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Source">
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  {LEAD_SOURCES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {LEAD_STATUSES.filter((s) => s.id !== 'converted').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
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
