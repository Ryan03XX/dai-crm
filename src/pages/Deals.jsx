import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { DEAL_STAGES, labelOf } from '../constants'
import { Field, Modal, Pill } from '../components/ui'
import { money, formatDate } from '../utils'
import { QuickActivity, QuickTask } from '../components/FollowUp'

const emptyDeal = {
  name: '',
  value: 0,
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
          <h1>商机</h1>
          <p>Deal Name、Customer、Value、Owner、Expected Close Date</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          新建商机
        </button>
      </div>

      <div className="grid two">
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>商机</th>
                <th>客户</th>
                <th>金额</th>
                <th>负责人</th>
                <th>预计成交</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="clickable" onClick={() => setParams({ id: deal.id })}>
                  <td>{deal.name}</td>
                  <td>{deal.companyName || '—'}</td>
                  <td>{money(deal.value)}</td>
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
                {selected.companyName} · {selected.contactName} · {money(selected.value)}
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
                  defaultTitle={`跟进 ${selected.name}`}
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
            <p className="muted">选择一条商机查看详情，或去销售管道拖拽 Stage。</p>
          )}
        </div>
      </div>

      {open && (
        <Modal title="新建商机" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="商机名称" className="full">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="客户公司">
                <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                  <option value="">未选择</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="联系人">
                <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
                  <option value="">未选择</option>
                  {contacts
                    .filter((c) => !form.companyId || c.companyId === form.companyId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="金额">
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </Field>
              <Field label="预计成交日">
                <input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                />
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
