import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { todayInputDate } from '../utils'
import { useAuth } from './AuthContext'

const COLLECTIONS = ['leads', 'companies', 'contacts', 'deals', 'activities', 'tasks', 'users']

const DataContext = createContext(null)

function timeValue(value) {
  if (!value) return 0
  if (value.toMillis) return value.toMillis()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function sortRows(name, rows) {
  return [...rows].sort((a, b) => {
    if (name === 'activities') {
      return timeValue(b.activityDate || b.createdAt) - timeValue(a.activityDate || a.createdAt)
    }
    return timeValue(b.createdAt) - timeValue(a.createdAt)
  })
}

export function DataProvider({ children }) {
  const { user, profile, isAdmin } = useAuth()
  const [data, setData] = useState({
    leads: [],
    companies: [],
    contacts: [],
    deals: [],
    activities: [],
    tasks: [],
    users: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return undefined
    setLoading(true)
    const unsubs = COLLECTIONS.map((name) => {
      const col = collection(db, name)
      const q = name === 'users' || isAdmin ? query(col) : query(col, where('ownerId', '==', user.uid))
      return onSnapshot(q, (snap) => {
        const rows = sortRows(name, snap.docs.map((item) => ({ id: item.id, ...item.data() })))
        setData((prev) => ({ ...prev, [name]: rows }))
        setLoading(false)
      })
    })
    return () => unsubs.forEach((unsub) => unsub())
  }, [user, isAdmin])

  const ownerId = user?.uid
  const ownerName = profile?.name || user?.displayName || user?.email || ''

  const value = useMemo(
    () => ({
      ...data,
      loading,
      async create(colName, payload) {
        const extra = {}
        if (colName === 'activities' && !payload.activityDate) {
          extra.activityDate = todayInputDate()
        }
        if (colName === 'deals') {
          extra.isOpportunity = payload.isOpportunity !== false
          if (!payload.stageEnteredAt) extra.stageEnteredAt = serverTimestamp()
        }
        const ref = await addDoc(collection(db, colName), {
          ...payload,
          ...extra,
          ownerId,
          ownerName,
          createdAt: serverTimestamp(),
        })
        return ref.id
      },
      async update(colName, id, payload) {
        await updateDoc(doc(db, colName, id), payload)
      },
      async remove(colName, id) {
        await deleteDoc(doc(db, colName, id))
      },
      async convertLead(lead, form) {
        const batch = writeBatch(db)
        const companyRef = doc(collection(db, 'companies'))
        const contactRef = doc(collection(db, 'contacts'))
        const dealRef = doc(collection(db, 'deals'))
        const activityRef = doc(collection(db, 'activities'))
        const stamp = serverTimestamp()
        const owner = { ownerId, ownerName }

        batch.set(companyRef, {
          name: form.companyName,
          phone: lead.phone || '',
          phoneCountry: lead.phoneCountry || 'SG',
          email: lead.email || '',
          website: '',
          address: '',
          industry: '',
          ...owner,
          createdAt: stamp,
        })
        batch.set(contactRef, {
          name: form.contactName,
          position: form.position || '',
          phone: lead.phone || '',
          phoneCountry: lead.phoneCountry || 'SG',
          email: lead.email || '',
          companyId: companyRef.id,
          companyName: form.companyName,
          ...owner,
          createdAt: stamp,
        })
        batch.set(dealRef, {
          name: form.dealName,
          value: form.value === '' || form.value == null ? null : Number(form.value),
          currency: form.currency || '',
          currency: form.currency,
          companyId: companyRef.id,
          companyName: form.companyName,
          contactId: contactRef.id,
          contactName: form.contactName,
          stage: 'qualification',
          expectedCloseDate: form.expectedCloseDate || '',
          nextStep: form.nextStep || '',
          probability: Number(form.probability || 0),
          category: lead.category || '',
          country: form.countryTbc ? 'TBC' : form.country || lead.country || lead.phoneCountry || 'SG',
          countryTbc: Boolean(form.countryTbc),
          schedule: lead.schedule || '',
          ncp: form.ncp || '',
          endUser: form.endUser || form.companyName || '',
          gpuModel: form.gpuModel || '',
          gpuQty: form.gpuQty === '' || form.gpuQty == null ? '' : Number(form.gpuQty),
          oem: form.oem || '',
          deliverySchedule: form.deliverySchedule || lead.schedule || '',
          dcVendor: form.dcVendor || '',
          dcSite: form.dcSite || '',
          capacityMw: form.capacityMw === '' || form.capacityMw == null ? '' : Number(form.capacityMw),
          comments: form.comments || '',
          isOpportunity: true,
          leadId: lead.id,
          stageEnteredAt: stamp,
          ...owner,
          createdAt: stamp,
        })
        batch.set(activityRef, {
          type: 'note',
          title: `Lead converted: ${lead.name}`,
          description: `Created company, contact and opportunity "${form.dealName}"`,
          relatedType: 'deal',
          relatedId: dealRef.id,
          relatedName: form.dealName,
          activityDate: todayInputDate(),
          ...owner,
          createdAt: stamp,
        })
        batch.update(doc(db, 'leads', lead.id), {
          status: 'converted',
          convertedCompanyId: companyRef.id,
          convertedContactId: contactRef.id,
          convertedDealId: dealRef.id,
          convertedAt: stamp,
        })
        await batch.commit()
        return { companyId: companyRef.id, dealId: dealRef.id }
      },
    }),
    [data, loading, ownerId, ownerName]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
