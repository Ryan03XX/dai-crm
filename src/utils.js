export function money(value) {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0,
  })
}

export function formatDate(value) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
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
