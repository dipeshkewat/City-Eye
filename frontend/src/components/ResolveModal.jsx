import { useState, useRef } from 'react';
import { Wrench, CheckCircle2, Upload, FileText, X, ImagePlus, Camera, AlertTriangle } from 'lucide-react';

export default function ResolveModal({ reportId, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');
  const [proofImages, setProofImages] = useState([]);   // Array of { file, preview }
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 3;
  const MIN_IMAGES = 2;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - proofImages.length;
    const newFiles = files.slice(0, remainingSlots);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProofImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, { file, preview: ev.target.result, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset file input so user can select same file again if needed
    e.target.value = '';
  };

  const removeImage = (index) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (proofImages.length < MIN_IMAGES) return;

    // Use first image preview as the resolution photo path (for mock/demo purposes)
    const photoPath = proofImages[0]?.preview || '/evidence/res-001.svg';
    onConfirm(reportId, {
      notes,
      photoPath,
      proofImages: proofImages.map((p) => p.preview)
    });
    onClose();
  };

  const canSubmit = notes.trim() && proofImages.length >= MIN_IMAGES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#10B981', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-navy)' }}>
                Submit Proof of Work
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Upload photographic proof of completed repair
              </div>
            </div>
          </div>
          <button className="icon-btn-circle" style={{ width: 32, height: 32 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Instructions Banner */}
            <div style={{
              background: 'var(--color-status-in-progress-bg)',
              border: '1px solid #0284C740',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              fontSize: 13, color: 'var(--color-text-body)', lineHeight: 1.5
            }}>
              <AlertTriangle size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: 'var(--color-navy)' }}>Proof of Work Required</strong>
                <div style={{ fontSize: 12, marginTop: 2, color: 'var(--color-text-muted)' }}>
                  Upload <strong>{MIN_IMAGES} to {MAX_IMAGES} images</strong> showing the completed repair work. This serves as official documentation for municipal audit records.
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: 'var(--color-text-muted)', marginBottom: 10,
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                PROOF OF RESOLUTION PHOTOS ({proofImages.length}/{MAX_IMAGES})
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {/* Existing uploaded images */}
                {proofImages.map((img, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      aspectRatio: '4/3',
                      borderRadius: 14,
                      overflow: 'hidden',
                      border: '2px solid var(--color-aquamarine)',
                      background: '#0B2545'
                    }}
                  >
                    <img
                      src={img.preview}
                      alt={`Proof ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(220, 38, 38, 0.9)', border: 'none',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      <X size={14} />
                    </button>
                    {/* Image number badge */}
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6,
                      background: 'rgba(0,0,0,0.7)', borderRadius: 6,
                      padding: '2px 8px', fontSize: 10, color: '#fff',
                      fontWeight: 700
                    }}>
                      Photo {index + 1}
                    </div>
                  </div>
                ))}

                {/* Add image button (show only if less than MAX) */}
                {proofImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '4/3',
                      borderRadius: 14,
                      border: '2px dashed var(--color-border-hover)',
                      background: 'var(--color-canvas)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', gap: 6,
                      transition: 'all 150ms ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-aquamarine)';
                      e.currentTarget.style.background = 'var(--color-aquamarine-light)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                      e.currentTarget.style.background = 'var(--color-canvas)';
                    }}
                  >
                    <ImagePlus size={24} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Add Photo
                    </span>
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Validation message */}
              {proofImages.length < MIN_IMAGES && proofImages.length > 0 && (
                <div style={{
                  marginTop: 8, fontSize: 11, color: '#D97706',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <AlertTriangle size={12} />
                  Upload at least {MIN_IMAGES} photos to submit
                </div>
              )}
            </div>

            {/* Field Notes */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: 'var(--color-text-muted)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                ENGINEERING / FIELD NOTES *
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. 1.5m pothole filled with hot-mix asphalt and steam compacted. Traffic restored to normal flow."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                style={{ borderRadius: 14 }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-pill-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn-pill-primary"
              disabled={!canSubmit}
              style={{
                opacity: canSubmit ? 1 : 0.5,
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              <CheckCircle2 size={16} /> Submit Work ({proofImages.length}/{MIN_IMAGES} photos)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
