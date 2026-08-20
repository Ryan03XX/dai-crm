export const LEAD_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'unqualified', label: 'Unqualified' },
  { id: 'converted', label: 'Converted' },
]

export const DEAL_STAGES = [
  { id: 'qualification', label: 'Qualification' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
]

export const LEAD_SOURCES = ['Website', 'Referral', 'Event', 'Call', 'Social', 'Others']

export const ACTIVITY_TYPES = [
  { id: 'call', label: 'Call' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'note', label: 'Note' },
  { id: 'followup', label: 'Follow-up' },
]

export const TASK_STATUSES = [
  { id: 'open', label: 'Open' },
  { id: 'done', label: 'Done' },
]

export function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label || id
}
