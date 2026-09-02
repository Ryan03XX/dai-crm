import { TRACKER_FORM_FIELDS, TRACKER_GROUPS } from '../constants'
import { Field } from './ui'

export function TrackerFields({ values = {}, onChange, named = false, onCommit }) {
  const groups = TRACKER_GROUPS.filter((group) => TRACKER_FORM_FIELDS.some((item) => item.group === group.id))

  return groups.map((group) => (
    <div key={group.id} className="tracker-form-group">
      <h4>{group.label}</h4>
      <div className="form-grid">
        {TRACKER_FORM_FIELDS.filter((item) => item.group === group.id).map((item) => {
          const shared = {
            name: named ? item.key : undefined,
            placeholder: item.placeholder,
            step: item.step,
            min: item.type === 'number' ? '0' : undefined,
            ...(onChange && !named
              ? { value: values[item.key] || '', onChange: (e) => onChange(item.key, e.target.value) }
              : { defaultValue: values[item.key] || '' }),
            ...(onCommit ? { onBlur: (e) => onCommit(item.key, e.target.value) } : {}),
          }
          if (item.type === 'textarea') {
            return (
              <Field key={item.key} label={item.label} className={item.full ? 'full' : ''}>
                <textarea {...shared} rows={2} />
              </Field>
            )
          }
          return (
            <Field key={item.key} label={item.label} className={item.full ? 'full' : ''}>
              <input {...shared} type={item.type || 'text'} />
            </Field>
          )
        })}
      </div>
    </div>
  ))
}
