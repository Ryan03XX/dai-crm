import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { LEAD_SOURCES, LEAD_STATUSES, labelOf } from '../constants'
import { Field, Modal, Pill } from '../components/ui'

const emptyLead = {
  name: '',
  company: '',
  phone: '',
  email: '',
  source: '网站',
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
          <h1>线索</h1>
          <p>Add / Edit / View Lead · 核心流程从这里开始</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          新建线索
        </button>
      </div>

      <div className="toolbar">
        <input placeholder="筛选姓名 / 公司 / 电话" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">全部状态</option>
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
              <th>姓名</th>
              <th>公司</th>
              <th>电话</th>
              <th>Email</th>
              <th>来源</th>
              <th>负责人</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                <td>{lead.name}</td>
                <td>{lead.company || '—'}</td>
                <td>{lead.phone || '—'}</td>
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
        <Modal title="新建线索" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="姓名">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="公司">
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="电话">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="来源">
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
