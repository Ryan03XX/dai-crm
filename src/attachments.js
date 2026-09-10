import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'

export function newLocalFiles(fileList) {
  return Array.from(fileList).map((file) => ({
    id: crypto.randomUUID(),
    file,
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type || '',
    size: file.size || 0,
    local: true,
  }))
}

export function revokeLocalUrl(item) {
  if (item?.local && item.url) URL.revokeObjectURL(item.url)
}

export async function uploadAttachment(dealId, file) {
  const id = crypto.randomUUID()
  const safeName = String(file.name || 'file').replace(/[^\w.\-]+/g, '_')
  const path = `opportunities/${dealId}/${id}-${safeName}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type || 'application/octet-stream' })
  const url = await getDownloadURL(fileRef)
  return {
    id,
    name: file.name,
    url,
    path,
    type: file.type || '',
    size: file.size || 0,
  }
}

export async function deleteAttachmentFile(item) {
  if (!item?.path) return
  try {
    await deleteObject(ref(storage, item.path))
  } catch {
    // already removed
  }
}

export async function persistAttachments(dealId, files, previous = []) {
  const keepIds = new Set(files.filter((item) => !item.local).map((item) => item.id))
  await Promise.all(
    previous
      .filter((item) => item.path && !keepIds.has(item.id))
      .map((item) => deleteAttachmentFile(item))
  )
  const saved = []
  for (const item of files) {
    if (item.local && item.file) {
      saved.push(await uploadAttachment(dealId, item.file))
    } else {
      saved.push({
        id: item.id,
        name: item.name,
        url: item.url,
        path: item.path || '',
        type: item.type || '',
        size: item.size || 0,
      })
    }
  }
  return saved
}
