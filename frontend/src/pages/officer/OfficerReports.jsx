import { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import EvidenceModal from '../../components/EvidenceModal';

export default function OfficerReports() {
  const { reports } = useReports();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.camera.address.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.detection.problem_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const exportCSV = () => {
    const headers = 'ID,Title,Problem Type,Severity,Confidence,Status,Camera,Address,Created At\n';
    const rows = filteredReports.map((r) =>
      `"${r.id}","${r.title}","${r.detection.problem_type}","${r.detection.severity_label}","${r.detection.confidence}","${r.status}","${r.camera.name}","${r.camera.address}","${r.created_at}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cityeye-reports-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Incident Reports Directory</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Complete audit trail of all AI-detected and verified civic issues
          </p>
        </div>
        <button className="btn-pill-primary" onClick={exportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filter Row */}
      <div className="modern-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 38, borderRadius: 9999 }}
              placeholder="Search reports by keyword, ID, or street address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="segmented-pill-control">
            <button
              className={`segmented-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Statuses
            </button>
            <button
              className={`segmented-pill-btn ${statusFilter === 'pending_officer_review' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending_officer_review')}
            >
              Pending
            </button>
            <button
              className={`segmented-pill-btn ${statusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`segmented-pill-btn ${statusFilter === 'resolved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('resolved')}
            >
              Resolved
            </button>
          </div>

          <div className="segmented-pill-control">
            <button
              className={`segmented-pill-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </button>
            <button
              className={`segmented-pill-btn ${typeFilter === 'pothole' ? 'active' : ''}`}
              onClick={() => setTypeFilter('pothole')}
            >
              Potholes
            </button>
            <button
              className={`segmented-pill-btn ${typeFilter === 'garbage' ? 'active' : ''}`}
              onClick={() => setTypeFilter('garbage')}
            >
              Garbage
            </button>
            <button
              className={`segmented-pill-btn ${typeFilter === 'waterlogging' ? 'active' : ''}`}
              onClick={() => setTypeFilter('waterlogging')}
            >
              Waterlogging
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="modern-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <h3>Registered Incidents</h3>
            <p>{filteredReports.length} records matching current criteria</p>
          </div>
          <span className="pill-badge-green">{filteredReports.length} Total</span>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Incident Details</th>
              <th>Problem Type</th>
              <th>Severity</th>
              <th>AI Confidence</th>
              <th>Camera Location</th>
              <th>Status</th>
              <th>Date</th>
              <th>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
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
                <td style={{ fontWeight: 700, color: 'var(--color-aquamarine)' }}>
                  {Math.round((report.detection.confidence || 0.9) * 100)}%
                </td>
                <td>
                  <div style={{ fontSize: 13, color: 'var(--color-navy)', fontWeight: 600 }}>{report.camera.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{report.camera.address}</div>
                </td>
                <td>
                  <div className="status-dot-text">
                    <span className={`status-dot ${report.status === 'resolved' ? 'green' : report.status === 'pending_officer_review' ? 'amber' : 'blue'}`} />
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{report.status.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-pill-secondary"
                    style={{ padding: '4px 12px', fontSize: 11 }}
                    onClick={() => setSelectedReport(report)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <EvidenceModal
          report={selectedReport}
          userRole="officer"
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
