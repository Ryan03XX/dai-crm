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

export const CURRENCIES = [
  { id: 'SGD', label: 'SGD' },
  { id: 'MYR', label: 'MYR' },
  { id: 'USD', label: 'USD' },
]

export const COUNTRY_CODES = [
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'VN', name: 'Vietnam', dial: '+84' },
  { iso: 'BN', name: 'Brunei', dial: '+673' },
  { iso: 'KH', name: 'Cambodia', dial: '+855' },
  { iso: 'MM', name: 'Myanmar', dial: '+95' },
  { iso: 'LA', name: 'Laos', dial: '+856' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'MO', name: 'Macau', dial: '+853' },
  { iso: 'TW', name: 'Taiwan', dial: '+886' },
  { iso: 'JP', name: 'Japan', dial: '+81' },
  { iso: 'KR', name: 'South Korea', dial: '+82' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'FR', name: 'France', dial: '+33' },
]

export const DEFAULT_PHONE_COUNTRY = 'SG'

export function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label || id
}
