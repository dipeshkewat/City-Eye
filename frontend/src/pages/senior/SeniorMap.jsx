import { MapPin, ShieldCheck } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import StatusMap from '../../components/StatusMap';

export default function SeniorMap() {
  const { reports, cameras } = useReports();

  return (
    <>
      <div className="topbar-header">
        <div>
          <h1 className="page-title">City-Wide Infrastructure Geospatial Map</h1>
          <p className="page-description">Real-time coordinates and incident status markers across Mumbai municipality</p>
        </div>
        <span className="badge badge-approved">{cameras.length} Active Streams</span>
      </div>

      <div className="page-body">
        <div className="panel" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <span className="panel-title">
              <MapPin size={18} color="#359B73" /> Active Camera Sites & Confirmed Issues
            </span>
            <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span className="badge badge-pending">Pending Review</span>
              <span className="badge badge-approved">Approved</span>
              <span className="badge badge-in-progress">In Progress</span>
              <span className="badge badge-resolved">Resolved</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <StatusMap reports={reports} cameras={cameras} />
          </div>
        </div>
      </div>
    </>
  );
}
