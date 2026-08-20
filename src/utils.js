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
  return money(deal.value, deal.currency)
}

export function totalsByCurrency(deals) {
  if (!deals?.length) return '—'
  const map = {}
  for (const deal of deals) {
    const code = deal.currency || 'SGD'
    map[code] = (map[code] || 0) + Number(deal.value || 0)
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
