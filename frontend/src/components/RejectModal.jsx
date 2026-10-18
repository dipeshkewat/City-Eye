import { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

export default function RejectModal({ reportId, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reportId, reason.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-status-rejected)' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 700 }}>Mandatory Rejection Reason</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              As specified in Section 4 of the PRD, rejecting a report is a terminal municipal action and requires an official audit reason.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                REASON FOR REJECTION *
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="e.g., False positive: temporary road markings, shadow anomaly, or already repaired."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={!reason.trim()}>
              <XCircle size={16} /> Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
