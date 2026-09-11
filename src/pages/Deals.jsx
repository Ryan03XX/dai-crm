import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, LEAD_CATEGORIES, NAME_HINT, TRACKER_EMPTY, TRACKER_GROUPS, labelOf } from '../constants'
import { CountryField, Field, Modal, MoneyField, NewButton, Pill } from '../components/ui'
import { TrackerFields } from '../components/TrackerFields'
import { AttachmentPicker } from '../components/AttachmentPicker'
import { OpportunityModal } from '../components/OpportunityDetail'
import { deleteAttachmentFile, persistAttachments, revokeLocalUrl } from '../attachments'
import { agingLabel, countryPayload, currentSchedule, displayValue, isOpenDeal, moneyOf, opportunities, trackerFrom, valuePayload } from '../utils'

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

function formFromDeal(deal) {
  return {
    ...emptyDeal,
    name: deal.name || '',
    currency: deal.currency || '',
    value: deal.value ?? '',
    countryTbc: Boolean(deal.countryTbc),
    companyId: deal.companyId || '',
    contactId: deal.contactId || '',
    stage: deal.stage || 'qualification',
    expectedCloseDate: deal.expectedCloseDate || '',
    nextStep: deal.nextStep || '',
    probability: deal.probability ?? '20',
    category: deal.category || 'dc-capacity',
    country: deal.countryTbc ? '' : deal.country || 'SG',
    schedule: deal.schedule || currentSchedule(),
    ncp: deal.ncp || '',
    endUser: deal.endUser || '',
    gpuModel: deal.gpuModel || '',
    gpuQty: deal.gpuQty ?? '',
    oem: deal.oem || '',
    deliverySchedule: deal.deliverySchedule || '',
    dcVendor: deal.dcVendor || '',
    dcSite: deal.dcSite || '',
    capacityMw: deal.capacityMw ?? '',
    comments: deal.comments || '',
  }
}

export default function Deals() {
  const { deals, companies, contacts, create, update, remove } = useData()
  const { canEdit } = useAuth()
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('id')
  const stageFilter = params.get('filter')
  const selected = deals.find((d) => d.id === selectedId)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyDeal)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const opps = useMemo(() => {
    const rows = opportunities(deals)
    if (stageFilter === 'open') {
      return rows.filter(isOpenDeal)
    }
    if (stageFilter === 'won' || stageFilter === 'lost') {
      return rows.filter((deal) => deal.stage === stageFilter)
    }
    return rows
  }, [deals, stageFilter])

  const isAdd = modal === 'add'

  function closeModal() {
    files.filter((item) => item.local).forEach(revokeLocalUrl)
    setModal(null)
    setForm({ ...emptyDeal, schedule: currentSchedule() })
    setFiles([])
    setError('')
  }

  function openAdd() {
    setError('')
    setForm({ ...emptyDeal, schedule: currentSchedule() })
    setFiles([])
    setModal('add')
  }

  function openEdit(deal) {
    if (!canEdit(deal)) return
    setError('')
    setForm(formFromDeal(deal))
    setFiles(deal.attachments || [])
    setModal(deal)
  }

  function dealFields() {
    const company = companies.find((c) => c.id === form.companyId)
    const contact = contacts.find((c) => c.id === form.contactId)
    return {
      name: form.name,
      ...trackerFrom(form),
      gpuQty: commitTracker('gpuQty', form.gpuQty),
      capacityMw: commitTracker('capacityMw', form.capacityMw),
      currency: form.currency,
      ...valuePayload(form.value),
      ...countryPayload(form.country, form.countryTbc),
      probability: Number(form.probability || 0),
      companyId: form.companyId,
      contactId: form.contactId,
      companyName: company?.name || '',
      contactName: contact?.name || '',
      endUser: form.endUser || company?.name || '',
      stage: form.stage || 'qualification',
      expectedCloseDate: form.expectedCloseDate || '',
      nextStep: form.nextStep || '',
      category: form.category,
      isOpportunity: true,
    }
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fields = dealFields()
      if (isAdd) {
        const id = await create('deals', { ...fields, attachments: [] })
        const attachments = await persistAttachments(id, files, [])
        if (attachments.length) await update('deals', id, { attachments })
        setParams({ id })
      } else {
        if (!canEdit(modal)) throw new Error('You can only edit your own records')
        const attachments = await persistAttachments(modal.id, files, modal.attachments || [])
        await update('deals', modal.id, { ...fields, attachments })
        setParams({ id: modal.id, ...(stageFilter ? { filter: stageFilter } : {}) })
      }
      closeModal()
    } catch (err) {
      setError(err.message || 'Unable to save this opportunity')
    } finally {
      setBusy(false)
    }
  }

  async function deleteDeal(deal) {
    if (!canEdit(deal)) return
    if (!confirm(`Delete opportunity "${deal.name}"? This cannot be undone.`)) return
    await Promise.all((deal.attachments || []).map((item) => deleteAttachmentFile(item)))
    await remove('deals', deal.id)
    if (selectedId === deal.id) setParams(stageFilter ? { filter: stageFilter } : {})
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Opportunities</h1>
          <p>All opportunities are visible. Sales can edit and attach files on their own records only.</p>
        </div>
        <NewButton onClick={openAdd}>New opportunity</NewButton>
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
              <th>Actions</th>
            </tr>
            <tr className="col-row">
              {TRACKER_GROUPS.flatMap((group) =>
                group.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))
              )}
              <th>Actions</th>
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
                <td>
                  <div className="user-actions" onClick={(e) => e.stopPropagation()}>
                    {canEdit(deal) ? (
                      <>
                        <button type="button" className="btn light btn-small" onClick={() => openEdit(deal)}>
                          Edit
                        </button>
                        <button type="button" className="btn light btn-small" onClick={() => deleteDeal(deal)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="muted">View only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OpportunityModal
        deal={!modal ? selected : null}
        onClose={() => setParams(stageFilter ? { filter: stageFilter } : {})}
      />

      {modal && (
        <Modal title={isAdd ? 'New opportunity' : 'Edit opportunity'} onClose={closeModal}>
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
            <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn" disabled={busy}>
                {busy ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
