import { useState, useRef } from 'react';
import {
  UploadCloud, X, CheckCircle2, AlertTriangle, Sparkles, FileText,
  MapPin, ShieldCheck, ArrowRight, RefreshCw, Eye, Film, Image as ImageIcon
} from 'lucide-react';
import { apiUploadProblem } from '../api';
import FullReportModal from './FullReportModal';

export default function UploadProblemModal({ isOpen, onClose, onProblemDetected }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [locationName, setLocationName] = useState('SV Road Junction, Bandra West');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [detectedReport, setDetectedReport] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setFile(selected);
    setDetectedReport(null);

    const videoType = selected.type.startsWith('video/') || selected.name.match(/\.(mp4|avi|mov|webm)$/i);
    setIsVideo(Boolean(videoType));

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setError(null);
      setDetectedReport(null);
      const videoType = dropped.type.startsWith('video/') || dropped.name.match(/\.(mp4|avi|mov|webm)$/i);
      setIsVideo(Boolean(videoType));
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      setError('Please select or drop an image or video file first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep(1);

    const timer1 = setTimeout(() => setAnalysisStep(2), 700);
    const timer2 = setTimeout(() => setAnalysisStep(3), 1400);

    try {
      const report = await apiUploadProblem(file, null, locationName);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setAnalysisStep(3);

      setTimeout(() => {
        setIsAnalyzing(false);
        setDetectedReport(report);
        if (onProblemDetected) {
          onProblemDetected(report);
        }
      }, 500);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Detection error:', err);
      setIsAnalyzing(false);
      setError(err.message || 'Detection failed. Please try another image.');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
    setDetectedReport(null);
    setError(null);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 680, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Upload Problem</h2>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(37,99,235,0.12)',
                      color: '#2563EB',
                      textTransform: 'uppercase',
                    }}
                  >
                    Live AI Triage
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Upload road photographs or video feeds to run YOLOv8 defect detection and generate official municipal reports.
                </p>
              </div>
            </div>
            <button className="btn-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '20px 0' }}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* STATE 1: SELECTION / UPLOAD ZONE */}
            {!detectedReport && (
              <div>
                {!previewUrl ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: 14,
                      padding: '40px 20px',
                      textAlign: 'center',
                      background: 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        background: 'rgba(37,99,235,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                      }}
                    >
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>Click to upload or drag & drop</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        Supports JPG, PNG, WEBP images or MP4, AVI video feeds
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Media Preview Box */}
                    <div
                      style={{
                        position: 'relative',
                        background: '#0F172A',
                        borderRadius: 12,
                        overflow: 'hidden',
                        textAlign: 'center',
                        padding: 8,
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          controls
                          style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 8 }}
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Problem Preview"
                          style={{ maxHeight: 260, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                        />
                      )}

                      <button
                        onClick={resetUpload}
                        style={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'rgba(15, 23, 42, 0.75)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={12} /> Change File
                      </button>
                    </div>

                    {/* Location field */}
                    <div style={{ marginTop: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                        Simulated Municipal Location / Ward
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <MapPin size={16} color="#359B73" />
                        <input
                          type="text"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          placeholder="e.g. SV Road Junction, Bandra West"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'inherit',
                            fontSize: 13,
                            width: '100%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Progress Steps */}
                {isAnalyzing && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: 'rgba(37,99,235,0.06)',
                      border: '1px solid rgba(37,99,235,0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                        <RefreshCw size={16} className="spin-animate" />
                        <span>Running Real-Time YOLOv8 Detection Pipeline...</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
                        {analysisStep === 1 ? '35%' : analysisStep === 2 ? '70%' : '95%'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div style={{ color: analysisStep >= 1 ? '#059669' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} /> 1. Ingesting frame & applying CLAHE contrast enhancement
                      </div>
                      <div style={{ color: analysisStep >= 2 ? '#059669' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} /> 2. Computing bounding boxes via YOLOv8 neural network
                      </div>
                      <div style={{ color: analysisStep >= 3 ? '#059669' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} /> 3. Scoring defect severity & creating official municipal ticket
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATE 2: DETECTION SUCCESS & RESULTS CARD */}
            {detectedReport && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <CheckCircle2 size={20} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>AI Defect Verified & Ticket Generated!</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      Incident committed to municipal PostgreSQL database with status <b>Pending Review</b>.
                    </div>
                  </div>
                </div>

                {/* Annotated Output Preview */}
                <div
                  style={{
                    position: 'relative',
                    background: '#0B0F19',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                    padding: 8,
                  }}
                >
                  <img
                    src={detectedReport.evidence_image_path || previewUrl}
                    alt="AI Annotated Defect"
                    style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    YOLOv8 Bounding Box Annotated
                  </div>
                </div>

                {/* Metric Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Detected Defect</div>
                    <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize', marginTop: 2 }}>
                      {detectedReport.problem_type}
                    </div>
                    <div style={{ fontSize: 11, color: '#2563EB', marginTop: 2 }}>
                      Confidence: {(detectedReport.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Assigned Department</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                      {detectedReport.recommended_department}
                    </div>
                    <div style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>
                      Severity: {detectedReport.severity_label?.toUpperCase()} ({detectedReport.severity_score}/100)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {!detectedReport ? (
              <>
                <button className="btn-secondary" onClick={onClose} disabled={isAnalyzing}>
                  Cancel
                </button>
                <button
                  className="btn-pill-primary"
                  onClick={handleStartAnalysis}
                  disabled={!file || isAnalyzing}
                  style={{
                    background: file && !isAnalyzing ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : undefined,
                    opacity: !file || isAnalyzing ? 0.6 : 1,
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} /> Run AI Detection
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={resetUpload} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} /> Upload Another Problem
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowFullReport(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#359B73', color: '#359B73' }}
                  >
                    <FileText size={15} /> See Full Report
                  </button>
                  <button className="btn-pill-primary" onClick={onClose}>
                    Done & View in Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Full Report Modal for immediate download */}
      {showFullReport && detectedReport && (
        <FullReportModal
          report={detectedReport}
          isOpen={showFullReport}
          onClose={() => setShowFullReport(false)}
        />
      )}
    </>
  );
}
