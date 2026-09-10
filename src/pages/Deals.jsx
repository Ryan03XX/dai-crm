import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, LEAD_CATEGORIES, NAME_HINT, TRACKER_EMPTY, TRACKER_GROUPS, labelOf } from '../constants'
import { CountryField, Field, Modal, MoneyField, NewButton, Pill } from '../components/ui'
import { TrackerFields } from '../components/TrackerFields'
import { activitySortValue, agingLabel, countryPayload, currentSchedule, displayValue, formatDate, moneyOf, opportunities, trackerFrom, valuePayload } from '../utils'
import { QuickActivity, QuickTask } from '../components/FollowUp'

const emptyDeal = {
  name: '',
  currency: '',
  value: '',
  countryTbc: false,
  companyId: '',
  contactId: '',
  stage: 'qualification',
  expectedCloseDate: '',
  nextStep: '',
  probability: '20',
  category: 'dc-capacity',
  country: 'SG',
  schedule: currentSchedule(),
  ...TRACKER_EMPTY,
}

function trackerValue(deal, key) {
  if (key === 'endUser') return displayValue(deal.endUser || deal.companyName)
  if (key === 'country') return deal.countryTbc ? 'TBC' : displayValue(deal.country)
  if (key === 'stage') return <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
  if (key === 'value') return moneyOf(deal)
  if (key === 'aging') return agingLabel(deal.createdAt)
  return displayValue(deal[key])
}

function commitTracker(key, value) {
  if (key === 'gpuQty' || key === 'capacityMw') {
    return value === '' ? '' : Number(value)
  }
  return value
}

export default function Deals() {
  const { deals, companies, contacts, activities, create, update } = useData()
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('id')
  const stageFilter = params.get('filter')
  const selected = deals.find((d) => d.id === selectedId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyDeal)
  const opps = useMemo(() => {
    const rows = opportunities(deals)
    if (stageFilter === 'won' || stageFilter === 'lost') {
      return rows.filter((deal) => deal.stage === stageFilter)
    }
    return rows
  }, [deals, stageFilter])
  const related = useMemo(
    () =>
      activities
        .filter((item) => item.relatedType === 'deal' && item.relatedId === selectedId)
        .slice()
        .sort((a, b) => activitySortValue(b) - activitySortValue(a)),
    [activities, selectedId]
  )

  async function save(e) {
    e.preventDefault()
    const company = companies.find((c) => c.id === form.companyId)
    const contact = contacts.find((c) => c.id === form.contactId)
    await create('deals', {
      ...form,
      ...trackerFrom(form),
      gpuQty: commitTracker('gpuQty', form.gpuQty),
      capacityMw: commitTracker('capacityMw', form.capacityMw),
      currency: form.currency,
      ...valuePayload(form.value),
      ...countryPayload(form.country, form.countryTbc),
      probability: Number(form.probability || 0),
      companyName: company?.name || '',
      contactName: contact?.name || '',
      endUser: form.endUser || company?.name || '',
      isOpportunity: true,
    })
    setOpen(false)
    setForm({ ...emptyDeal, schedule: currentSchedule() })
  }

  async function saveSelected(payload) {
    if (!selected) return
    await update('deals', selected.id, payload)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Opportunities</h1>
          <p>Tracker view matching project, data center and project management fields</p>
        </div>
        <NewButton onClick={() => setOpen(true)}>New opportunity</NewButton>
      </div>

      {stageFilter && (
        <div className="toolbar">
          <span className="muted">Showing {stageFilter} opportunities.</span>
          <button type="button" className="linkish" onClick={() => setParams(selectedId ? { id: selectedId } : {})}>
            Clear filter
          </button>
        </div>
      )}

      <div className="card table-wrap">
        <table className="tracker-table">
          <thead>
            <tr className="group-row">
              {TRACKER_GROUPS.map((group) => (
                <th key={group.id} colSpan={group.columns.length}>
                  {group.label}
                </th>
              ))}
            </tr>
            <tr className="col-row">
              {TRACKER_GROUPS.flatMap((group) =>
                group.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {opps.map((deal) => (
              <tr
                key={deal.id}
                className={`clickable ${selectedId === deal.id ? 'selected' : ''}`}
                onClick={() => setParams({ id: deal.id, ...(stageFilter ? { filter: stageFilter } : {}) })}
              >
                {TRACKER_GROUPS.flatMap((group) =>
                  group.columns.map((col) => (
                    <td key={col.key}>{trackerValue(deal, col.key)}</td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {selected ? (
          <>
            <h3>{selected.name}</h3>
            <p className="muted">
              {selected.endUser || selected.companyName} · {selected.contactName} · {moneyOf(selected)} · Aging {agingLabel(selected.createdAt)}
            </p>
            <div className="form-grid">
              <Field label="Stage">
                <select
                  value={selected.stage}
                  onChange={(e) => saveSelected({ stage: e.target.value, stageEnteredAt: new Date().toISOString() })}
                >
                  {DEAL_STAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Next step">
                <input
                  defaultValue={selected.nextStep || ''}
                  key={`${selected.id}-next`}
                  onBlur={(e) => saveSelected({ nextStep: e.target.value })}
                />
              </Field>
              <Field label="Probability %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selected.probability || ''}
                  key={`${selected.id}-prob`}
                  onBlur={(e) => saveSelected({ probability: Number(e.target.value || 0) })}
                />
              </Field>
              <Field label="Expected close">
                <input
                  type="date"
                  defaultValue={selected.expectedCloseDate || ''}
                  key={`${selected.id}-close`}
                  onBlur={(e) => saveSelected({ expectedCloseDate: e.target.value })}
                />
              </Field>
              <CountryField
                country={selected.countryTbc ? '' : selected.country || ''}
                tbc={Boolean(selected.countryTbc)}
                onCountryChange={(country) => saveSelected(countryPayload(country, false))}
                onTbcChange={(countryTbc) => saveSelected(countryPayload(selected.country, countryTbc))}
              />
              <MoneyField
                currency={selected.currency || ''}
                amount={selected.value ?? ''}
                required={!selected.countryTbc}
                onCurrencyChange={(currency) => saveSelected({ currency })}
                onAmountChange={(value) => saveSelected(valuePayload(value))}
              />
            </div>
            <TrackerFields
              key={selected.id}
              values={selected}
              onCommit={(key, value) => saveSelected({ [key]: commitTracker(key, value) })}
            />
            <div style={{ marginTop: 16 }}>
              <QuickActivity
                onSubmit={(payload) =>
                  create('activities', {
                    ...payload,
                    relatedType: 'deal',
                    relatedId: selected.id,
                    relatedName: selected.name,
                  })
                }
              />
              <QuickTask
                defaultTitle={`Follow up ${selected.name}`}
                onSubmit={(payload) =>
                  create('tasks', {
                    ...payload,
                    relatedType: 'deal',
                    relatedId: selected.id,
                    relatedName: selected.name,
                  })
                }
              />
            </div>
            <div className="timeline">
              {related.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <b>{item.title}</b>
                  <div className="muted">{item.description}</div>
                  <div className="muted">{formatDate(item.activityDate || item.createdAt)}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">Select an opportunity to edit tracker details, or drag stages on the pipeline.</p>
        )}
      </div>

      {open && (
        <Modal title="New opportunity" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Project" className="full" hint={NAME_HINT}>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  title={NAME_HINT}
                />
              </Field>
              <Field label="Customer company">
                <select
                  value={form.companyId}
                  onChange={(e) => {
                    const companyId = e.target.value
                    const company = companies.find((c) => c.id === companyId)
                    setForm({
                      ...form,
                      companyId,
                      endUser: form.endUser || company?.name || '',
                    })
                  }}
                >
                  <option value="">Not selected</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Contact">
                <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
                  <option value="">Not selected</option>
                  {contacts
                    .filter((c) => !form.companyId || c.companyId === form.companyId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
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
              <CountryField
                country={form.country}
                tbc={form.countryTbc}
                onCountryChange={(country) => setForm({ ...form, country, countryTbc: false })}
                onTbcChange={(countryTbc) => setForm({ ...form, countryTbc })}
              />
              <MoneyField
                currency={form.currency}
                amount={form.value}
                required={!form.countryTbc}
                onCurrencyChange={(currency) => setForm({ ...form, currency })}
                onAmountChange={(value) => setForm({ ...form, value })}
              />
            </div>
            <TrackerFields values={form} onChange={(key, value) => setForm({ ...form, [key]: value })} />
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Expected close date">
                <input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                />
              </Field>
              <Field label="Probability %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.probability}
                  onChange={(e) => setForm({ ...form, probability: e.target.value })}
                />
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
