import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  ACTIVITY_TYPES,
  COUNTRY_CODES,
  LEAD_CATEGORIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  NAME_HINT,
  labelOf,
} from '../constants'
import { Field, Modal, MoneyField, PhoneField, Pill } from '../components/ui'
import { TrackerFields } from '../components/TrackerFields'
import { QuickActivity, QuickTask } from '../components/FollowUp'
import { activitySortValue, agingLabel, currentSchedule, formatDate, formatDateTime, suggestedLeadName } from '../utils'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, activities, tasks, update, create, convertLead } = useData()
  const lead = leads.find((item) => item.id === id)
  const [convertOpen, setConvertOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
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
    category: 'dc-capacity',
    country: 'SG',
    schedule: currentSchedule(),
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
      category: lead.category || 'dc-capacity',
      country: lead.country || lead.phoneCountry || 'SG',
      schedule: lead.schedule || currentSchedule(),
    })
  }, [lead?.id])

  useEffect(() => {
    if (lead?.status) setForm((prev) => ({ ...prev, status: lead.status }))
  }, [lead?.status])

  const relatedActivities = useMemo(
    () =>
      activities
        .filter((item) => item.relatedType === 'lead' && item.relatedId === id)
        .slice()
        .sort((a, b) => activitySortValue(b) - activitySortValue(a)),
    [activities, id]
  )
  const relatedTasks = useMemo(
    () => tasks.filter((item) => item.relatedType === 'lead' && item.relatedId === id),
    [tasks, id]
  )

  const suggestion = suggestedLeadName({
    company: form.company,
    country: form.country,
    category: labelOf(LEAD_CATEGORIES, form.category),
    schedule: form.schedule,
  })

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
    if (!confirmed) {
      alert('Please confirm this lead should become an opportunity.')
      return
    }
    setBusy(true)
    try {
      const data = Object.fromEntries(new FormData(e.target))
      data.currency = dealCurrency
      data.value = dealAmount
      await update('leads', lead.id, form)
      await convertLead({ ...lead, ...form }, data)
      setDealCurrency('')
      setDealAmount('')
      setConfirmed(false)
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
            {lead.company || 'No company yet'} · {lead.ownerName} · Aging {agingLabel(lead.createdAt)}
          </p>
          <div className="flow">
            <span>New lead</span>
            <span>Sales follow-up</span>
            <span>Qualified?</span>
            <span>Confirm opportunity</span>
            <span>Pipeline</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {lead.status !== 'converted' && (
            <button className="btn gold" onClick={() => {
              setDealCurrency('')
              setDealAmount('')
              setConfirmed(false)
              setConvertOpen(true)
            }}>
              Convert to Opportunity
            </button>
          )}
          <button className="btn" onClick={save}>
            Save
          </button>
        </div>
      </div>

      {lead.status === 'converted' && (
        <div className="card" style={{ marginBottom: 16 }}>
          Converted to an opportunity. View the
          <Link to={`/companies/${lead.convertedCompanyId}`}> company </Link>
          and the
          <Link to="/pipeline"> pipeline</Link>.
        </div>
      )}

      <div className="grid two">
        <div className="card">
          <h3>Lead details</h3>
          <div className="form-grid">
            <div>
              <Field label="Name" hint={NAME_HINT}>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill value={lead.status} label={labelOf(LEAD_STATUSES, lead.status)} />
            <Pill value={form.category} label={labelOf(LEAD_CATEGORIES, form.category)} />
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
                <div className="muted">{formatDate(item.activityDate) !== '—' ? formatDate(item.activityDate) : formatDateTime(item.createdAt)}</div>
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
        <Modal title="Convert to opportunity" onClose={() => setConvertOpen(false)}>
          <p className="muted">
            Confirm this lead first. After confirmation it becomes an opportunity and appears in the pipeline.
          </p>
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
              <Field label="Project / opportunity name">
                <input name="dealName" defaultValue={lead.name || `${lead.company || lead.name} opportunity`} required />
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
              <Field label="Next step">
                <input name="nextStep" placeholder="e.g. Send proposal" />
              </Field>
              <Field label="Probability %">
                <input name="probability" type="number" min="0" max="100" defaultValue="20" />
              </Field>
            </div>
            <TrackerFields
              named
              values={{
                endUser: lead.company || '',
                deliverySchedule: lead.schedule || '',
              }}
            />
            <label className="confirm-check">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} required />
              I confirm this lead is qualified and should become an opportunity.
            </label>
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setConvertOpen(false)}>
                Cancel
              </button>
              <button className="btn gold" disabled={busy || !confirmed}>
                {busy ? 'Converting...' : 'Confirm convert'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
