import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { COUNTRY_CODES, CURRENCIES, DEFAULT_PHONE_COUNTRY } from '../constants'
import { countryOf, userPickerOptions } from '../utils'
import { ICONS } from './icons'

export function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function DaiLogo({ className = '' }) {
  return <img className={`dai-logo ${className}`} src="/dai-logo.png" alt="DIMENSIONAI" />
}

export function Hint({ text }) {
  return (
    <span className="hint" tabIndex={0}>
      i
      <span className="hint-pop">{text}</span>
    </span>
  )
}

export function Field({ label, children, className = '', hint }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {hint ? <Hint text={hint} /> : null}
      </span>
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
          <option value="">{required ? 'Select currency' : 'Optional'}</option>
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
          placeholder={currency ? '0.00' : required ? 'Select currency first' : 'Optional'}
        />
      </Field>
    </div>
  )
}

export function CountryField({ country, tbc = false, onCountryChange, onTbcChange, required = true }) {
  return (
    <div className="country-field">
      <Field label="Country">
        <select
          name="country"
          value={tbc ? '' : country}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={tbc}
          required={required && !tbc}
        >
          <option value="">{tbc ? 'TBC' : 'Select country'}</option>
          {COUNTRY_CODES.map((item) => (
            <option key={item.iso} value={item.iso}>
              {item.iso} · {item.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="field tbc-field">
        <span className="field-label">&nbsp;</span>
        <label className="tbc-check">
          <input type="checkbox" checked={tbc} onChange={(e) => onTbcChange(e.target.checked)} />
          TBC
        </label>
      </div>
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

export function SearchSelect({
  label,
  value,
  options = [],
  onChange,
  placeholder = 'Select',
  searchPlaceholder = 'Search...',
  disabled = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [menuPos, setMenuPos] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const selected = options.find((item) => item.id === value)
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase()
    if (!keyword) return options
    return options.filter(
      (item) =>
        String(item.label || '').toLowerCase().includes(keyword) ||
        String(item.hint || '').toLowerCase().includes(keyword)
    )
  }, [options, q])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined
    function place() {
      const rect = triggerRef.current.getBoundingClientRect()
      const width = Math.max(rect.width, compact ? 220 : 260)
      const left = Math.min(rect.left, window.innerWidth - width - 12)
      setMenuPos({
        top: rect.bottom + 6,
        left: Math.max(12, left),
        width,
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, compact])

  useEffect(() => {
    function onDocClick(event) {
      if (!rootRef.current?.contains(event.target) && !event.target.closest('.search-select-menu')) {
        setOpen(false)
        setQ('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const control = (
    <div
      className={`search-select ${compact ? 'compact' : ''} ${open ? 'open' : ''}`}
      ref={rootRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        ref={triggerRef}
        className="search-select-trigger"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
      >
        <span className={selected ? '' : 'placeholder'}>{selected?.label || placeholder}</span>
        <span className={`search-select-caret ${open ? 'up' : ''}`} aria-hidden="true" />
      </button>
      {open && menuPos && (
        <div className="search-select-menu" style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}>
          <input
            autoFocus
            className="search-select-search"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="search-select-list">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === value ? 'active' : ''}
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                  setQ('')
                }}
              >
                <span>{item.label}</span>
                {item.hint ? <small>{item.hint}</small> : null}
              </button>
            ))}
            {filtered.length === 0 && <div className="empty-search">No matching user</div>}
          </div>
        </div>
      )}
    </div>
  )

  if (!label) return control
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {control}
    </div>
  )
}

export function PicSelect({ value, users = [], onChange, disabled = false, compact = false, label = 'PIC' }) {
  const options = useMemo(() => userPickerOptions(users, value), [users, value])
  return (
    <SearchSelect
      label={compact ? undefined : label}
      value={value}
      options={options}
      placeholder="Select PIC"
      searchPlaceholder="Search user..."
      disabled={disabled}
      compact={compact}
      onChange={(id) => {
        const person = users.find((item) => item.id === id)
        onChange({
          picId: id,
          picName: person?.name || person?.email || '',
        })
      }}
    />
  )
}
