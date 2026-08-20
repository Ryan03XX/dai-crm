import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { COUNTRY_CODES, CURRENCIES, DEFAULT_PHONE_COUNTRY } from '../constants'
import { countryOf } from '../utils'
import { ICONS } from './icons'

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Pill({ value, label }) {
  return <span className={`pill ${value}`}>{label || value}</span>
}

export function Empty({ text }) {
  return <div className="empty">{text}</div>
}

export function NewButton({ children, to, onClick }) {
  const content = (
    <>
      {ICONS.plus}
      {children}
    </>
  )
  if (to) {
    return (
      <Link className="btn" to={to}>
        {content}
      </Link>
    )
  }
  return (
    <button className="btn" type="button" onClick={onClick}>
      {content}
    </button>
  )
}

export function MoneyField({ currency, amount, onCurrencyChange, onAmountChange, required = true }) {
  return (
    <div className="money-field">
      <Field label="Currency">
        <select
          name="currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          required={required}
        >
          <option value="">Select currency</option>
          {CURRENCIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Amount">
        <input
          name="value"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={!currency}
          required={required && Boolean(currency)}
          placeholder={currency ? '0.00' : 'Select currency first'}
        />
      </Field>
    </div>
  )
}

export function Flag({ iso }) {
  const code = (iso || DEFAULT_PHONE_COUNTRY).toLowerCase()
  return (
    <img
      className="flag"
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width="20"
      height="15"
      alt=""
    />
  )
}

export function PhoneText({ record }) {
  const number = String(record?.phone || '').trim()
  if (!number) return '—'
  const country = countryOf(record.phoneCountry)
  return (
    <span className="phone-text">
      <Flag iso={country.iso} />
      {country.dial} {number}
    </span>
  )
}

export function PhoneField({ country = DEFAULT_PHONE_COUNTRY, number, onCountryChange, onNumberChange }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)
  const current = countryOf(country)
  const options = useMemo(() => {
    const keyword = q.trim().toLowerCase()
    if (!keyword) return COUNTRY_CODES
    return COUNTRY_CODES.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.dial.includes(keyword) ||
        item.iso.toLowerCase().includes(keyword)
    )
  }, [q])

  useEffect(() => {
    function onDocClick(event) {
      if (!ref.current?.contains(event.target)) {
        setOpen(false)
        setQ('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="field">
      <span>Phone</span>
      <div className="phone-field" ref={ref}>
        <button type="button" className="phone-code" onClick={() => setOpen((prev) => !prev)}>
          <Flag iso={current.iso} />
          <span>{current.dial}</span>
          <span className="chevron" aria-hidden="true" />
        </button>
        <input
          type="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value.replace(/[^\d\s-]/g, ''))}
          placeholder="Phone number"
        />
        {open && (
          <div className="phone-dropdown">
            <input
              autoFocus
              className="phone-search"
              placeholder="Search country"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="phone-options">
              {options.map((item) => (
                <button
                  key={item.iso}
                  type="button"
                  className={item.iso === current.iso ? 'active' : ''}
                  onClick={() => {
                    onCountryChange(item.iso)
                    setOpen(false)
                    setQ('')
                  }}
                >
                  <Flag iso={item.iso} />
                  <span className="phone-name">{item.name}</span>
                  <span className="muted">{item.dial}</span>
                </button>
              ))}
              {options.length === 0 && <div className="empty-search">No matching country</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
