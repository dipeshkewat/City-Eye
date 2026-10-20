import { MapPin } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import StatusMap from '../../components/StatusMap';

export default function SeniorMap() {
  const { reports, cameras } = useReports();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 16 }}>
      <div className="topbar-header" style={{ marginBottom: 0, paddingBottom: 0 }}>
        <div>
          <h1 className="page-title">City-Wide Infrastructure Geospatial Map</h1>
          <p className="page-description">Real-time coordinates and incident status markers across Mumbai municipality</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-approved" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} /> {cameras.length} Active Camera Sites
          </span>
          <span className="badge badge-pending">
            {reports.length} Tracked Incidents
          </span>
        </div>
      </div>

      <div className="panel" style={{ flex: 1, minHeight: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <StatusMap reports={reports} cameras={cameras} />
      </div>
    </div>
  );
}
