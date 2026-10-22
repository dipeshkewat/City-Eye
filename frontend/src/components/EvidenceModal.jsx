import { useState } from 'react';
import { Eye, CheckCircle2, XCircle, Users, AlertTriangle, ShieldCheck, Camera, MapPin, Cpu, FileText } from 'lucide-react';
import FullReportModal from './FullReportModal';

export default function EvidenceModal({ report, onClose, onApprove, onReject, onAssign, userRole }) {
  const [showBbox, setShowBbox] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  if (!report) return null;

  const det = report.detection || {};
  const cam = report.camera || {};

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840 }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="pill-badge-green" style={{ textTransform: 'uppercase' }}>
                {det.problem_type || 'Civic Issue'}
              </span>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-navy)' }}>
                {report.title}
              </span>
            </div>
            <button className="icon-btn-circle" style={{ width: 32, height: 32 }} onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {/* CCTV Frame */}
            <div style={{ position: 'relative', width: '100%', height: 360, background: '#0B2545', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
              <img
                src={det.evidence_image_path || '/evidence/det-001.svg'}
                alt="CCTV Evidence Frame"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/evidence/det-001.svg';
                }}
              />

              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                <button
                  className={showBbox ? 'btn-pill-primary' : 'btn-pill-secondary'}
                  style={{ fontSize: 11, padding: '6px 14px' }}
                  onClick={() => setShowBbox(!showBbox)}
                >
                  <Cpu size={14} /> {showBbox ? 'YOLO Bounding Box: ON' : 'Bounding Box: OFF'}
                </button>
              </div>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 14px', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Confidence</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-aquamarine)' }}>
                  {Math.round((det.confidence || 0.9) * 100)}%
                </div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 14px', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Persistence</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-navy)' }}>
                  {det.confirmed_frame_count || 8} Frames
                </div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 14px', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Severity</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>
                  {det.severity_score || '0.85'} ({det.severity_label || 'high'})
                </div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 14px', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {report.recommended_department || 'Road Maintenance'}
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#359B73" /> Official Municipal Report (LLM)
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                  {report.description}
                </p>
              </div>

              <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={16} color="#0284C7" /> Citizen Summary
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                  {report.citizen_summary}
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--color-canvas)', padding: '10px 14px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--color-navy)', fontWeight: 600 }}>
                Location: {cam.name || 'Junction Cam'} • {cam.address}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Lat {cam.latitude}, Lng {cam.longitude}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-pill-secondary" onClick={onClose}>Close</button>

            {/* SEE FULL REPORT BUTTON — always visible */}
            <button
              className="btn-pill-secondary"
              style={{
                color: 'var(--color-aquamarine)',
                borderColor: 'var(--color-aquamarine)',
                fontWeight: 700,
              }}
              onClick={() => setShowFullReport(true)}
            >
              <FileText size={15} /> See Full Report
            </button>
            
            {userRole === 'officer' && report.status === 'pending_officer_review' && (
              <>
                <button
                  className="btn-pill-secondary"
                  style={{ color: '#DC2626' }}
                  onClick={() => { onReject(report.id); onClose(); }}
                >
                  Reject Report
                </button>
                <button
                  className="btn-pill-primary"
                  onClick={() => { onApprove(report.id); onClose(); }}
                >
                  Approve Report
                </button>
              </>
            )}

            {userRole === 'officer' && report.status === 'approved' && (
              <button
                className="btn-pill-primary"
                onClick={() => { onAssign(report.id); onClose(); }}
              >
                Assign to Crew
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Report Modal */}
      {showFullReport && (
        <FullReportModal
          report={report}
          onClose={() => setShowFullReport(false)}
        />
      )}
    </>
  );
}
