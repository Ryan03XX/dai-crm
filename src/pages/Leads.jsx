import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { COUNTRY_CODES, LEAD_CATEGORIES, LEAD_SOURCES, LEAD_STATUSES, NAME_HINT, labelOf } from '../constants'
import { Field, Modal, NewButton, PhoneField, PhoneText, Pill } from '../components/ui'
import { agingLabel, currentSchedule, suggestedLeadName } from '../utils'

const emptyLead = {
  name: '',
  company: '',
  phone: '',
  phoneCountry: 'SG',
  email: '',
  source: 'Website',
  status: 'new',
  category: 'dc-capacity',
  country: 'SG',
  schedule: currentSchedule(),
}

export default function Leads() {
  const { leads, create } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyLead)
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const rows = leads.filter((lead) => {
    const matchStatus = status === 'all' || lead.status === status
    const matchCategory = category === 'all' || lead.category === category
    const matchQ = `${lead.name} ${lead.company} ${lead.email} ${lead.phone} ${lead.category}`.toLowerCase().includes(q.toLowerCase())
    return matchStatus && matchCategory && matchQ
  })

  const suggestion = suggestedLeadName({
    company: form.company,
    country: form.country,
    category: labelOf(LEAD_CATEGORIES, form.category),
    schedule: form.schedule,
  })

  async function save(e) {
    e.preventDefault()
    const id = await create('leads', form)
    setOpen(false)
    setForm({ ...emptyLead, schedule: currentSchedule() })
    navigate(`/leads/${id}`)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p>Add, edit and view leads. Convert a confirmed lead into an opportunity.</p>
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
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">All categories</option>
          {LEAD_CATEGORIES.map((item) => (
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
              <th>Category</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Aging</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                <td>{lead.name}</td>
                <td>{lead.company || '—'}</td>
                <td>{labelOf(LEAD_CATEGORIES, lead.category) || '—'}</td>
                <td><PhoneText record={lead} /></td>
                <td>{lead.email || '—'}</td>
                <td>{agingLabel(lead.createdAt)}</td>
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
              <div>
                <Field label="Name" hint={NAME_HINT}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    title={NAME_HINT}
                  />
                </Field>
                <button type="button" className="linkish suggest-name" onClick={() => setForm({ ...form, name: suggestion })}>
                  Use suggested name: {suggestion}
                </button>
              </div>
              <Field label="Company">
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {LEAD_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Country">
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.iso} value={item.iso}>
                      {item.iso} · {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Schedule (MMYY)">
                <input
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  placeholder="0926"
                  maxLength={4}
                />
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
