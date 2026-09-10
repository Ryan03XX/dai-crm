import { useState } from 'react'

function isImage(item) {
  return String(item.type || '').startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(item.name || '')
}

export function AttachmentPicker({ files = [], onChange, disabled = false }) {
  const [preview, setPreview] = useState(null)

  function addFiles(list) {
    if (!list?.length) return
    const next = []
    for (const file of Array.from(list)) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is larger than 10 MB`)
        continue
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || '',
        size: file.size || 0,
        local: true,
      })
    }
    if (next.length) onChange([...files, ...next])
  }

  function remove(item) {
    if (item.local && item.url) URL.revokeObjectURL(item.url)
    onChange(files.filter((file) => file.id !== item.id))
  }

  return (
    <div className="attach-picker">
      <div className="attach-head">
        <span className="field-label">Attachments</span>
        <label className={`btn light btn-small ${disabled ? 'disabled' : ''}`}>
          Upload files
          <input
            type="file"
            multiple
            hidden
            disabled={disabled}
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {files.length === 0 && <div className="muted attach-empty">No files yet. You can upload more than one.</div>}
      <div className="attach-grid">
        {files.map((item) => (
          <div className="attach-card" key={item.id}>
            {isImage(item) ? (
              <button type="button" className="attach-thumb" onClick={() => setPreview(item)}>
                <img src={item.url} alt={item.name} />
              </button>
            ) : (
              <button type="button" className="attach-file" onClick={() => window.open(item.url, '_blank', 'noopener')}>
                {item.name}
              </button>
            )}
            <div className="attach-meta">
              <span title={item.name}>{item.name}</span>
              <div className="attach-card-actions">
                <button type="button" className="linkish" onClick={() => (isImage(item) ? setPreview(item) : window.open(item.url, '_blank', 'noopener'))}>
                  Preview
                </button>
                <button type="button" className="linkish danger-link" disabled={disabled} onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="attach-preview" onClick={(e) => e.stopPropagation()}>
            <img src={preview.url} alt={preview.name} />
            <div className="attach-preview-bar">
              <span>{preview.name}</span>
              <button type="button" className="btn light btn-small" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
