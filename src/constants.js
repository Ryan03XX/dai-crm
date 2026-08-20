export const LEAD_STATUSES = [
  { id: 'new', label: '新线索' },
  { id: 'contacted', label: '已跟进' },
  { id: 'qualified', label: '已合格' },
  { id: 'unqualified', label: '不合格' },
  { id: 'converted', label: '已转化' },
]

export const DEAL_STAGES = [
  { id: 'qualification', label: '资格确认' },
  { id: 'proposal', label: '方案报价' },
  { id: 'negotiation', label: '商务谈判' },
  { id: 'won', label: '赢单' },
  { id: 'lost', label: '丢单' },
]

export const LEAD_SOURCES = ['网站', '转介绍', '展会', '电话', '社交', '其他']

export const ACTIVITY_TYPES = [
  { id: 'call', label: '电话' },
  { id: 'meeting', label: '会议' },
  { id: 'note', label: '备注' },
  { id: 'followup', label: '跟进' },
]

export const TASK_STATUSES = [
  { id: 'open', label: '待办' },
  { id: 'done', label: '已完成' },
]

export function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label || id
}
