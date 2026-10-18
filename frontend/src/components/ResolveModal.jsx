import { useState } from 'react';
import { Wrench, CheckCircle2, Upload, FileText } from 'lucide-react';

export default function ResolveModal({ reportId, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState('asphalt');

  const handleSubmit = (e) => {
    e.preventDefault();
    const photoPath = proof === 'asphalt' ? '/evidence/res-001.svg' : '/evidence/res-002.svg';
    onConfirm(reportId, { notes, photoPath });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={20} color="#10B981" />
            <span style={{ fontWeight: 700 }}>Submit Proof of Resolution</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Provide on-site repair notes and photographic proof as required by municipal resolution protocols.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                PROOF OF RESOLUTION PHOTO
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{
                  padding: 12,
                  border: proof === 'asphalt' ? '1px solid var(--color-aquamarine)' : '1px solid var(--color-border)',
                  background: 'var(--color-navy-dark)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="proof" checked={proof === 'asphalt'} onChange={() => setProof('asphalt')} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#FFFFFF', marginTop: 4 }}>Asphalt Repaving</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Clean compacted patch</div>
                </label>
                <label style={{
                  padding: 12,
                  border: proof === 'cleaned' ? '1px solid var(--color-aquamarine)' : '1px solid var(--color-border)',
                  background: 'var(--color-navy-dark)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="proof" checked={proof === 'cleaned'} onChange={() => setProof('cleaned')} />
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#FFFFFF', marginTop: 4 }}>Sanitation Cleaned</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Site cleared & disinfected</div>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                ENGINEERING / FIELD NOTES *
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. 1.5m pothole filled with hot-mix asphalt and steam compacted. Traffic restored to normal flow."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!notes.trim()}>
              <CheckCircle2 size={16} /> Mark as Resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
