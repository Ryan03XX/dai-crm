import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { DEAL_STAGES } from '../constants'
import { activitySortValue, agingLabel, countryPayload, formatDate, moneyOf, valuePayload } from '../utils'
import { persistAttachments } from '../attachments'
import { CountryField, Field, Modal, MoneyField } from './ui'
import { TrackerFields } from './TrackerFields'
import { AttachmentPicker } from './AttachmentPicker'
import { QuickActivity, QuickTask } from './FollowUp'

function commitTracker(key, value) {
  if (key === 'gpuQty' || key === 'capacityMw') {
    return value === '' ? '' : Number(value)
  }
  return value
}

export function OpportunityDetail({ deal }) {
  const { activities, create, update } = useData()
  const { canEdit } = useAuth()
  const editable = canEdit(deal)
  const related = useMemo(
    () =>
      activities
        .filter((item) => item.relatedType === 'deal' && item.relatedId === deal.id)
        .slice()
        .sort((a, b) => activitySortValue(b) - activitySortValue(a)),
    [activities, deal.id]
  )

  async function save(payload) {
    if (!editable) return
    await update('deals', deal.id, payload)
  }

  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>
        {deal.endUser || deal.companyName} · {deal.contactName} · {moneyOf(deal)} · Aging {agingLabel(deal.createdAt)}
        {!editable ? ' · View only' : ''}
      </p>
      <fieldset className="edit-scope" disabled={!editable}>
        <div className="form-grid">
          <Field label="Stage">
            <select
              value={deal.stage}
              onChange={(e) => save({ stage: e.target.value, stageEnteredAt: new Date().toISOString() })}
            >
              {DEAL_STAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Next step">
            <input
              defaultValue={deal.nextStep || ''}
              key={`${deal.id}-next`}
              onBlur={(e) => save({ nextStep: e.target.value })}
            />
          </Field>
          <Field label="Probability %">
            <input
              type="number"
              min="0"
              max="100"
              defaultValue={deal.probability || ''}
              key={`${deal.id}-prob`}
              onBlur={(e) => save({ probability: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Expected close">
            <input
              type="date"
              defaultValue={deal.expectedCloseDate || ''}
              key={`${deal.id}-close`}
              onBlur={(e) => save({ expectedCloseDate: e.target.value })}
            />
          </Field>
          <CountryField
            country={deal.countryTbc ? '' : deal.country || ''}
            tbc={Boolean(deal.countryTbc)}
            onCountryChange={(country) => save(countryPayload(country, false))}
            onTbcChange={(countryTbc) => save(countryPayload(deal.country, countryTbc))}
          />
          <MoneyField
            currency={deal.currency || ''}
            amount={deal.value ?? ''}
            required={!deal.countryTbc}
            onCurrencyChange={(currency) => save({ currency })}
            onAmountChange={(value) => save(valuePayload(value))}
          />
        </div>
        <TrackerFields
          key={deal.id}
          values={deal}
          onCommit={(key, value) => save({ [key]: commitTracker(key, value) })}
        />
      </fieldset>
      <AttachmentPicker
        files={deal.attachments || []}
        disabled={!editable}
        onChange={async (next) => {
          if (!editable) return
          const attachments = await persistAttachments(deal.id, next, deal.attachments || [])
          await update('deals', deal.id, { attachments })
        }}
      />
      <div style={{ marginTop: 16 }}>
        <QuickActivity
          onSubmit={(payload) =>
            create('activities', {
              ...payload,
              relatedType: 'deal',
              relatedId: deal.id,
              relatedName: deal.name,
            })
          }
        />
        <QuickTask
          defaultTitle={`Follow up ${deal.name}`}
          onSubmit={(payload) =>
            create('tasks', {
              ...payload,
              relatedType: 'deal',
              relatedId: deal.id,
              relatedName: deal.name,
            })
          }
        />
      </div>
      <div className="timeline">
        {related.map((item) => (
          <div className="timeline-item" key={item.id}>
            <b>{item.title}</b>
            <div className="muted">{item.description}</div>
            <div className="muted">{formatDate(item.activityDate || item.createdAt)}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export function OpportunityModal({ deal, onClose }) {
  if (!deal) return null
  return (
    <Modal title={deal.name} onClose={onClose} wide>
      <OpportunityDetail deal={deal} />
    </Modal>
  )
}
