import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, labelOf } from '../constants'
import { Field, Modal, MoneyField, NewButton, Pill } from '../components/ui'
import { moneyOf, formatDate } from '../utils'
import { QuickActivity, QuickTask } from '../components/FollowUp'

const emptyDeal = {
  name: '',
  currency: '',
  value: '',
  companyId: '',
  contactId: '',
  stage: 'qualification',
  expectedCloseDate: '',
}

export default function Deals() {
  const { deals, companies, contacts, activities, create, update } = useData()
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('id')
  const selected = deals.find((d) => d.id === selectedId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyDeal)
  const related = useMemo(
    () => activities.filter((item) => item.relatedType === 'deal' && item.relatedId === selectedId),
    [activities, selectedId]
  )

  async function save(e) {
    e.preventDefault()
    const company = companies.find((c) => c.id === form.companyId)
    const contact = contacts.find((c) => c.id === form.contactId)
    await create('deals', {
      ...form,
      currency: form.currency,
      value: Number(form.value || 0),
      companyName: company?.name || '',
      contactName: contact?.name || '',
    })
    setOpen(false)
    setForm(emptyDeal)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Deals</h1>
          <p>Deal name, customer, value, owner and expected close date</p>
        </div>
        <NewButton onClick={() => setOpen(true)}>New deal</NewButton>
      </div>

      <div className="grid two">
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Deal</th>
                <th>Customer</th>
                <th>Value</th>
                <th>Owner</th>
                <th>Expected close</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="clickable" onClick={() => setParams({ id: deal.id })}>
                  <td>{deal.name}</td>
                  <td>{deal.companyName || '—'}</td>
                  <td>{moneyOf(deal)}</td>
                  <td>{deal.ownerName}</td>
                  <td>{formatDate(deal.expectedCloseDate)}</td>
                  <td>
                    <Pill value={deal.stage} label={labelOf(DEAL_STAGES, deal.stage)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          {selected ? (
            <>
              <h3>{selected.name}</h3>
              <p className="muted">
                {selected.companyName} · {selected.contactName} · {moneyOf(selected)}
              </p>
              <Field label="Stage">
                <select value={selected.stage} onChange={(e) => update('deals', selected.id, { stage: e.target.value })}>
                  {DEAL_STAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
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
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Select a deal to view details, or drag stages on the pipeline.</p>
          )}
        </div>
      </div>

      {open && (
        <Modal title="New deal" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Deal name" className="full">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Customer company">
                <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
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
              <MoneyField
                currency={form.currency}
                amount={form.value}
                onCurrencyChange={(currency) => setForm({ ...form, currency })}
                onAmountChange={(value) => setForm({ ...form, value })}
              />
              <Field label="Expected close date">
                <input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
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
