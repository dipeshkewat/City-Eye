import { useState } from 'react';
import { Camera, Plus, MapPin } from 'lucide-react';

export default function AddCameraModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('19.0760');
  const [longitude, setLongitude] = useState('72.8777');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    onConfirm({ name, address, latitude, longitude });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={20} color="#359B73" />
            <span style={{ fontWeight: 700 }}>Register New CCTV Stream</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                CAMERA IDENTIFIER / NAME *
              </label>
              <input
                className="form-control"
                placeholder="e.g., Kurla Station West Cam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                PHYSICAL ADDRESS *
              </label>
              <input
                className="form-control"
                placeholder="e.g., LBS Marg, Kurla West, Mumbai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Register Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
