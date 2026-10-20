import { useState } from 'react';
import { Camera, Plus, MapPin, Smartphone, X } from 'lucide-react';

export default function AddCameraModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('19.0760');
  const [longitude, setLongitude] = useState('72.8777');
  const [streamUrl, setStreamUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    onConfirm({
      name,
      address,
      latitude,
      longitude,
      stream_url: streamUrl.trim() || null,
      is_active: true
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-aquamarine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-aquamarine)' }}>
              <Camera size={18} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-navy)' }}>Register CCTV / Phone Stream</span>
          </div>
          <button
            className="icon-btn-circle"
            style={{ width: 30, height: 30, border: 'none', background: 'transparent' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                CAMERA NAME / IDENTIFIER *
              </label>
              <input
                className="form-control"
                placeholder="e.g., My Phone Camera or Kurla West Cam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                PHYSICAL LOCATION / ADDRESS *
              </label>
              <input
                className="form-control"
                placeholder="e.g., SV Road Junction, Bandra West, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Optional Phone Stream URL */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PHONE IP WEBCAM STREAM URL (OPTIONAL)
                </label>
                <span style={{ fontSize: 10, color: 'var(--color-aquamarine)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Smartphone size={12} /> Mobile Feed
                </span>
              </div>
              <input
                className="form-control"
                placeholder="e.g., http://192.168.1.5:8080/video"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                Enter the IP stream URL shown on your phone app (e.g., "IP Webcam" for Android or "IP Camera Lite" for iOS).
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  LATITUDE
                </label>
                <input
                  className="form-control"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  LONGITUDE
                </label>
                <input
                  className="form-control"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-pill-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-pill-primary">
              <Plus size={16} /> Register Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
