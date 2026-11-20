import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { resolveMediaUrl } from '../api';
import { Filter, Layers, Navigation, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

// Fix leaflet default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const DEFECT_CONFIG = {
  pothole: { label: 'Pothole', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.2)', icon: '🕳️' },
  garbage: { label: 'Garbage Dump', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', icon: '🗑️' },
  waterlogging: { label: 'Waterlogging', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.2)', icon: '💧' },
  other: { label: 'Hazard', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)', icon: '⚠️' }
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
    attribution: '&copy; Esri &mdash; Dark Gray Canvas',
  },
  osm: {
    label: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
  },
};

// Map center controller helper
function MapRecenter({ center, zoom }) {
  const map = useMap();
  const handleRecenter = () => {
    map.setView(center, zoom, { animate: true });
  };
  return (
    <button
      onClick={handleRecenter}
      title="Reset Mumbai City View"
      style={{
        position: 'absolute',
        top: 80,
        left: 12,
        zIndex: 1000,
        background: '#0F172A',
        color: '#FFFFFF',
        border: '1px solid #334155',
        borderRadius: 8,
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
      }}
    >
      <Navigation size={16} color="#38BDF8" />
    </button>
  );
}

export default function StatusMap({ reports = [] }) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [colorMode, setColorMode] = useState('type'); // 'type' | 'status'
  const [basemap, setBasemap] = useState('dark');

  const defaultCenter = [19.0760, 72.8777];
  const defaultZoom = 12;

  const getProblemType = (report) => {
    const raw = (report.detection?.problem_type || report.problem_type || 'pothole').toLowerCase();
    if (raw.includes('garbage') || raw.includes('waste') || raw.includes('litter') || raw.includes('debris')) return 'garbage';
    if (raw.includes('water') || raw.includes('flood') || raw.includes('drain')) return 'waterlogging';
    if (raw.includes('pothole') || raw.includes('crack') || raw.includes('road')) return 'pothole';
    return 'other';
  };

  const getCoords = (item) => {
    if (item.gps?.lat && item.gps?.lng) {
      return [parseFloat(item.gps.lat), parseFloat(item.gps.lng)];
    }
    if (item.gps_lat && item.gps_lng) {
      return [parseFloat(item.gps_lat), parseFloat(item.gps_lng)];
    }
    if (item.camera?.latitude && item.camera?.longitude) {
      return [parseFloat(item.camera.latitude), parseFloat(item.camera.longitude)];
    }
    if (item.latitude && item.longitude) {
      return [parseFloat(item.latitude), parseFloat(item.longitude)];
    }
    return null;
  };

  // Pre-calculated counts
  const counts = useMemo(() => {
    const res = { all: reports.length, pothole: 0, garbage: 0, waterlogging: 0, other: 0 };
    reports.forEach((r) => {
      const type = getProblemType(r);
      if (res[type] !== undefined) res[type]++;
      else res.other++;
    });
    return res;
  }, [reports]);

  // Filtered dataset
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesType = selectedType === 'all' || getProblemType(r) === selectedType;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [reports, selectedType, selectedStatus]);

  const activeTileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Map Control Header */}
      <div
        style={{
          padding: '10px 16px',
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
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={13} /> Filter Defect:
          </span>

          <button
            onClick={() => setSelectedType('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'all' ? '#2563EB' : 'transparent',
              borderColor: selectedType === 'all' ? '#3B82F6' : '#334155',
              color: '#FFFFFF',
              transition: 'all 0.15s ease',
            }}
          >
            All Defects ({counts.all})
          </button>

          <button
            onClick={() => setSelectedType('pothole')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'pothole' ? '#EA580C' : 'transparent',
              borderColor: selectedType === 'pothole' ? '#F97316' : '#334155',
              color: selectedType === 'pothole' ? '#FFFFFF' : '#F97316',
              transition: 'all 0.15s ease',
            }}
          >
            🕳️ Potholes ({counts.pothole})
          </button>

          <button
            onClick={() => setSelectedType('garbage')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'garbage' ? '#059669' : 'transparent',
              borderColor: selectedType === 'garbage' ? '#10B981' : '#334155',
              color: selectedType === 'garbage' ? '#FFFFFF' : '#10B981',
              transition: 'all 0.15s ease',
            }}
          >
            🗑️ Garbage ({counts.garbage})
          </button>

          <button
            onClick={() => setSelectedType('waterlogging')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              background: selectedType === 'waterlogging' ? '#0891B2' : 'transparent',
              borderColor: selectedType === 'waterlogging' ? '#06B6D4' : '#334155',
              color: selectedType === 'waterlogging' ? '#FFFFFF' : '#06B6D4',
              transition: 'all 0.15s ease',
            }}
          >
            💧 Waterlogging ({counts.waterlogging})
          </button>
        </div>

        {/* Status Filter & Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1E293B', padding: '4px 8px', borderRadius: 6 }}>
            <span style={{ color: '#94A3B8', fontSize: 11 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: '#0F172A' }}>All Statuses</option>
              <option value="pending_officer_review" style={{ background: '#0F172A' }}>Pending Review</option>
              <option value="approved" style={{ background: '#0F172A' }}>Approved</option>
              <option value="assigned" style={{ background: '#0F172A' }}>Assigned</option>
              <option value="in_progress" style={{ background: '#0F172A' }}>In Progress</option>
              <option value="resolved" style={{ background: '#0F172A' }}>Resolved</option>
            </select>
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
                padding: '3px 8px',
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
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: colorMode === 'status' ? 700 : 400
              }}
            >
              Status
            </button>
          </div>

          {/* Basemap Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1E293B', padding: '3px 6px', borderRadius: 6 }}>
            <Layers size={13} color="#94A3B8" />
            {Object.entries(BASEMAP_TILES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setBasemap(key)}
                style={{
                  background: basemap === key ? '#3B82F6' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '3px 8px',
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

          <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', padding: '4px 10px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            Showing {filteredReports.length} Incidents
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MapContainer
          key={basemap}
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%', background: '#09131F' }}
          zoomControl={true}
        >
          <TileLayer
            key={activeTileConfig.url}
            attribution={activeTileConfig.attribution}
            url={activeTileConfig.url}
          />

          <MapRecenter center={defaultCenter} zoom={defaultZoom} />

          {/* Incident Reports Markers (No Camera Icons) */}
          {filteredReports.map((report) => {
            const coords = getCoords(report);
            if (!coords) return null;

            const defectType = getProblemType(report);
            const defectCfg = DEFECT_CONFIG[defectType] || DEFECT_CONFIG.other;
            const statusCfg = STATUS_CONFIG[report.status] || { label: report.status, color: '#94A3B8' };

            const markerColor = colorMode === 'type' ? defectCfg.color : statusCfg.color;
            const severity = report.detection?.severity_label || report.severity_label || 'medium';
            const radius = severity === 'high' ? 14 : severity === 'medium' ? 11 : 9;

            const rawEvidence = report.evidence_image_path || report.evidence_photo || report.detection?.evidence_image_path;
            const evidenceImg = rawEvidence ? resolveMediaUrl(rawEvidence) : null;

            return (
              <CircleMarker
                key={`rpt-${report.id}`}
                center={coords}
                radius={radius}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: markerColor,
                  fillOpacity: 0.92,
                  weight: 2.5,
                }}
              >
                <Popup>
                  <div style={{ padding: 4, minWidth: 240, maxWidth: 300, color: '#0F172A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: defectCfg.color, color: '#FFFFFF' }}>
                        {defectCfg.icon} {defectCfg.label.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: statusCfg.color, color: '#FFFFFF' }}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A', marginBottom: 3, lineHeight: 1.3 }}>
                      {report.title}
                    </div>

                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      📍 {report.location_name || report.camera?.address || report.camera?.name || 'Municipal Road Sector'}
                    </div>

                    {evidenceImg && (
                      <div style={{ marginBottom: 8, borderRadius: 6, overflow: 'hidden', border: '1px solid #CBD5E1', maxHeight: 130 }}>
                        <img
                          src={evidenceImg}
                          alt="Defect Evidence"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#F8FAFC', padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: severity === 'high' ? '#DC2626' : severity === 'medium' ? '#D97706' : '#2563EB' }}>
                        Priority: {severity.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                        {Math.round((report.detection?.confidence || report.confidence || 0.9) * 100)}% AI Conf
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', gridColumn: 'span 2' }}>
                        Dept: {report.recommended_department || 'Municipal Works'}
                      </div>
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
            bottom: 20,
            right: 20,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #334155',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 11,
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            color: '#F8FAFC'
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
            {colorMode === 'type' ? 'Active Defect Pins' : 'Incident Status'}
          </div>

          {colorMode === 'type' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#EA580C', border: '2px solid #FFFFFF' }}></span>
                <span>🕳️ Pothole / Structural Damage</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid #FFFFFF' }}></span>
                <span>🗑️ Garbage / Waste Pile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#06B6D4', border: '2px solid #FFFFFF' }}></span>
                <span>💧 Waterlogging / Flooding</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
