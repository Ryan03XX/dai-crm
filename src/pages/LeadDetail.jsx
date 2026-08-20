import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { ACTIVITY_TYPES, LEAD_SOURCES, LEAD_STATUSES, labelOf } from '../constants'
import { Field, Modal, Pill } from '../components/ui'
import { QuickActivity, QuickTask } from '../components/FollowUp'
import { formatDateTime } from '../utils'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, activities, tasks, update, create, convertLead } = useData()
  const lead = leads.find((item) => item.id === id)
  const [convertOpen, setConvertOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    source: '网站',
    status: 'new',
  })

  useEffect(() => {
    if (!lead) return
    setForm({
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || '网站',
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

  if (!lead) return <p>线索不存在或正在加载...</p>

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
      await convertLead(lead, data)
      navigate('/pipeline')
    } catch (err) {
      alert(err.message || '转化失败')
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
            {lead.company || '未填公司'} · {lead.ownerName}
          </p>
          <div className="flow">
            <span>New Lead</span>
            <span>Sales Follow Up</span>
            <span>Qualified?</span>
            <span>Convert</span>
            <span>Deal Pipeline</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {lead.status !== 'converted' && (
            <button className="btn gold" onClick={() => setConvertOpen(true)}>
              转化为公司 + 联系人 + 商机
            </button>
          )}
          <button className="btn" onClick={save}>
            保存
          </button>
        </div>
      </div>

      {lead.status === 'converted' && (
        <div className="card" style={{ marginBottom: 16 }}>
          已转化。查看
          <Link to={`/companies/${lead.convertedCompanyId}`}> 公司 </Link>
          和
          <Link to="/pipeline"> 销售管道</Link>
        </div>
      )}

      <div className="grid two">
        <div className="card">
          <h3>线索资料</h3>
          <div className="form-grid">
            <Field label="姓名">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="公司">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label="电话">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="来源">
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
          <h3>跟进活动 / 任务</h3>
          <QuickActivity onSubmit={addActivity} />
          <QuickTask onSubmit={addTask} defaultTitle={`明天 Follow Up ${lead.name}`} />
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
                <b>任务 · {item.title}</b>
                <div className="muted">到期 {item.dueDate || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {convertOpen && (
        <Modal title="转化线索" onClose={() => setConvertOpen(false)}>
          <p className="muted">一次创建 Company + Contact + Deal，然后进入销售管道。</p>
          <form onSubmit={handleConvert}>
            <div className="form-grid">
              <Field label="公司名称">
                <input name="companyName" defaultValue={lead.company || lead.name} required />
              </Field>
              <Field label="联系人">
                <input name="contactName" defaultValue={lead.name} required />
              </Field>
              <Field label="职位">
                <input name="position" placeholder="例如 Sales Manager" />
              </Field>
              <Field label="商机名称">
                <input name="dealName" defaultValue={`${lead.company || lead.name} 商机`} required />
              </Field>
              <Field label="金额">
                <input name="value" type="number" min="0" defaultValue="0" required />
              </Field>
              <Field label="预计成交日">
                <input name="expectedCloseDate" type="date" />
              </Field>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn light" onClick={() => setConvertOpen(false)}>
                取消
              </button>
              <button className="btn gold" disabled={busy}>
                {busy ? '转化中...' : '确认转化'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
