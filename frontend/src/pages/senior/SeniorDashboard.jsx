import { useState } from 'react';
import { FileText, CheckCircle2, Clock, Activity, ArrowUpRight, MapPin } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import StatusMap from '../../components/StatusMap';
import TypeChart from '../../components/TypeChart';
import StatusChart from '../../components/StatusChart';
import EvidenceModal from '../../components/EvidenceModal';

export default function SeniorDashboard() {
  const { reports, cameras } = useReports();
  const [selectedReport, setSelectedReport] = useState(null);

  const pending = reports.filter((r) => r.status === 'pending_officer_review').length;
  const approved = reports.filter((r) => r.status === 'approved').length;
  const inProgress = reports.filter((r) => r.status === 'in_progress').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Executive Oversight & Transparency</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            City-wide infrastructure health, SLA tracking, and resolution auditing
          </p>
        </div>
        <span className="pill-badge-green">PostGIS Connected</span>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Total Incidents</h3>
              <p>All camera feeds</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)' }}>
            {reports.length}
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Pending Verification</h3>
              <p>Review queue</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-status-pending)' }}>
            {pending}
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Active Repairs</h3>
              <p>Field crews on-site</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-navy)' }}>
            {inProgress}
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Resolved</h3>
              <p>Proof verified</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-aquamarine)' }}>
            {resolved}
          </div>
        </div>
      </div>

      {/* Map & Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="modern-card" style={{ padding: 20 }}>
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Geospatial Incident Map</h3>
              <p>Leaflet real-time camera nodes</p>
            </div>
            <span className="pill-badge-green">{cameras.length} Active Nodes</span>
          </div>

          <div style={{ height: 380, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <StatusMap reports={reports} cameras={cameras} />
          </div>
        </div>

        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Defect Distribution</h3>
              <p>By problem classification</p>
            </div>
            <div className="card-corner-arrow">
              <ArrowUpRight size={16} />
            </div>
          </div>

          <TypeChart reports={reports} />
        </div>
      </div>

      {selectedReport && (
        <EvidenceModal
          report={selectedReport}
          userRole="senior_officer"
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
