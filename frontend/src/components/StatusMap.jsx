import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  pending_officer_review: '#D97706',
  approved: '#359B73',
  rejected: '#DC2626',
  assigned: '#4F46E5',
  in_progress: '#0284C7',
  resolved: '#10B981',
};

const STATUS_LABELS = {
  pending_officer_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function StatusMap({ reports = [], cameras = [] }) {
  const center = [19.0760, 72.8600];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#061526' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {reports.map((report) => {
          const color = STATUS_COLORS[report.status] || '#359B73';
          const radius = report.detection.severity_label === 'high' ? 14 : report.detection.severity_label === 'medium' ? 10 : 8;

          return (
            <CircleMarker
              key={report.id}
              center={[report.camera.latitude, report.camera.longitude]}
              radius={radius}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ padding: 4, minWidth: 200, color: '#F8FAFC' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#FFFFFF', marginBottom: 2 }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>
                    {report.camera.name} • {report.camera.address}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: color, color: '#FFFFFF' }}>
                      {STATUS_LABELS[report.status] || report.status}
                    </span>
                    <span style={{ fontSize: 11, color: '#359B73', fontWeight: 600 }}>
                      {Math.round((report.detection.confidence || 0.9) * 100)}% Conf
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
