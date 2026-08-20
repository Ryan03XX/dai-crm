import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Field, Modal } from '../components/ui'

const emptyCompany = { name: '', industry: '', phone: '', email: '', website: '', address: '' }

export default function Companies() {
  const { companies, contacts, deals, create } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyCompany)
  const navigate = useNavigate()

  async function save(e) {
    e.preventDefault()
    const id = await create('companies', form)
    setOpen(false)
    setForm(emptyCompany)
    navigate(`/companies/${id}`)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Companies</h1>
          <p>Company profile, plus contacts and deals under each company</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          New company
        </button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Phone</th>
              <th>Contacts</th>
              <th>Deals</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="clickable" onClick={() => navigate(`/companies/${company.id}`)}>
                <td>{company.name}</td>
                <td>{company.industry || '—'}</td>
                <td>{company.phone || '—'}</td>
                <td>{contacts.filter((c) => c.companyId === company.id).length}</td>
                <td>{deals.filter((d) => d.companyId === company.id).length}</td>
                <td>{company.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="New company" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Company name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Industry">
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Website" className="full">
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </Field>
              <Field label="Address" className="full">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
