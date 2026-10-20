import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Camera Icon with clean SVG
const cameraIcon = new L.DivIcon({
  className: 'custom-camera-pin',
  html: `<div style="background: #0F172A; border: 2px solid #38BDF8; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(56, 189, 248, 0.7); cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export const DEFECT_CONFIG = {
  pothole: { label: 'Pothole', color: '#F97316', bg: '#EA580C', icon: '🕳️' },
  garbage: { label: 'Garbage Dump', color: '#10B981', bg: '#059669', icon: '🗑️' },
  waterlogging: { label: 'Waterlogging', color: '#06B6D4', bg: '#0891B2', icon: '💧' },
  other: { label: 'Other Hazard', color: '#8B5CF6', bg: '#7C3AED', icon: '⚠️' }
};

export const STATUS_CONFIG = {
  pending_officer_review: { label: 'Pending Review', color: '#F59E0B' },
  approved: { label: 'Approved', color: '#10B981' },
  assigned: { label: 'Assigned', color: '#6366F1' },
  in_progress: { label: 'In Progress', color: '#0EA5E9' },
  resolved: { label: 'Resolved', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' }
};

const BASEMAP_TILES = {
  dark: {
    label: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Dark Gray Canvas (Clean, Free)',
  },
  osm: {
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
  },
};

export default function StatusMap({ reports = [], cameras = [] }) {
  const [selectedType, setSelectedType] = useState('all');
  const [colorMode, setColorMode] = useState('type'); // 'type' | 'status'
  const [showCameras, setShowCameras] = useState(true);
  const [basemap, setBasemap] = useState('dark');

  const center = [19.0760, 72.8777];

  const getProblemType = (report) => {
    const raw = (report.detection?.problem_type || report.problem_type || 'pothole').toLowerCase();
    if (raw.includes('garbage') || raw.includes('waste') || raw.includes('litter') || raw.includes('debris')) return 'garbage';
    if (raw.includes('water') || raw.includes('flood') || raw.includes('drain')) return 'waterlogging';
    if (raw.includes('pothole') || raw.includes('crack') || raw.includes('road')) return 'pothole';
    return 'other';
  };

  const getCoords = (item) => {
    if (item.camera?.latitude && item.camera?.longitude) {
      return [parseFloat(item.camera.latitude), parseFloat(item.camera.longitude)];
    }
    if (item.latitude && item.longitude) {
      return [parseFloat(item.latitude), parseFloat(item.longitude)];
    }
    if (item.gps?.lat && item.gps?.lng) {
      return [parseFloat(item.gps.lat), parseFloat(item.gps.lng)];
    }
    if (item.gps_lat && item.gps_lng) {
      return [parseFloat(item.gps_lat), parseFloat(item.gps_lng)];
    }
    return null;
  };

  const counts = useMemo(() => {
    const res = { all: reports.length, pothole: 0, garbage: 0, waterlogging: 0, other: 0 };
    reports.forEach((r) => {
      const type = getProblemType(r);
      if (res[type] !== undefined) res[type]++;
      else res.other++;
    });
    return res;
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (selectedType === 'all') return reports;
    return reports.filter((r) => getProblemType(r) === selectedType);
  }, [reports, selectedType]);

  const activeTileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Map Control Header */}
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--panel-bg, #0F172A)',
          borderBottom: '1px solid var(--border-color, #1E293B)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 10,
        }}
      >
        {/* Defect Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginRight: 4 }}>Filter Defect:</span>
          
          <button
            onClick={() => setSelectedType('all')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'all' ? '#2563EB' : 'transparent',
              borderColor: selectedType === 'all' ? '#3B82F6' : '#334155',
              color: '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            All Types ({counts.all})
          </button>

          <button
            onClick={() => setSelectedType('pothole')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'pothole' ? '#EA580C' : 'transparent',
              borderColor: selectedType === 'pothole' ? '#F97316' : '#334155',
              color: selectedType === 'pothole' ? '#FFFFFF' : '#F97316',
              transition: 'all 0.15s ease'
            }}
          >
            🕳️ Potholes ({counts.pothole})
          </button>

          <button
            onClick={() => setSelectedType('garbage')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'garbage' ? '#059669' : 'transparent',
              borderColor: selectedType === 'garbage' ? '#10B981' : '#334155',
              color: selectedType === 'garbage' ? '#FFFFFF' : '#10B981',
              transition: 'all 0.15s ease'
            }}
          >
            🗑️ Garbage ({counts.garbage})
          </button>

          <button
            onClick={() => setSelectedType('waterlogging')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'waterlogging' ? '#0891B2' : 'transparent',
              borderColor: selectedType === 'waterlogging' ? '#06B6D4' : '#334155',
              color: selectedType === 'waterlogging' ? '#FFFFFF' : '#06B6D4',
              transition: 'all 0.15s ease'
            }}
          >
            💧 Waterlogging ({counts.waterlogging})
          </button>
        </div>

        {/* View Controls & Basemap Switcher */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
          {/* Basemap Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1E293B', padding: '3px 6px', borderRadius: 6 }}>
            <span style={{ color: '#94A3B8', fontSize: 11, marginRight: 2 }}>Map:</span>
            {Object.entries(BASEMAP_TILES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setBasemap(key)}
                style={{
                  background: basemap === key ? '#3B82F6' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: basemap === key ? 700 : 400
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Color Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1E293B', padding: '3px 6px', borderRadius: 6 }}>
            <span style={{ color: '#94A3B8', fontSize: 11, marginRight: 2 }}>Color:</span>
            <button
              onClick={() => setColorMode('type')}
              style={{
                background: colorMode === 'type' ? '#0EA5E9' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: colorMode === 'type' ? 700 : 400
              }}
            >
              Defect
            </button>
            <button
              onClick={() => setColorMode('status')}
              style={{
                background: colorMode === 'status' ? '#0EA5E9' : 'transparent',
                color: '#FFFFFF',
                border: 'none',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: colorMode === 'status' ? 700 : 400
              }}
            >
              Status
            </button>
          </div>

          {/* Toggle Cameras */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1', cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showCameras}
              onChange={(e) => setShowCameras(e.target.checked)}
              style={{ accentColor: '#38BDF8', cursor: 'pointer' }}
            />
            Show Cameras ({cameras.length})
          </label>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MapContainer
          key={basemap}
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%', background: '#09131F' }}
          zoomControl={true}
        >
          <TileLayer
            key={activeTileConfig.url}
            attribution={activeTileConfig.attribution}
            url={activeTileConfig.url}
          />

          {/* CCTV Cameras Markers */}
          {showCameras &&
            cameras.map((cam) => {
              const coords = getCoords(cam);
              if (!coords) return null;
              return (
                <Marker key={`cam-${cam.id}`} position={coords} icon={cameraIcon}>
                  <Popup>
                    <div style={{ padding: 4, minWidth: 200, color: '#0F172A' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>📹 {cam.name}</div>
                      <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{cam.address}</div>
                      <div style={{ fontSize: 10, color: '#0284C7', fontWeight: 600 }}>
                        GPS: {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                      </div>
                      <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        ● Active Live Feed
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Incident Reports Markers */}
          {filteredReports.map((report) => {
            const coords = getCoords(report);
            if (!coords) return null;

            const defectType = getProblemType(report);
            const defectCfg = DEFECT_CONFIG[defectType] || DEFECT_CONFIG.other;
            const statusCfg = STATUS_CONFIG[report.status] || { label: report.status, color: '#94A3B8' };

            const markerColor = colorMode === 'type' ? defectCfg.color : statusCfg.color;
            const severity = report.detection?.severity_label || report.severity_label || 'medium';
            const radius = severity === 'high' ? 14 : severity === 'medium' ? 11 : 8;

            const evidenceImg =
              report.evidence_image_path?.startsWith('http')
                ? report.evidence_image_path
                : report.evidence_image_path
                ? `http://127.0.0.1:8000${report.evidence_image_path}`
                : report.evidence_photo || null;

            return (
              <CircleMarker
                key={`rpt-${report.id}`}
                center={coords}
                radius={radius}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: markerColor,
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ padding: 4, minWidth: 230, maxWidth: 280, color: '#0F172A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: defectCfg.color, color: '#FFFFFF' }}>
                        {defectCfg.icon} {defectCfg.label.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: statusCfg.color, color: '#FFFFFF' }}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 2 }}>
                      {report.title}
                    </div>

                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>
                      📍 {report.location_name || report.camera?.address || report.camera?.name || 'Municipal Road'}
                    </div>

                    {evidenceImg && (
                      <div style={{ marginBottom: 6, borderRadius: 4, overflow: 'hidden', border: '1px solid #CBD5E1', maxHeight: 110 }}>
                        <img
                          src={evidenceImg}
                          alt="Defect Evidence"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, background: '#F1F5F9', padding: '4px 8px', borderRadius: 4 }}>
                      <span style={{ fontWeight: 600, color: severity === 'high' ? '#DC2626' : severity === 'medium' ? '#D97706' : '#2563EB' }}>
                        Severity: {severity.toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 600, color: '#059669' }}>
                        {Math.round((report.detection?.confidence || report.confidence || 0.9) * 100)}% AI Conf
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 11,
            zIndex: 1000,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            color: '#F8FAFC'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {colorMode === 'type' ? 'Defect Classification' : 'Incident Status'}
          </div>

          {colorMode === 'type' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F97316' }}></span>
                <span>🕳️ Pothole / Road Damage</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></span>
                <span>🗑️ Garbage / Illegal Waste Dump</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06B6D4' }}></span>
                <span>💧 Waterlogging / Blocked Drain</span>
              </div>
              {showCameras && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 4, borderTop: '1px solid #334155' }}>
                  <span>📹 Active CCTV Camera Site</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></span>
                <span>Pending Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></span>
                <span>Approved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0EA5E9' }}></span>
                <span>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></span>
                <span>Resolved</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
