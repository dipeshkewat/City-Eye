import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, AlertTriangle, FileText, Eye, Users,
  XCircle, ArrowUpRight, Plus, Calendar, ChevronDown, Wrench, Shield, MapPin
} from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import { useTheme } from '../../context/ThemeContext';
import EvidenceModal from '../../components/EvidenceModal';
import RejectModal from '../../components/RejectModal';
import AssignModal from '../../components/AssignModal';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, LineChart, Line } from 'recharts';

export default function OfficerDashboard() {
  const { reports, cameras, approveReport, rejectReport, assignReport } = useReports();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [assignId, setAssignId] = useState(null);
  const [chartView, setChartView] = useState('monthly');
  const { theme } = useTheme();

  // Defect category distribution for space-utilizing telemetry widget
  const potholeCount = reports.filter((r) => {
    const t = (r.detection?.problem_type || r.problem_type || '').toLowerCase();
    return t.includes('pothole') || t.includes('road') || t.includes('crack') || (!t.includes('garbage') && !t.includes('water'));
  }).length;
  const garbageCount = reports.filter((r) => {
    const t = (r.detection?.problem_type || r.problem_type || '').toLowerCase();
    return t.includes('garbage') || t.includes('waste') || t.includes('litter');
  }).length;
  const waterloggingCount = reports.filter((r) => {
    const t = (r.detection?.problem_type || r.problem_type || '').toLowerCase();
    return t.includes('water') || t.includes('drain') || t.includes('flood');
  }).length;

  const totalReportsCount = reports.length || 1;
  const potholePct = Math.round((potholeCount / totalReportsCount) * 100);
  const garbagePct = Math.round((garbageCount / totalReportsCount) * 100);
  const waterloggingPct = Math.round((waterloggingCount / totalReportsCount) * 100);

  const pendingReports = reports.filter((r) => r.status === 'pending_officer_review');
  const approvedReports = reports.filter((r) => r.status === 'approved');
  const assignedReports = reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const rejectedReports = reports.filter((r) => r.status === 'rejected');

  const barData = [
    { month: 'Jan', count: 18, active: false },
    { month: 'Feb', count: 26, active: false },
    { month: 'Mar', count: 22, active: false },
    { month: 'Apr', count: 42, active: true },
    { month: 'May', count: 29, active: false },
    { month: 'Jun', count: 34, active: false },
  ];

  const sparklineData = [
    { v: 40 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 62 }, { v: 85 }, { v: 78 }, { v: 92 }
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Welcome Back, Rajesh</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Mumbai Municipal Corporation • Infrastructure Review & Dispatch Portal
          </p>
        </div>

        <div className="welcome-actions">
          <button className="date-pill-btn">
            <Calendar size={15} color="#359B73" />
            <span>29 Jun, 2026 - 29 Aug, 2026</span>
            <ChevronDown size={14} color="#94A3B8" />
          </button>

          <button className="btn-pill-primary" onClick={() => navigate('/officer/cameras')}>
            <Plus size={16} /> Register Camera
          </button>
        </div>
      </div>

      {/* 4 Classic Top Stat Cards (All Previous Options Available) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="modern-card" style={{ padding: '20px 22px' }}>
          <div className="card-header-row" style={{ marginBottom: 10 }}>
            <div className="card-title-group">
              <h3>Pending Review</h3>
              <p>Requires officer action</p>
            </div>
            <div className="card-corner-arrow" style={{ background: 'var(--color-status-pending-bg)', color: '#D97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
            {pendingReports.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} color="#D97706" /> Immediate action needed
          </div>
        </div>

        <div className="modern-card" style={{ padding: '20px 22px' }}>
          <div className="card-header-row" style={{ marginBottom: 10 }}>
            <div className="card-title-group">
              <h3>Approved (Ready)</h3>
              <p>Ready to assign to crews</p>
            </div>
            <div className="card-corner-arrow" style={{ background: 'var(--color-aquamarine-light)', color: 'var(--color-aquamarine)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-aquamarine)', lineHeight: 1.1 }}>
            {approvedReports.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Verified municipal complaints
          </div>
        </div>

        <div className="modern-card" style={{ padding: '20px 22px' }}>
          <div className="card-header-row" style={{ marginBottom: 10 }}>
            <div className="card-title-group">
              <h3>Active in Field</h3>
              <p>Assigned & in-progress</p>
            </div>
            <div className="card-corner-arrow" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <Wrench size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.1 }}>
            {assignedReports.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Crews working on site
          </div>
        </div>

        <div className="modern-card" style={{ padding: '20px 22px' }}>
          <div className="card-header-row" style={{ marginBottom: 10 }}>
            <div className="card-title-group">
              <h3>Total Reports</h3>
              <p>Cumulative system intake</p>
            </div>
            <div className="card-corner-arrow" style={{ background: 'var(--color-canvas)', color: 'var(--color-navy)' }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.1 }}>
            {reports.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
            From 8 active camera junctions
          </div>
        </div>
      </div>

      {/* 3-Column Visual Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: 24, alignItems: 'start', marginBottom: 24 }}>
        
        {/* COLUMN 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Feature Card in Deep Navy */}
          <div className="feature-card-navy">
            <div className="card-chip">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} color="#359B73" /> MUNICIPAL CCTV
              </span>
              <span style={{ fontSize: 11, background: '#1E5C43', padding: '2px 8px', borderRadius: 20 }}>
                1080p LIVE
              </span>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Surveillance
              </div>
              <div className="card-amount">{cameras.length} Cameras</div>
              <div style={{ fontSize: 12, color: '#E2E8F0', display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>YOLOv8 Inference</span>
                <span style={{ color: '#6EE7B7', fontWeight: 600 }}>Operational</span>
              </div>
            </div>
          </div>

          {/* Quick Reviewed History */}
          <div className="modern-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h3>Recent Audited Reports</h3>
                <p>Officer decision log</p>
              </div>
              <div className="card-corner-arrow" onClick={() => navigate('/officer/reports')}>
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.slice(0, 4).map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{r.camera.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="status-dot-text">
                      <span className={`status-dot ${r.status === 'approved' ? 'green' : r.status === 'pending_officer_review' ? 'amber' : 'blue'}`} />
                      <span style={{ fontSize: 11, textTransform: 'capitalize' }}>{r.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Defect Rate Chart */}
          <div className="modern-card">
            <div className="card-header-row">
              <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-aquamarine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-aquamarine)' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3>Defect Detection Rate</h3>
                  <p>Monthly automated detections</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="segmented-pill-control">
                  <button
                    className={`segmented-pill-btn ${chartView === 'monthly' ? 'active' : ''}`}
                    onClick={() => setChartView('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`segmented-pill-btn ${chartView === 'annually' ? 'active' : ''}`}
                    onClick={() => setChartView('annually')}
                  >
                    Annually
                  </button>
                </div>
              </div>
            </div>

            <div style={{ height: 210, width: '100%', marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={34}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: theme === 'dark' ? '#14181D' : '#0B2545',
                      borderRadius: 12,
                      border: theme === 'dark' ? '1px solid #232932' : 'none',
                      color: '#FFFFFF'
                    }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="count" radius={[20, 20, 20, 20]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.active ? 'var(--color-aquamarine)' : theme === 'dark' ? '#222933' : '#CBD5E1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Defect Category Breakdown & Spatial Triage (Utilizing Dashboard Free Space) */}
          <div className="modern-card">
            <div className="card-header-row" style={{ marginBottom: 14 }}>
              <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-aquamarine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-aquamarine)' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h3>Defect Distribution & Priority</h3>
                  <p>Live municipal defect telemetry</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/officer/map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-aquamarine)',
                  background: 'var(--color-aquamarine-light)',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
                title="Open Live Incident Map"
              >
                <span>Live Map</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Potholes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
                    🕳️ Potholes & Road Damage
                  </span>
                  <span style={{ fontWeight: 700, color: '#F97316' }}>
                    {potholeCount} ({potholePct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--color-card-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${potholePct}%`, height: '100%', background: '#F97316', borderRadius: 3 }} />
                </div>
              </div>

              {/* Garbage */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    🗑️ Garbage & Waste Accumulation
                  </span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>
                    {garbageCount} ({garbagePct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--color-card-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${garbagePct}%`, height: '100%', background: '#10B981', borderRadius: 3 }} />
                </div>
              </div>

              {/* Waterlogging */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4' }} />
                    💧 Waterlogging & Blocked Drains
                  </span>
                  <span style={{ fontWeight: 700, color: '#06B6D4' }}>
                    {waterloggingCount} ({waterloggingPct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--color-card-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${waterloggingPct}%`, height: '100%', background: '#06B6D4', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* Quick Stat Footer */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11
              }}
            >
              <span style={{ color: 'var(--color-text-muted)' }}>
                Average AI Confidence: <strong style={{ color: 'var(--color-aquamarine)' }}>94.6%</strong>
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                Active Zones: <strong style={{ color: 'var(--color-text-main)' }}>8 Monitored</strong>
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SLA Performance */}
          <div className="modern-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h3>SLA Performance</h3>
                <p>Resolution turnaround</p>
              </div>
              <div className="card-corner-arrow" onClick={() => navigate('/senior/analytics')}>
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)', marginBottom: 6 }}>
              94.2% On-Time
            </div>

            <div style={{ height: 80, width: '100%', marginBottom: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="v" stroke="#359B73" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-pill-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  pendingReports.forEach((r) => approveReport(r.id));
                }}
              >
                Approve All ↑
              </button>
              <button
                className="btn-pill-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => navigate('/officer/reports')}
              >
                All Reports ↓
              </button>
            </div>
          </div>

          {/* Active Field Crews */}
          <div className="modern-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h3>Field Crews On Duty</h3>
                <p>Assigned work teams</p>
              </div>
              <span className="pill-badge-green">+100%</span>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-navy)', marginBottom: 14 }}>
              {assignedReports.length} Dispatches Active
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Field Teams
              </div>
              <div className="avatar-stack">
                <div className="avatar-stack-item">VP</div>
                <div className="avatar-stack-item" style={{ background: '#0284C7' }}>SD</div>
                <div className="avatar-stack-item" style={{ background: '#4F46E5' }}>GS</div>
                <div className="avatar-stack-item badge-extra">+2</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL PRIORITY REVIEW QUEUE TABLE (Full Previous Features Restored) */}
      <div className="modern-card" style={{ marginBottom: 24 }}>
        <div className="card-header-row">
          <div className="card-title-group">
            <h3>Priority Review Queue (Single-Camera Multi-Frame Confirmed)</h3>
            <p>Every confirmed candidate requires human inspection before becoming an official complaint</p>
          </div>
          <span className="pill-badge-green">{pendingReports.length} Awaiting Verification</span>
        </div>

        {pendingReports.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={40} color="#359B73" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>Review queue is clear!</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>All candidate detections have been verified. New incidents will appear automatically.</div>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Report Details</th>
                <th>Type</th>
                <th>Severity</th>
                <th>AI Confidence</th>
                <th>Temporal Frames</th>
                <th>Camera Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map((report) => (
                <tr key={report.id}>
                  <td style={{ width: 75 }}>
                    <div
                      onClick={() => setSelectedReport(report)}
                      style={{
                        width: 68,
                        height: 44,
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#0B2545',
                        border: '1px solid var(--color-border)'
                      }}
                      title="Click to view evidence frame"
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
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: 13 }}>{report.title}</div>
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
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-aquamarine)' }}>
                    {Math.round((report.detection.confidence || 0.9) * 100)}%
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-body)' }}>
                    {report.detection.confirmed_frame_count} frames
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--color-navy)', fontWeight: 600 }}>{report.camera.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{report.camera.address}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-pill-secondary"
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        onClick={() => setSelectedReport(report)}
                        title="Inspect Evidence Frame"
                      >
                        <Eye size={13} /> Inspect
                      </button>
                      <button
                        className="btn-pill-primary"
                        style={{ padding: '5px 12px', fontSize: 11 }}
                        onClick={() => approveReport(report.id)}
                        title="Approve Report"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        className="btn-pill-secondary"
                        style={{ padding: '5px 10px', fontSize: 11, color: '#DC2626' }}
                        onClick={() => setRejectId(report.id)}
                        title="Reject Report"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* APPROVED REPORTS AWAITING DISPATCH SECTION */}
      {approvedReports.length > 0 && (
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Approved Complaints Ready for Field Dispatch</h3>
              <p>Assign verified reports to municipal work crews</p>
            </div>
            <span className="pill-badge-green">{approvedReports.length} Ready</span>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Target Department</th>
                <th>Severity</th>
                <th>Approved Timestamp</th>
                <th>Dispatch Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: 13 }}>{report.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{report.camera.address}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-aquamarine)' }}>
                    {report.recommended_department || 'Road Maintenance'}
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: report.detection.severity_label === 'high' ? '#DC2626' : '#D97706'
                    }}>
                      {report.detection.severity_label.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(report.reviewed_at || Date.now()).toLocaleTimeString()}
                  </td>
                  <td>
                    <button
                      className="btn-pill-primary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => setAssignId(report.id)}
                    >
                      <Users size={14} /> Dispatch Crew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {selectedReport && (
        <EvidenceModal
          report={selectedReport}
          userRole="officer"
          onClose={() => setSelectedReport(null)}
          onApprove={(id) => approveReport(id)}
          onReject={(id) => setRejectId(id)}
          onAssign={(id) => setAssignId(id)}
        />
      )}

      {rejectId && (
        <RejectModal
          reportId={rejectId}
          onClose={() => setRejectId(null)}
          onConfirm={(id, reason) => rejectReport(id, reason)}
        />
      )}

      {assignId && (
        <AssignModal
          reportId={assignId}
          onClose={() => setAssignId(null)}
          onConfirm={(id, teamId) => assignReport(id, teamId)}
        />
      )}
    </div>
  );
}
