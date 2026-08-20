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
          <h1>公司</h1>
          <p>公司资料，以及下面的联系人和商机</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          新建公司
        </button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>公司</th>
              <th>行业</th>
              <th>电话</th>
              <th>联系人</th>
              <th>商机</th>
              <th>负责人</th>
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
        <Modal title="新建公司" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="公司名称">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="行业">
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </Field>
              <Field label="电话">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="网站" className="full">
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </Field>
              <Field label="地址" className="full">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
