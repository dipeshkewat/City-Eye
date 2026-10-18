import { useState } from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../auth/AuthContext';
import ResolveModal from '../../components/ResolveModal';
import EvidenceModal from '../../components/EvidenceModal';

export default function WorkTeamDashboard() {
  const { reports, startWork, resolveReport } = useReports();
  const { user } = useAuth();
  const [resolveId, setResolveId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const myReports = reports.filter(
    (r) => r.assigned_team === (user?.id || 'usr-002') || r.status === 'assigned' || r.status === 'in_progress'
  );

  const assignedTasks = myReports.filter((r) => r.status === 'assigned');
  const inProgressTasks = myReports.filter((r) => r.status === 'in_progress');
  const resolvedTasks = myReports.filter((r) => r.status === 'resolved');

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Welcome Back, Vikram</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Road Maintenance Crew 1 • Field Work Orders & Repair Dispatch
          </p>
        </div>
        <span className="pill-badge-green">Team Ready</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Assigned Orders</h3>
              <p>Ready for dispatch</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)' }}>
            {assignedTasks.length} Orders
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Active On-Site</h3>
              <p>Under repair</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)' }}>
            {inProgressTasks.length} In Progress
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Completed Fixes</h3>
              <p>Photo verified</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-aquamarine)' }}>
            {resolvedTasks.length} Resolved
          </div>
        </div>
      </div>

      {/* Task Queue */}
      <div className="modern-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <h3>Field Work Orders Queue</h3>
            <p>Select order to view CCTV frame or submit repair completion proof</p>
          </div>
          <span className="pill-badge-green">{assignedTasks.length + inProgressTasks.length} Active</span>
        </div>

        {assignedTasks.length === 0 && inProgressTasks.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={36} color="#359B73" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>All tasks completed!</div>
            <div style={{ fontSize: 12 }}>Check back when the review officer dispatches new work orders.</div>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Work Order</th>
                <th>Problem Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...inProgressTasks, ...assignedTasks].map((report) => (
                <tr key={report.id}>
                  <td style={{ width: 70 }}>
                    <div
                      onClick={() => setSelectedReport(report)}
                      style={{
                        width: 60,
                        height: 40,
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#0B2545'
                      }}
                    >
                      <img
                        src={report.detection.evidence_image_path || '/evidence/det-001.svg'}
                        alt="CCTV"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/evidence/det-001.svg'; }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{report.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{report.id}</div>
                  </td>
                  <td>
                    <span className="pill-badge-subtle" style={{ textTransform: 'capitalize' }}>
                      {report.detection.problem_type}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: report.detection.severity_label === 'high' ? '#DC2626' : '#D97706'
                    }}>
                      {report.detection.severity_label.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--color-navy)' }}>{report.camera.address}</div>
                  </td>
                  <td>
                    <div className="status-dot-text">
                      <span className={`status-dot ${report.status === 'in_progress' ? 'blue' : 'amber'}`} />
                      <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{report.status.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-pill-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => setSelectedReport(report)}
                      >
                        Inspect
                      </button>

                      {report.status === 'assigned' && (
                        <button
                          className="btn-pill-primary"
                          style={{ padding: '4px 12px', fontSize: 11 }}
                          onClick={() => startWork(report.id)}
                        >
                          Start Work
                        </button>
                      )}

                      {report.status === 'in_progress' && (
                        <button
                          className="btn-pill-primary"
                          style={{ padding: '4px 12px', fontSize: 11 }}
                          onClick={() => setResolveId(report.id)}
                        >
                          Submit Proof
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {resolveId && (
        <ResolveModal
          reportId={resolveId}
          onClose={() => setResolveId(null)}
          onConfirm={(id, data) => resolveReport(id, data)}
        />
      )}

      {selectedReport && (
        <EvidenceModal
          report={selectedReport}
          userRole="work_team"
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
