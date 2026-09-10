import { COUNTRY_CODES, DEFAULT_PHONE_COUNTRY } from './constants'

const LOCALES = {
  SGD: 'en-SG',
  MYR: 'en-MY',
  USD: 'en-US',
}

export function money(value, currency = 'SGD') {
  const amount = Number(value || 0)
  const code = currency || 'SGD'
  return amount.toLocaleString(LOCALES[code] || 'en-SG', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  })
}

export function moneyOf(deal) {
  if (!deal) return '—'
  if (deal.value == null || deal.value === '') return '—'
  return money(deal.value, deal.currency)
}

export function numericValue(deal) {
  if (!deal || deal.value == null || deal.value === '') return 0
  return Number(deal.value || 0)
}

export function valuePayload(amount) {
  if (amount === '' || amount == null) return { value: null }
  return { value: Number(amount) }
}

export function countryPayload(country, tbc) {
  if (tbc) return { country: 'TBC', countryTbc: true }
  return { country: country || '', countryTbc: false }
}

export function totalsByCurrency(deals) {
  if (!deals?.length) return '—'
  const map = {}
  for (const deal of deals) {
    const amount = numericValue(deal)
    if (!amount) continue
    const code = deal.currency || 'SGD'
    map[code] = (map[code] || 0) + amount
  }
  return Object.entries(map)
    .map(([currency, total]) => money(total, currency))
    .join(' · ')
}

export function formatDate(value) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-SG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toInputDate(value) {
  if (!value) return ''
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function isOverdue(value, status) {
  if (!value || status === 'done') return false
  const date = value.toDate ? value.toDate() : new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function searchText(record, keyword) {
  if (!keyword) return true
  const haystack = Object.values(record)
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ')
    .toLowerCase()
  return haystack.includes(keyword.toLowerCase())
}

export function countryOf(iso) {
  return COUNTRY_CODES.find((item) => item.iso === (iso || DEFAULT_PHONE_COUNTRY)) || COUNTRY_CODES[0]
}

export function formatPhone(record) {
  const number = String(record?.phone || '').trim()
  if (!number) return '—'
  return `${countryOf(record.phoneCountry).dial} ${number}`
}

export function toDate(value) {
  if (!value) return null
  const date = value.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function daysSince(value) {
  const date = toDate(value)
  if (!date) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
}

export function agingLabel(value) {
  const days = daysSince(value)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}

export function currentSchedule() {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`
}

export function todayInputDate() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function opportunities(deals = []) {
  return deals.filter((deal) => deal.isOpportunity !== false)
}

export function isOpenDeal(deal) {
  return deal.stage !== 'won' && deal.stage !== 'lost'
}

export function activitySortValue(item) {
  return toDate(item.activityDate || item.createdAt)?.getTime() || 0
}

export function suggestedLeadName({ company, country, category, schedule }) {
  const companyPart = String(company || 'Company').replace(/\s+/g, '')
  const countryPart = country || 'SG'
  const scopePart = String(category || 'scope').replace(/\s+/g, '-')
  const schedulePart = schedule || currentSchedule()
  return `${companyPart}_${countryPart}_${scopePart}_${schedulePart}`
}

export function avgAgingDays(records) {
  if (!records?.length) return 0
  const total = records.reduce((sum, item) => sum + daysSince(item.createdAt), 0)
  return Math.round(total / records.length)
}

export function trackerFrom(source = {}) {
  return {
    ncp: source.ncp || '',
    endUser: source.endUser || source.companyName || source.company || '',
    gpuModel: source.gpuModel || '',
    gpuQty: source.gpuQty === '' || source.gpuQty == null ? '' : source.gpuQty,
    oem: source.oem || '',
    deliverySchedule: source.deliverySchedule || source.schedule || '',
    dcVendor: source.dcVendor || '',
    dcSite: source.dcSite || '',
    capacityMw: source.capacityMw === '' || source.capacityMw == null ? '' : source.capacityMw,
    comments: source.comments || '',
  }
}

export function displayValue(value) {
  if (value === 0) return '0'
  if (value === '' || value == null) return '—'
  return value
}
