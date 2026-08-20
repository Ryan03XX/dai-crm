import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { ACTIVITY_TYPES, LEAD_SOURCES, LEAD_STATUSES, labelOf } from '../constants'
import { Field, Modal, MoneyField, PhoneField, Pill } from '../components/ui'
import { QuickActivity, QuickTask } from '../components/FollowUp'
import { formatDateTime } from '../utils'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, activities, tasks, update, create, convertLead } = useData()
  const lead = leads.find((item) => item.id === id)
  const [convertOpen, setConvertOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dealCurrency, setDealCurrency] = useState('')
  const [dealAmount, setDealAmount] = useState('')
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    phoneCountry: 'SG',
    email: '',
    source: 'Website',
    status: 'new',
  })

  useEffect(() => {
    if (!lead) return
    setForm({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      phoneCountry: lead.phoneCountry || 'SG',
      email: lead.email || '',
      source: lead.source || 'Website',
      status: lead.status || 'new',
    })
  }, [lead?.id])

  useEffect(() => {
    if (lead?.status) setForm((prev) => ({ ...prev, status: lead.status }))
  }, [lead?.status])

  const relatedActivities = useMemo(
    () => activities.filter((item) => item.relatedType === 'lead' && item.relatedId === id),
    [activities, id]
  )
  const relatedTasks = useMemo(
    () => tasks.filter((item) => item.relatedType === 'lead' && item.relatedId === id),
    [tasks, id]
  )

  if (!lead) return <p>Lead not found or still loading...</p>

  async function save() {
    await update('leads', lead.id, form)
  }

  async function addActivity(payload) {
    await create('activities', {
      ...payload,
      relatedType: 'lead',
      relatedId: lead.id,
      relatedName: lead.name,
    })
    if (lead.status === 'new') {
      await update('leads', lead.id, { status: 'contacted' })
    }
  }

  async function addTask(payload) {
    await create('tasks', {
      ...payload,
      relatedType: 'lead',
      relatedId: lead.id,
      relatedName: lead.name,
    })
  }

  async function handleConvert(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const data = Object.fromEntries(new FormData(e.target))
      data.currency = dealCurrency
      data.value = dealAmount
      await convertLead(lead, data)
      setDealCurrency('')
      setDealAmount('')
      navigate('/pipeline')
    } catch (err) {
      alert(err.message || 'Unable to convert this lead')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{lead.name}</h1>
          <p>
            {lead.company || 'No company yet'} · {lead.ownerName}
          </p>
          <div className="flow">
            <span>New lead</span>
            <span>Sales follow-up</span>
            <span>Qualified?</span>
            <span>Convert</span>
            <span>Deal pipeline</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {lead.status !== 'converted' && (
            <button className="btn gold" onClick={() => {
              setDealCurrency('')
              setDealAmount('')
              setConvertOpen(true)
            }}>
              Convert to Company + Contact + Deal
            </button>
          )}
          <button className="btn" onClick={save}>
            Save
          </button>
        </div>
      </div>

      {lead.status === 'converted' && (
        <div className="card" style={{ marginBottom: 16 }}>
          Converted. View the
          <Link to={`/companies/${lead.convertedCompanyId}`}> company </Link>
          and the
          <Link to="/pipeline"> pipeline</Link>.
        </div>
      )}

      <div className="grid two">
        <div className="card">
          <h3>Lead details</h3>
          <div className="form-grid">
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Source">
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {LEAD_SOURCES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                disabled={lead.status === 'converted'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {LEAD_STATUSES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pill value={lead.status} label={labelOf(LEAD_STATUSES, lead.status)} />
          </div>
        </div>

        <div className="card">
          <h3>Follow-up activities / tasks</h3>
          <QuickActivity onSubmit={addActivity} />
          <QuickTask onSubmit={addTask} defaultTitle={`Follow up ${lead.name} tomorrow`} />
          <div className="timeline" style={{ marginTop: 16 }}>
            {relatedActivities.map((item) => (
              <div className="timeline-item" key={item.id}>
                <b>
                  {labelOf(ACTIVITY_TYPES, item.type)} · {item.title}
                </b>
                <div className="muted">{item.description}</div>
                <div className="muted">{formatDateTime(item.createdAt)}</div>
              </div>
            ))}
            {relatedTasks.map((item) => (
              <div className="timeline-item" key={item.id}>
                <b>Task · {item.title}</b>
                <div className="muted">Due {item.dueDate || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {convertOpen && (
        <Modal title="Convert lead" onClose={() => setConvertOpen(false)}>
          <p className="muted">This creates a company, contact and deal, then sends the deal into the pipeline.</p>
          <form onSubmit={handleConvert}>
            <div className="form-grid">
              <Field label="Company name">
                <input name="companyName" defaultValue={lead.company || lead.name} required />
              </Field>
              <Field label="Contact">
                <input name="contactName" defaultValue={lead.name} required />
              </Field>
              <Field label="Position">
                <input name="position" placeholder="e.g. Sales Manager" />
              </Field>
              <Field label="Deal name">
                <input name="dealName" defaultValue={`${lead.company || lead.name} deal`} required />
              </Field>
              <MoneyField
                currency={dealCurrency}
                amount={dealAmount}
                onCurrencyChange={setDealCurrency}
                onAmountChange={setDealAmount}
              />
              <Field label="Expected close date">
                <input name="expectedCloseDate" type="date" />
              </Field>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setConvertOpen(false)}>
                Cancel
              </button>
              <button className="btn gold" disabled={busy}>
                {busy ? 'Converting...' : 'Confirm convert'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
