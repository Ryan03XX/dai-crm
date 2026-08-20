import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, labelOf } from '../constants'
import { Field, PhoneField, PhoneText, Pill } from '../components/ui'
import { moneyOf } from '../utils'
import { QuickActivity, QuickTask } from '../components/FollowUp'

export default function CompanyDetail() {
  const { id } = useParams()
  const { companies, contacts, deals, update, create } = useData()
  const company = companies.find((item) => item.id === id)
  const [form, setForm] = useState({
    name: '',
    industry: '',
    phone: '',
    phoneCountry: 'SG',
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
      phoneCountry: company.phoneCountry || 'SG',
      email: company.email || '',
      website: company.website || '',
      address: company.address || '',
    })
  }, [company?.id])

  if (!company) return <p>Company not found or still loading...</p>

  async function save() {
    await update('companies', company.id, form)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{company.name}</h1>
          <p>
            Company profile · {people.length} contacts · {companyDeals.length} deals
          </p>
        </div>
        <button className="btn" onClick={save}>
          Save
        </button>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Company details</h3>
          <div className="form-grid">
            <Field label="Company name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Industry">
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </Field>
            <PhoneField
              country={form.phoneCountry}
              number={form.phone}
              onCountryChange={(phoneCountry) => setForm({ ...form, phoneCountry })}
              onNumberChange={(phone) => setForm({ ...form, phone })}
            />
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
        </div>
        <div className="card">
          <h3>Follow-up</h3>
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
            defaultTitle={`Follow up ${company.name}`}
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
          <h3>Contacts</h3>
          {people.length === 0 && <p className="muted">No contacts yet</p>}
          {people.map((person) => (
            <div key={person.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <b>{person.name}</b>
              <div className="muted">
                {person.position || 'No position'} · {person.phone ? <PhoneText record={person} /> : person.email}
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Deals</h3>
          {companyDeals.map((deal) => (
            <div key={deal.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <Link to={`/deals?id=${deal.id}`}>
                <b>{deal.name}</b>
              </Link>
              <div className="muted">
                {moneyOf(deal)} · <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
