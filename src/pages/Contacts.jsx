import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Field, Modal, NewButton, PhoneField, PhoneText } from '../components/ui'
import { formatPhone } from '../utils'

const emptyContact = { name: '', position: '', phone: '', phoneCountry: 'SG', email: '', companyId: '' }
const emptyCols = { name: '', position: '', phone: '', email: '', company: '', owner: '' }

function includesText(value, filter) {
  if (!filter.trim()) return true
  return String(value || '').toLowerCase().includes(filter.trim().toLowerCase())
}

export default function Contacts() {
  const { contacts, companies, create } = useData()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cols, setCols] = useState(emptyCols)
  const [form, setForm] = useState(emptyContact)
  const navigate = useNavigate()

  const rows = useMemo(
    () =>
      contacts.filter((c) => {
        const globalHaystack = `${c.name} ${c.position} ${c.phone} ${c.email} ${c.companyName} ${c.ownerName}`
        return (
          includesText(globalHaystack, q) &&
          includesText(c.name, cols.name) &&
          includesText(c.position, cols.position) &&
          includesText(formatPhone(c), cols.phone) &&
          includesText(c.email, cols.email) &&
          includesText(c.companyName, cols.company) &&
          includesText(c.ownerName, cols.owner)
        )
      }),
    [cols, contacts, q]
  )

  function setCol(key, value) {
    setCols((prev) => ({ ...prev, [key]: value }))
  }

  async function save(e) {
    e.preventDefault()
    const company = companies.find((item) => item.id === form.companyId)
    await create('contacts', { ...form, companyName: company?.name || '' })
    setOpen(false)
    setForm(emptyContact)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Contacts</h1>
          <p>Contact name, position, phone, email and company</p>
        </div>
        <NewButton onClick={() => setOpen(true)}>New contact</NewButton>
      </div>
      <div className="toolbar">
        <input
          placeholder="Free-form filter: name, company, phone, email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 420 }}
        />
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company</th>
              <th>Owner</th>
            </tr>
            <tr className="col-filters">
              <th>
                <input className="col-filter" placeholder="Filter name" value={cols.name} onChange={(e) => setCol('name', e.target.value)} />
              </th>
              <th>
                <input className="col-filter" placeholder="Filter position" value={cols.position} onChange={(e) => setCol('position', e.target.value)} />
              </th>
              <th>
                <input className="col-filter" placeholder="Filter phone" value={cols.phone} onChange={(e) => setCol('phone', e.target.value)} />
              </th>
              <th>
                <input className="col-filter" placeholder="Filter email" value={cols.email} onChange={(e) => setCol('email', e.target.value)} />
              </th>
              <th>
                <input className="col-filter" placeholder="Filter company" value={cols.company} onChange={(e) => setCol('company', e.target.value)} />
              </th>
              <th>
                <input className="col-filter" placeholder="Filter owner" value={cols.owner} onChange={(e) => setCol('owner', e.target.value)} />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((contact) => (
              <tr
                key={contact.id}
                className="clickable"
                onClick={() => contact.companyId && navigate(`/companies/${contact.companyId}`)}
              >
                <td>{contact.name}</td>
                <td>{contact.position || '—'}</td>
                <td><PhoneText record={contact} /></td>
                <td>{contact.email || '—'}</td>
                <td>{contact.companyName || '—'}</td>
                <td>{contact.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="New contact" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Position">
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
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
              <Field label="Company" className="full">
                <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                  <option value="">Not selected</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
