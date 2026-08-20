import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, labelOf } from '../constants'
import { Field, Pill } from '../components/ui'
import { money } from '../utils'
import { QuickActivity, QuickTask } from '../components/FollowUp'

export default function CompanyDetail() {
  const { id } = useParams()
  const { companies, contacts, deals, update, create } = useData()
  const company = companies.find((item) => item.id === id)
  const [form, setForm] = useState({
    name: '',
    industry: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  })
  const people = useMemo(() => contacts.filter((c) => c.companyId === id), [contacts, id])
  const companyDeals = useMemo(() => deals.filter((d) => d.companyId === id), [deals, id])

  useEffect(() => {
    if (!company) return
    setForm({
      name: company.name || '',
      industry: company.industry || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      address: company.address || '',
    })
  }, [company?.id])

  if (!company) return <p>公司不存在或正在加载...</p>

  async function save() {
    await update('companies', company.id, form)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{company.name}</h1>
          <p>
            Company Profile · 联系人 {people.length} · 商机 {companyDeals.length}
          </p>
        </div>
        <button className="btn" onClick={save}>
          保存
        </button>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>公司资料</h3>
          <div className="form-grid">
            <Field label="公司名称">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
        </div>
        <div className="card">
          <h3>跟进</h3>
          <QuickActivity
            onSubmit={(payload) =>
              create('activities', {
                ...payload,
                relatedType: 'company',
                relatedId: company.id,
                relatedName: company.name,
              })
            }
          />
          <QuickTask
            defaultTitle={`跟进 ${company.name}`}
            onSubmit={(payload) =>
              create('tasks', {
                ...payload,
                relatedType: 'company',
                relatedId: company.id,
                relatedName: company.name,
              })
            }
          />
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>联系人</h3>
          {people.length === 0 && <p className="muted">还没有联系人</p>}
          {people.map((person) => (
            <div key={person.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <b>{person.name}</b>
              <div className="muted">
                {person.position || '未填职位'} · {person.phone || person.email}
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>商机</h3>
          {companyDeals.map((deal) => (
            <div key={deal.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <Link to={`/deals?id=${deal.id}`}>
                <b>{deal.name}</b>
              </Link>
              <div className="muted">
                {money(deal.value)} · <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
