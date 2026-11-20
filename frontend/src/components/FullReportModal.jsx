import { useRef } from 'react';
import {
  FileText, Download, X, Camera, MapPin, Shield, AlertTriangle,
  Clock, Cpu, CheckCircle2, Building2, Activity, Sparkles
} from 'lucide-react';
import { resolveMediaUrl } from '../api';

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

  const rawConf = det.confidence ?? report.confidence ?? 0.9;
  const confidencePct = rawConf > 1 ? Math.min(100, Math.round(rawConf)) : Math.round(rawConf * 100);

  const rawScore = det.severity_score ?? report.severity_score ?? 85;
  const severityPct = rawScore > 1 ? Math.min(100, Math.round(rawScore)) : Math.round(rawScore * 100);

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

    const pType = (det.problem_type || report.problem_type || 'Civic Issue').toLowerCase();
    const pTypeCap = pType.charAt(0).toUpperCase() + pType.slice(1);
    const mediaName = report.title?.includes('(')
      ? report.title.split('(')[1]?.split(')')[0]
      : 'User Media Upload';
    const locationStr = cam.address || 'SV Road Junction, Bandra West';
    const framesCount = det.confirmed_frame_count || report.confirmed_frame_count || 5;
    const sevLabel = (det.severity_label || report.severity_label || 'high').toUpperCase();
    const confVal = confidencePct;
    const deptName = report.recommended_department || (
      pType.includes('garbage')
        ? 'Solid Waste Management Department'
        : (pType.includes('water') ? 'Stormwater & Drainage Department' : 'Road Maintenance & Infrastructure (PWD)')
    );

    let actionText = '';
    if (pType.includes('garbage')) {
      actionText = 'Immediate on-site inspection and deployment of solid waste collection crew with hydraulic skip loader';
    } else if (pType.includes('water')) {
      actionText = 'Immediate on-site inspection, stormwater drain clearance, and mobile dewatering pump deployment';
    } else {
      actionText = 'Immediate on-site inspection, barricading, and cold-mix bitumen patching';
    }

    // Build a standalone HTML document formatted specifically for clean 2-page print / PDF export
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CityEye Incident Report — ${report.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #0B2545; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    
    @page {
      size: A4 portrait;
      margin: 12mm 16mm;
    }

    .page {
      width: 100%;
      min-height: 255mm;
      position: relative;
    }
    
    .page-1 {
      page-break-after: always;
      break-after: page;
      padding-bottom: 20px;
    }

    .page-2 {
      page-break-before: always;
      break-before: page;
      padding-top: 14px;
    }

    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #359B73; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 38px; height: 38px; background: #359B73; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 15px; }
    .brand-text h1 { font-size: 20px; font-weight: 800; color: #0B2545; }
    .brand-text p { font-size: 10.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta { text-align: right; font-size: 11.5px; color: #64748B; }
    .meta strong { color: #0B2545; }

    .header-mini {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 22px;
    }

    .section { margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 800; color: #359B73; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .info-item { background: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0; }
    .info-item .label { font-size: 9.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-item .value { font-size: 14px; font-weight: 700; color: #0B2545; margin-top: 2px; }

    .evidence-frame { width: 100%; height: 235px; background: #0B2545; border-radius: 12px; overflow: hidden; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
    .evidence-frame img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Page 2 Cards */
    .section-block { margin-bottom: 22px; }
    .section-heading { font-size: 15px; font-weight: 800; color: #0B2545; margin-bottom: 8px; }
    .card-box {
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 9px;
      padding: 16px 18px;
      font-size: 13px;
      color: #334155;
      line-height: 1.6;
    }
    
    .officer-box {
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 9px;
      padding: 18px 20px;
    }

    .checkbox-row {
      display: flex;
      gap: 36px;
      align-items: center;
      margin-bottom: 16px;
      font-size: 13.5px;
      font-weight: 700;
      color: #0B2545;
    }
    .check-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .check-square {
      display: inline-block;
      width: 17px;
      height: 17px;
      border: 2px solid #475569;
      border-radius: 4px;
      background: #fff;
    }

    .officer-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 12.5px;
      color: #334155;
    }
    .field-row {
      display: flex;
      align-items: baseline;
    }
    .field-label {
      min-width: 145px;
      font-weight: 600;
      color: #1E293B;
    }
    .field-line {
      flex: 1;
      border-bottom: 1.5px dotted #94A3B8;
      height: 14px;
    }

    .footer-official {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1.5px solid #CBD5E1;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
    }
    .footer-official strong { color: #0B2545; }

    @media print {
      body { padding: 0; }
      .page-1 { page-break-after: always; break-after: page; }
      .page-2 { page-break-before: always; break-before: page; }
    }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page page-1">
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
      <h2 style="font-size: 17px; font-weight: 800; margin-bottom: 8px;">${report.title}</h2>
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
          <div class="value">${deptName}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">CCTV Evidence Frame</div>
      <div class="evidence-frame">
        <img src="${resolveMediaUrl(det.evidence_image_path || report.evidence_image_path) || '/evidence/det-001.svg'}" alt="CCTV Evidence" />
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
  </div>

  <!-- PAGE 2 -->
  <div class="page page-2">
    <div class="header-mini">
      <span>CityEye Incident Report — ${report.id}</span>
      <span>Official Record — Page 2 of 2</span>
    </div>

    <!-- Summary (Requested: Plain 'Summary' heading) -->
    <div class="section-block">
      <div class="section-heading">Summary</div>
      <div class="card-box">
        <p style="margin-bottom: 8px;">
          Automated AI detection on user-uploaded media (${mediaName}) confirms a <strong>${pType}</strong> with <strong>${confVal}%</strong> confidence. Temporal analysis verifies presence across <strong>${framesCount} consecutive frames</strong>. The detected object is classified as a <strong>${sevLabel.toLowerCase()}</strong>-severity road hazard located at <strong>${locationStr}</strong>. Immediate municipal triage is recommended for public safety.
        </p>
        ${report.citizen_summary && !report.citizen_summary.toLowerCase().includes('automated computer vision') ? `
        <p style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #CBD5E1; color: #475569; font-size: 12.5px;">
          ${report.citizen_summary}
        </p>
        ` : ''}
      </div>
    </div>

    <!-- Recommended Action -->
    <div class="section-block">
      <div class="section-heading">Recommended Action</div>
      <div class="card-box">
        <div style="font-size: 14.5px; font-weight: 800; color: #0B2545; margin-bottom: 5px;">
          ${deptName}
        </div>
        <div style="font-size: 13px; color: #334155;">
          <strong>Recommendation:</strong> ${actionText}. <strong>Priority:</strong> <span style="font-weight: 800; color: ${getSeverityColor(det.severity_label)};">${sevLabel}</span>.
        </div>
      </div>
    </div>

    <!-- Officer Review Form -->
    <div class="section-block">
      <div class="section-heading">Officer Review</div>
      <div class="officer-box">
        <div class="checkbox-row">
          <span class="check-item"><span class="check-square"></span> Approve</span>
          <span class="check-item"><span class="check-square"></span> Reject</span>
        </div>
        <div class="officer-fields">
          <div class="field-row">
            <span class="field-label">Reviewed by:</span>
            <span class="field-line"></span>
          </div>
          <div class="field-row">
            <span class="field-label">Review date:</span>
            <span class="field-line"></span>
          </div>
          <div class="field-row">
            <span class="field-label">Digital approval ref:</span>
            <span class="field-line"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Official Footer Note -->
    <div class="footer-official">
      <div>
        Generated by <strong>CityEye</strong> – AI-Assisted Municipal Infrastructure Monitoring.<br/>
        <span style="font-size: 10.5px; color: #64748B;">Note: Final action requires authorized officer verification.</span>
      </div>
      <div style="text-align: right;">
        Report generated on ${reportDate} at ${reportTime}
      </div>
    </div>
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
            {(report.generation_source === 'gemini' || det.generation_source === 'gemini') && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 9999,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#0284c7', fontWeight: 700, fontSize: 12,
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}>
                <Sparkles size={13} /> Gemini Multimodal AI
              </span>
            )}
          </div>

          {/* CCTV Evidence Frame */}
          <div style={{
            position: 'relative', width: '100%', height: 320,
            background: '#0B2545', borderRadius: 18, overflow: 'hidden', marginBottom: 20
          }}>
            <img
              src={resolveMediaUrl(det.evidence_image_path || report.evidence_image_path) || '/evidence/det-001.svg'}
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

          {/* Summary & Recommended Action */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={15} color="#359B73" /> Summary
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.6 }}>
                {report.citizen_summary || report.description || 'Automated AI detection confirms road defect at location. Immediate municipal triage recommended for public safety.'}
              </p>
            </div>
            <div style={{ background: 'var(--color-canvas)', padding: 16, borderRadius: 16, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={15} color="#0284C7" /> Recommended Action
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-navy)', marginBottom: 4 }}>
                {report.recommended_department || 'Road Maintenance & Infrastructure (PWD)'}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Priority: <strong style={{ color: getSeverityColor(det.severity_label), textTransform: 'uppercase' }}>{det.severity_label || 'high'}</strong>. Immediate on-site inspection and remedial action.
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
