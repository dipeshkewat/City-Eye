import { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

const WORK_TEAMS = [
  { id: 'usr-002', name: 'Vikram Patil', team: 'Road Maintenance Crew 1', dept: 'Road Maintenance' },
  { id: 'usr-003', name: 'Sunil Deshmukh', team: 'Sanitation Squad A', dept: 'Sanitation' },
  { id: 'usr-005', name: 'Ganesh Shinde', team: 'Drainage Rapid Response', dept: 'Drainage & Water' }
];

export default function AssignModal({ reportId, recommendedDept, onClose, onConfirm }) {
  const [selectedTeam, setSelectedTeam] = useState('usr-002');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reportId, selectedTeam);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="#359B73" />
            <span style={{ fontWeight: 700 }}>Dispatch to Municipal Work Team</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Target Department: <strong style={{ color: 'var(--color-aquamarine-text)' }}>{recommendedDept || 'Road Maintenance'}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WORK_TEAMS.map((team) => (
                <label
                  key={team.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: selectedTeam === team.id ? 'var(--color-navy-hover)' : 'var(--color-navy-dark)',
                    border: selectedTeam === team.id ? '1px solid var(--color-aquamarine)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="workTeam"
                    value={team.id}
                    checked={selectedTeam === team.id}
                    onChange={() => setSelectedTeam(team.id)}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{team.team}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Lead: {team.name} • {team.dept}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
