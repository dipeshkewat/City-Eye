import { useState, useMemo } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, Eye,
  MapPin, Navigation, Calendar, Wrench, Shield, Check,
  ArrowRight, ExternalLink, Filter
} from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../auth/AuthContext';
import ResolveModal from '../../components/ResolveModal';
import EvidenceModal from '../../components/EvidenceModal';
import { resolveMediaUrl } from '../../api';

export default function WorkTeamAssignments() {
  const { reports, startWork, resolveReport } = useReports();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'assigned' | 'in_progress' | 'resolved'
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveId, setResolveId] = useState(null);

  // Filter tasks belonging to this crew or available for dispatch
  const crewReports = useMemo(() => {
    return reports.filter(
      (r) =>
        r.assigned_team === (user?.id || 'usr-002') ||
        r.assigned_team === 'Road Maintenance Crew 1' ||
        r.status === 'assigned' ||
        r.status === 'in_progress' ||
        r.status === 'resolved'
    );
  }, [reports, user]);

  const assignedTasks = crewReports.filter((r) => r.status === 'assigned');
  const inProgressTasks = crewReports.filter((r) => r.status === 'in_progress');
  const resolvedTasks = crewReports.filter((r) => r.status === 'resolved');

  const displayedReports = useMemo(() => {
    if (activeTab === 'assigned') return assignedTasks;
    if (activeTab === 'in_progress') return inProgressTasks;
    if (activeTab === 'resolved') return resolvedTasks;
    return [...inProgressTasks, ...assignedTasks, ...resolvedTasks];
  }, [activeTab, assignedTasks, inProgressTasks, resolvedTasks]);

  const handleOpenNavigation = (report) => {
    const lat = report.gps?.lat || report.gps_lat || report.camera?.latitude || 19.076;
    const lng = report.gps?.lng || report.gps_lng || report.camera?.longitude || 72.8777;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome & Operations Banner */}
      <div className="welcome-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#0284C7',
              textTransform: 'uppercase'
            }}>
              <ClipboardList size={13} /> Field Dispatch
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>• Road Maintenance Crew 1</span>
          </div>
          <h1 className="welcome-title">Field Assignment Work Sites</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Real-time field site dispatches, GPS routing, and photo-verified task resolution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: '8px 16px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Crew Status
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot green" /> Active on Shift
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <div
          onClick={() => setActiveTab('all')}
          className="modern-card"
          style={{
            cursor: 'pointer',
            border: activeTab === 'all' ? '2px solid #2563EB' : '1px solid var(--color-border-subtle)',
            background: activeTab === 'all' ? 'rgba(37, 99, 235, 0.04)' : undefined,
            padding: '16px 20px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Assignments
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-navy)', marginTop: 4 }}>
            {crewReports.length}
          </div>
          <div style={{ fontSize: 11, color: '#2563EB', marginTop: 4, fontWeight: 600 }}>
            Cumulative Field Log
          </div>
        </div>

        <div
          onClick={() => setActiveTab('assigned')}
          className="modern-card"
          style={{
            cursor: 'pointer',
            border: activeTab === 'assigned' ? '2px solid #F59E0B' : '1px solid var(--color-border-subtle)',
            background: activeTab === 'assigned' ? 'rgba(245, 158, 11, 0.04)' : undefined,
            padding: '16px 20px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Site Visit
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706', marginTop: 4 }}>
            {assignedTasks.length}
          </div>
          <div style={{ fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: 600 }}>
            Ready for Travel / Work
          </div>
        </div>

        <div
          onClick={() => setActiveTab('in_progress')}
          className="modern-card"
          style={{
            cursor: 'pointer',
            border: activeTab === 'in_progress' ? '2px solid #0EA5E9' : '1px solid var(--color-border-subtle)',
            background: activeTab === 'in_progress' ? 'rgba(14, 165, 233, 0.04)' : undefined,
            padding: '16px 20px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Under Repair
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>
            {inProgressTasks.length}
          </div>
          <div style={{ fontSize: 11, color: '#0284C7', marginTop: 4, fontWeight: 600 }}>
            Crews On-Site
          </div>
        </div>

        <div
          onClick={() => setActiveTab('resolved')}
          className="modern-card"
          style={{
            cursor: 'pointer',
            border: activeTab === 'resolved' ? '2px solid #10B981' : '1px solid var(--color-border-subtle)',
            background: activeTab === 'resolved' ? 'rgba(16, 185, 129, 0.04)' : undefined,
            padding: '16px 20px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Completed & Verified
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
            {resolvedTasks.length}
          </div>
          <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
            Repairs Signed Off
          </div>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'var(--color-card)',
        borderRadius: 14,
        border: '1px solid var(--color-border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'all' ? 'var(--color-navy)' : 'transparent',
              color: activeTab === 'all' ? '#FFFFFF' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            All Assignments ({crewReports.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'assigned' ? '#F59E0B' : 'transparent',
              color: activeTab === 'assigned' ? '#000000' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Dispatched ({assignedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'in_progress' ? '#0EA5E9' : 'transparent',
              color: activeTab === 'in_progress' ? '#FFFFFF' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            In Progress ({inProgressTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'resolved' ? '#10B981' : 'transparent',
              color: activeTab === 'resolved' ? '#FFFFFF' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Completed ({resolvedTasks.length})
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Showing {displayedReports.length} Site Tasks
        </div>
      </div>

      {/* Distinct Field Assignment Cards View */}
      {displayedReports.length === 0 ? (
        <div className="modern-card" style={{ padding: 48, textAlign: 'center' }}>
          <CheckCircle2 size={42} color="#10B981" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, color: 'var(--color-navy)', marginBottom: 6 }}>No Assignments in this Category</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            All tasks for this filter have been addressed or no active dispatches match.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {displayedReports.map((report) => {
            const problemType = (report.detection?.problem_type || report.problem_type || 'pothole').toLowerCase();
            const severity = report.detection?.severity_label || report.severity_label || 'medium';
            const evidenceImg = resolveMediaUrl(
              report.detection?.evidence_image_path || report.evidence_image_path || report.evidence_photo
            ) || '/evidence/det-001.svg';

            const isAssigned = report.status === 'assigned';
            const isInProgress = report.status === 'in_progress';
            const isResolved = report.status === 'resolved';

            return (
              <div
                key={report.id}
                className="modern-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20,
                  border: isInProgress
                    ? '1.5px solid #0EA5E9'
                    : isAssigned
                    ? '1.5px solid #F59E0B'
                    : '1px solid var(--color-border-subtle)',
                  borderRadius: 16,
                  boxShadow: isInProgress
                    ? '0 6px 20px rgba(14, 165, 233, 0.12)'
                    : '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  {/* Card Header: Type Badge & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: problemType.includes('garbage') ? '#059669' : problemType.includes('water') ? '#0891B2' : '#EA580C',
                        color: '#FFFFFF',
                        textTransform: 'uppercase'
                      }}>
                        {problemType.includes('garbage') ? '🗑️ Garbage' : problemType.includes('water') ? '💧 Waterlogging' : '🕳️ Pothole'}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: severity === 'high' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                        color: severity === 'high' ? '#DC2626' : '#D97706'
                      }}>
                        {severity.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <div className="status-dot-text">
                      <span className={`status-dot ${isInProgress ? 'blue' : isResolved ? 'green' : 'amber'}`} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Evidence Media & Defect Title */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div
                      onClick={() => setSelectedReport(report)}
                      style={{
                        width: 90,
                        height: 70,
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#0B2545',
                        flexShrink: 0,
                        position: 'relative',
                        border: '1px solid var(--color-border)'
                      }}
                      title="Click to view full evidence & YOLOv8 bounding boxes"
                    >
                      <img
                        src={evidenceImg}
                        alt="Evidence"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/evidence/det-001.svg'; }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.7)',
                        padding: '2px 4px',
                        borderRadius: 4,
                        color: '#FFFFFF'
                      }}>
                        <Eye size={11} />
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.3, marginBottom: 4 }}>
                        {report.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        Assignment ID: <strong>{report.id}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        Assigned To: <strong>{report.assigned_team || 'Road Crew 1'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Location & GPS Info */}
                  <div style={{
                    background: 'var(--color-card-subtle)',
                    padding: '10px 12px',
                    borderRadius: 10,
                    marginBottom: 16,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    border: '1px solid var(--color-border-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-navy)', overflow: 'hidden' }}>
                      <MapPin size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {report.location_name || report.camera?.address || report.camera?.name || 'Municipal Road Sector'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenNavigation(report)}
                      style={{
                        background: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Navigation size={11} /> Route
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <button
                    className="btn-pill-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye size={13} /> View Audit
                  </button>

                  {isAssigned && (
                    <button
                      className="btn-pill-primary"
                      style={{
                        fontSize: 12,
                        padding: '6px 14px',
                        background: '#2563EB',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => startWork(report.id)}
                    >
                      <Wrench size={13} /> Accept & Start
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      className="btn-pill-primary"
                      style={{
                        fontSize: 12,
                        padding: '6px 14px',
                        background: '#10B981',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => setResolveId(report.id)}
                    >
                      <CheckCircle2 size={13} /> Submit Proof
                    </button>
                  )}

                  {isResolved && (
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Work Modal */}
      {resolveId && (
        <ResolveModal
          reportId={resolveId}
          onClose={() => setResolveId(null)}
          onSuccess={(id, notes) => {
            resolveReport(id, notes);
            setResolveId(null);
          }}
        />
      )}

      {/* CCTV / Full Evidence Modal */}
      {selectedReport && (
        <EvidenceModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={() => {}}
          onReject={() => {}}
          onAssign={() => {}}
        />
      )}
    </div>
  );
}
