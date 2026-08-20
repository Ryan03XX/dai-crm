import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Field, Modal } from '../components/ui'

const emptyContact = { name: '', position: '', phone: '', email: '', companyId: '' }

export default function Contacts() {
  const { contacts, companies, create } = useData()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(emptyContact)
  const navigate = useNavigate()

  const rows = contacts.filter((c) => `${c.name} ${c.email} ${c.companyName}`.toLowerCase().includes(q.toLowerCase()))

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
          <h1>联系人</h1>
          <p>Contact Name、Position、Phone、Email、Company</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          新建联系人
        </button>
      </div>
      <div className="toolbar">
        <input placeholder="筛选联系人" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>职位</th>
              <th>电话</th>
              <th>Email</th>
              <th>公司</th>
              <th>负责人</th>
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
                <td>{contact.phone || '—'}</td>
                <td>{contact.email || '—'}</td>
                <td>{contact.companyName || '—'}</td>
                <td>{contact.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="新建联系人" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="姓名">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="职位">
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </Field>
              <Field label="电话">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="公司" className="full">
                <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                  <option value="">未选择</option>
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
