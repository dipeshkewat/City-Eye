import { useState } from 'react';
import { Camera, Plus, MapPin, CheckCircle2, AlertCircle, Video, ArrowUpRight } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import AddCameraModal from '../../components/AddCameraModal';

export default function OfficerCameras() {
  const { cameras, addCamera } = useReports();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCam, setSelectedCam] = useState(cameras[0] || null);

  const activeCount = cameras.filter((c) => c.is_active).length;

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">CCTV Camera Stations</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Connected traffic and civic monitoring camera streams across the municipal network
          </p>
        </div>
        <button className="btn-pill-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register New Camera
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Stream Simulator Card */}
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Live Stream: {selectedCam ? selectedCam.name : 'Select Stream'}</h3>
              <p>YOLOv8 Edge Inference Feed • 1080p @ 30 FPS</p>
            </div>
            <span className="pill-badge-green">
              {selectedCam?.is_active ? 'LIVE ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ width: '100%', height: 340, background: '#0B2545', borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
            <img
              src="/evidence/det-001.svg"
              alt="Live Feed"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div style={{ position: 'absolute', bottom: 12, left: 14, background: 'rgba(11, 37, 69, 0.85)', padding: '6px 12px', borderRadius: 9999, fontSize: 11, color: '#FFFFFF', fontWeight: 600 }}>
              STREAM ID: {selectedCam?.id} • {selectedCam?.address}
            </div>
          </div>

          {selectedCam && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--color-canvas)', padding: 14, borderRadius: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Station Name</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)' }}>{selectedCam.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Coordinates</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)' }}>Lat {selectedCam.latitude}, Lng {selectedCam.longitude}</div>
              </div>
            </div>
          )}
        </div>

        {/* Directory Card */}
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h3>Camera Directory</h3>
              <p>{cameras.length} registered municipal endpoints</p>
            </div>
            <span className="pill-badge-green">{activeCount} Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
            {cameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => setSelectedCam(cam)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: selectedCam?.id === cam.id ? 'var(--color-aquamarine-light)' : 'var(--color-canvas)',
                  border: selectedCam?.id === cam.id ? '1px solid var(--color-aquamarine)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)' }}>{cam.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cam.address}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-dot ${cam.is_active ? 'green' : 'red'}`} style={{ display: 'inline-block', marginRight: 6 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: cam.is_active ? 'var(--color-aquamarine)' : '#DC2626' }}>
                    {cam.is_active ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddCameraModal
          onClose={() => setShowAddModal(false)}
          onConfirm={(data) => addCamera(data)}
        />
      )}
    </div>
  );
}
