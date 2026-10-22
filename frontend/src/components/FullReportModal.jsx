import { useRef } from 'react';
import {
  FileText, Download, X, Camera, MapPin, Shield, AlertTriangle,
  Clock, Cpu, CheckCircle2, Building2, Activity
} from 'lucide-react';

export default function FullReportModal({ report, onClose }) {
  const reportRef = useRef(null);

  if (!report) return null;

  const det = report.detection || {};
  const cam = report.camera || {};

  const reportDate = new Date(report.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const reportTime = new Date(report.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const confidencePct = Math.round((det.confidence || 0.9) * 100);
  const severityPct = Math.round((det.severity_score || 0.5) * 100);

  const getSeverityColor = (label) => {
    if (label === 'high') return '#DC2626';
    if (label === 'medium') return '#D97706';
    return '#10B981';
  };

  const getStatusLabel = (status) => {
    const map = {
      'pending_officer_review': 'Pending Review',
      'approved': 'Approved',
      'assigned': 'Assigned to Crew',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      'pending_officer_review': '#D97706',
      'approved': '#359B73',
      'assigned': '#4F46E5',
      'in_progress': '#0284C7',
      'resolved': '#10B981',
      'rejected': '#DC2626'
    };
    return map[status] || '#64748B';
  };

  const handleDownload = () => {
    const el = reportRef.current;
    if (!el) return;

    // Build a standalone HTML document for printing / downloading as PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CityEye Incident Report — ${report.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #0B2545; padding: 40px; line-height: 1.5; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #359B73; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 40px; height: 40px; background: #359B73; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 16px; }
    .brand-text h1 { font-size: 22px; font-weight: 800; color: #0B2545; }
    .brand-text p { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta { text-align: right; font-size: 12px; color: #64748B; }
    .meta strong { color: #0B2545; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 800; color: #359B73; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { background: #F8FAFC; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; }
    .info-item .label { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-item .value { font-size: 15px; font-weight: 700; color: #0B2545; margin-top: 2px; }
    .description { background: #F8FAFC; padding: 14px 16px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 13px; color: #334155; line-height: 1.6; }
    .evidence-frame { width: 100%; height: 300px; background: #0B2545; border-radius: 14px; overflow: hidden; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; }
    .evidence-frame img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .footer { margin-top: 30px; padding-top: 14px; border-top: 2px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; }
    .footer strong { color: #0B2545; }
    .stamp { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; }
    .severity-high { background: #FEE2E2; color: #DC2626; }
    .severity-medium { background: #FEF3C7; color: #D97706; }
    .severity-low { background: #D1FAE5; color: #10B981; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">CE</div>
      <div class="brand-text">
        <h1>CityEye</h1>
        <p>AI-Powered Civic Infrastructure Intelligence</p>
      </div>
    </div>
    <div class="meta">
      <div><strong>Report ID:</strong> ${report.id}</div>
      <div><strong>Date:</strong> ${reportDate}</div>
      <div><strong>Time:</strong> ${reportTime}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Incident Details</div>
    <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 10px;">${report.title}</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Problem Type</div>
        <div class="value" style="text-transform: capitalize;">${det.problem_type || 'Civic Issue'}</div>
      </div>
      <div class="info-item">
        <div class="label">Status</div>
        <div class="value" style="color: ${getStatusColor(report.status)};">${getStatusLabel(report.status)}</div>
      </div>
      <div class="info-item">
        <div class="label">AI Confidence Score</div>
        <div class="value" style="color: #359B73;">${confidencePct}%</div>
      </div>
      <div class="info-item">
        <div class="label">Severity Score</div>
        <div class="value" style="color: ${getSeverityColor(det.severity_label)};">${severityPct}% (${(det.severity_label || 'medium').toUpperCase()})</div>
      </div>
      <div class="info-item">
        <div class="label">Temporal Persistence</div>
        <div class="value">${det.confirmed_frame_count || 5} Confirmed Frames</div>
      </div>
      <div class="info-item">
        <div class="label">Recommended Department</div>
        <div class="value">${report.recommended_department || 'Road Maintenance'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">CCTV Evidence Frame</div>
    <div class="evidence-frame">
      <img src="${det.evidence_image_path || '/evidence/det-001.svg'}" alt="CCTV Evidence" />
    </div>
  </div>

  <div class="section">
    <div class="section-title">Camera / Location Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Camera Name</div>
        <div class="value">${cam.name || 'Junction Cam'}</div>
      </div>
      <div class="info-item">
        <div class="label">Address</div>
        <div class="value">${cam.address || 'Mumbai'}</div>
      </div>
      <div class="info-item">
        <div class="label">Latitude</div>
        <div class="value">${cam.latitude || '19.076'}</div>
      </div>
      <div class="info-item">
        <div class="label">Longitude</div>
        <div class="value">${cam.longitude || '72.8777'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Official Municipal Report (AI-Generated)</div>
    <div class="description">${report.description || 'No description available.'}</div>
  </div>

  <div class="section">
    <div class="section-title">Citizen Summary</div>
    <div class="description">${report.citizen_summary || 'No citizen summary available.'}</div>
  </div>

  ${report.resolution_notes ? `
  <div class="section">
    <div class="section-title">Resolution Notes</div>
    <div class="description">${report.resolution_notes}</div>
  </div>
  ` : ''}

  <div class="footer">
    <div>Generated by <strong>CityEye AI Platform</strong> — Automated Infrastructure Monitoring</div>
    <div>Report generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</div>
  </div>
</body>
</html>`;

    // Open in new window for Print / PDF download
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 920, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--color-aquamarine)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13
            }}>
              CE
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)' }}>
                Full Incident Report
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                CityEye AI-Powered Civic Infrastructure Intelligence
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-pill-primary" onClick={handleDownload} style={{ padding: '8px 18px', fontSize: 12 }}>
              <Download size={14} /> Download Report
            </button>
            <button className="icon-btn-circle" style={{ width: 32, height: 32 }} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="modal-body" ref={reportRef} style={{ padding: '24px 28px' }}>
          {/* Report ID + Date Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-navy)', marginBottom: 4 }}>
                {report.title}
              </h2>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {report.id}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Detected on
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }}>
                {reportDate} • {reportTime}
              </div>
            </div>
          </div>

          {/* Status + Severity Row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999,
              background: getStatusColor(report.status) + '1A',
              color: getStatusColor(report.status),
              fontWeight: 700, fontSize: 12, border: `1px solid ${getStatusColor(report.status)}30`
            }}>
              <CheckCircle2 size={13} /> {getStatusLabel(report.status)}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999,
              background: getSeverityColor(det.severity_label) + '1A',
              color: getSeverityColor(det.severity_label),
              fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
              border: `1px solid ${getSeverityColor(det.severity_label)}30`
            }}>
              <AlertTriangle size={13} /> {det.severity_label || 'medium'} Severity
            </span>
            <span className="pill-badge-subtle" style={{ textTransform: 'capitalize', fontWeight: 700 }}>
              <Cpu size={13} /> {det.problem_type || 'civic issue'}
            </span>
          </div>

          {/* CCTV Evidence Frame */}
          <div style={{
            position: 'relative', width: '100%', height: 320,
            background: '#0B2545', borderRadius: 18, overflow: 'hidden', marginBottom: 20
          }}>
            <img
              src={det.evidence_image_path || '/evidence/det-001.svg'}
              alt="CCTV Evidence Frame"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.src = '/evidence/det-001.svg'; }}
            />
            <div style={{
              position: 'absolute', bottom: 12, left: 14,
              background: 'rgba(0,0,0,0.7)', borderRadius: 8,
              padding: '6px 12px', fontSize: 11, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
            }}>
              <Camera size={13} /> CCTV Evidence Frame • {det.confirmed_frame_count || 5} Frames Confirmed
            </div>
          </div>

          {/* AI Metrics Grid */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
            }}>
              <Activity size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              AI Detection Metrics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ background: 'var(--color-canvas)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Confidence</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-aquamarine)' }}>{confidencePct}%</div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Severity</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: getSeverityColor(det.severity_label) }}>
                  {severityPct}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: getSeverityColor(det.severity_label), textTransform: 'uppercase' }}>
                  {det.severity_label || 'medium'}
                </div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Persistence</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-navy)' }}>{det.confirmed_frame_count || 5}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Frames</div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)', marginTop: 4 }}>
                  <Building2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {report.recommended_department || 'Road Maintenance'}
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
            }}>
              <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Camera &amp; Location Information
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12
            }}>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Camera</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)', marginTop: 2 }}>{cam.name || 'Junction Cam'}</div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Address</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)', marginTop: 2 }}>{cam.address || 'Mumbai'}</div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>GPS Coordinates</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-navy)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {cam.latitude}, {cam.longitude}
                </div>
              </div>
              <div style={{ background: 'var(--color-canvas)', padding: '12px 16px', borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Detection Source</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)', marginTop: 2 }}>
                  {report.generation_source === 'llm' ? 'LLM-Generated Report' : 'Template Fallback'}
                </div>
              </div>
            </div>
          </div>

          {/* Official Report & Citizen Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} color="#359B73" /> Official Municipal Report
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.6 }}>
                {report.description || 'No description available.'}
              </p>
            </div>
            <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} color="#0284C7" /> Citizen Summary
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.6 }}>
                {report.citizen_summary || 'No citizen summary available.'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
            }}>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Report Timeline
            </div>
            <div style={{
              background: 'var(--color-canvas)', padding: 16, borderRadius: 14,
              border: '1px solid var(--color-border-subtle)',
              display: 'flex', flexDirection: 'column', gap: 10
            }}>
              <TimelineRow label="AI Detection" time={report.created_at} color="#0284C7" />
              {report.reviewed_at && <TimelineRow label={report.status === 'rejected' ? 'Rejected by Officer' : 'Approved by Officer'} time={report.reviewed_at} color={report.status === 'rejected' ? '#DC2626' : '#359B73'} />}
              {report.assigned_at && <TimelineRow label="Assigned to Field Crew" time={report.assigned_at} color="#4F46E5" />}
              {report.in_progress_at && <TimelineRow label="Work Started" time={report.in_progress_at} color="#D97706" />}
              {report.resolved_at && <TimelineRow label="Issue Resolved" time={report.resolved_at} color="#10B981" />}
            </div>
          </div>

          {/* Resolution Notes if resolved */}
          {report.resolution_notes && (
            <div style={{ marginTop: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
              }}>
                Resolution Notes
              </div>
              <div style={{
                background: 'var(--color-canvas)', padding: 16, borderRadius: 14,
                border: '1px solid var(--color-border-subtle)',
                fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.6
              }}>
                {report.resolution_notes}
              </div>
            </div>
          )}

          {/* Footer Stamp */}
          <div style={{
            marginTop: 24, paddingTop: 16,
            borderTop: '2px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--color-text-muted)'
          }}>
            <span>Generated by <strong style={{ color: 'var(--color-navy)' }}>CityEye AI Platform</strong></span>
            <span>Report generated on {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-pill-secondary" onClick={onClose}>Close</button>
          <button className="btn-pill-primary" onClick={handleDownload}>
            <Download size={15} /> Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ label, time, color }) {
  const d = new Date(time);
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: color, flexShrink: 0,
        boxShadow: `0 0 0 3px ${color}30`
      }} />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-navy)' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {dateStr} • {timeStr}
      </div>
    </div>
  );
}
