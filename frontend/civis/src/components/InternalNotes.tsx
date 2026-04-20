import { useEffect, useState } from 'react'

type Note = {
  id: string
  author?: string
  text: string
  createdAt: string
}

export default function InternalNotes({ complaintId }: { complaintId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')

  const storageKey = `internal-notes:${complaintId}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setNotes(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes))
    } catch (e) {
      // ignore
    }
  }, [notes, storageKey])

  function addNote() {
    if (!text.trim()) return
    const n: Note = { id: String(Date.now()), text: text.trim(), createdAt: new Date().toISOString() }
    setNotes((s) => [n, ...s])
    setText('')
  }

  function removeNote(id: string) {
    setNotes((s) => s.filter((n) => n.id !== id))
  }

  return (
    <div className="internal-notes">
      <div className="note-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an internal note visible to admins only"
          rows={3}
        />
        <div className="note-actions">
          <button className="btn btn-primary" onClick={addNote} disabled={!text.trim()}>Add note</button>
        </div>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="muted">No internal notes yet.</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="note-item">
              <div className="note-meta">
                <strong>Admin</strong>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <div className="note-text">{n.text}</div>
              <button className="note-delete" onClick={() => removeNote(n.id)} title="Delete note">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
