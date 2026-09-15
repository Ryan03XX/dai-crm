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

export const LEAD_CATEGORIES = [
  { id: 'dc-capacity', label: 'DC capacity' },
  { id: 'eu-compute', label: 'EU compute' },
  { id: 'asset-recovery', label: 'Asset recovery' },
  { id: 'others', label: 'Others' },
]

export const NAME_HINT =
  'Recommended format: Company_CountryCode_scope_MMYY. Example: Acme_SG_DC-capacity_0926'

export const TRACKER_GROUPS = [
  {
    id: 'project',
    label: 'Project Information',
    columns: [
      { key: 'name', label: 'Project' },
      { key: 'oNumber', label: 'O-No' },
      { key: 'ncp', label: 'NCP' },
      { key: 'endUser', label: 'End User' },
      { key: 'gpuModel', label: 'GPU Model' },
      { key: 'gpuQty', label: 'GPU Qty' },
      { key: 'oem', label: 'OEM' },
      { key: 'deliverySchedule', label: 'Delivery Schedule' },
    ],
  },
  {
    id: 'dc',
    label: 'Data Center Information',
    columns: [
      { key: 'dcVendor', label: 'DC Vendor' },
      { key: 'dcSite', label: 'DC Site (City + Site Name)' },
      { key: 'capacityMw', label: 'Capacity (MW)' },
    ],
  },
  {
    id: 'pm',
    label: 'Project Management',
    columns: [
      { key: 'comments', label: 'Comments' },
      { key: 'stage', label: 'Stage' },
      { key: 'value', label: 'Value' },
      { key: 'picName', label: 'PIC' },
      { key: 'aging', label: 'Aging' },
      { key: 'ownerName', label: 'Created by' },
    ],
  },
]

export const TRACKER_FORM_FIELDS = [
  { key: 'ncp', label: 'NCP', group: 'project' },
  { key: 'endUser', label: 'End User', group: 'project' },
  { key: 'gpuModel', label: 'GPU Model', group: 'project' },
  { key: 'gpuQty', label: 'GPU Qty', group: 'project', type: 'number' },
  { key: 'oem', label: 'OEM', group: 'project' },
  { key: 'deliverySchedule', label: 'Delivery Schedule', group: 'project', placeholder: 'e.g. 2026 Q4' },
  { key: 'dcVendor', label: 'DC Vendor', group: 'dc' },
  { key: 'dcSite', label: 'DC Site (City + Site Name)', group: 'dc' },
  { key: 'capacityMw', label: 'Capacity (MW)', group: 'dc', type: 'number', step: '0.01' },
  { key: 'comments', label: 'Comments', group: 'pm', type: 'textarea', full: true },
]

export const TRACKER_EMPTY = Object.fromEntries(TRACKER_FORM_FIELDS.map((item) => [item.key, '']))

export function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label || id
}
