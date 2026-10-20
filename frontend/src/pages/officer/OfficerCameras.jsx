import { useState, useRef, useEffect } from 'react';
import {
  Camera, Plus, MapPin, CheckCircle2, AlertCircle, Video,
  ArrowUpRight, Smartphone, Wifi, Terminal, Play, Square, RefreshCw
} from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import AddCameraModal from '../../components/AddCameraModal';

export default function OfficerCameras() {
  const { cameras, addCamera } = useReports();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCam, setSelectedCam] = useState(cameras[0] || null);

  // Live Camera Modes: 'cctv' | 'phone_ip' | 'device_webcam'
  const [streamMode, setStreamMode] = useState('cctv');
  const [phoneUrl, setPhoneUrl] = useState('http://192.168.1.5:8080/video');
  const [activePhoneStream, setActivePhoneStream] = useState('');
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const activeCount = cameras.filter((c) => c.is_active).length;

  // Toggle Browser Webcam
  const startWebcam = async () => {
    setWebcamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
    } catch (err) {
      console.error('Webcam error:', err);
      setWebcamError(err.message || 'Unable to access device camera. Please check browser permissions.');
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const handleConnectPhone = (e) => {
    e.preventDefault();
    if (!phoneUrl.trim()) return;
    setActivePhoneStream(phoneUrl.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">CCTV & Live Camera Stations</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Connected traffic surveillance, municipal CCTV nodes, and mobile camera feeds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-pill-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Register New Camera
          </button>
        </div>
      </div>

      {/* Main Grid: Stream Player + Camera Directory */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        {/* Stream Player Card */}
        <div className="modern-card">
          <div className="card-header-row" style={{ marginBottom: 14 }}>
            <div className="card-title-group">
              <h3>
                {streamMode === 'cctv'
                  ? `Live Stream: ${selectedCam ? selectedCam.name : 'Select Stream'}`
                  : streamMode === 'phone_ip'
                  ? '📱 Phone IP Live Stream'
                  : '💻 Device / Laptop Webcam'}
              </h3>
              <p>YOLOv8 Edge Inference Feed • 1080p @ 30 FPS</p>
            </div>

            {/* Stream Mode Switcher */}
            <div className="segmented-pill-control">
              <button
                className={`segmented-pill-btn ${streamMode === 'cctv' ? 'active' : ''}`}
                onClick={() => { stopWebcam(); setStreamMode('cctv'); }}
              >
                CCTV Node
              </button>
              <button
                className={`segmented-pill-btn ${streamMode === 'phone_ip' ? 'active' : ''}`}
                onClick={() => { stopWebcam(); setStreamMode('phone_ip'); }}
              >
                Phone IP
              </button>
              <button
                className={`segmented-pill-btn ${streamMode === 'device_webcam' ? 'active' : ''}`}
                onClick={() => setStreamMode('device_webcam')}
              >
                Webcam
              </button>
            </div>
          </div>

          {/* Video Stream Canvas */}
          <div
            style={{
              width: '100%',
              height: 360,
              background: '#090B0E',
              borderRadius: 18,
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Mode 1: CCTV Pre-Recorded Feed */}
            {streamMode === 'cctv' && (
              <>
                <img
                  src="/evidence/det-001.svg"
                  alt="CCTV Live Feed"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: 11,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span className="status-dot green" />
                  <span>STREAM ID: {selectedCam?.id} • {selectedCam?.address}</span>
                </div>
              </>
            )}

            {/* Mode 2: Phone IP Camera Feed */}
            {streamMode === 'phone_ip' && (
              <>
                {activePhoneStream ? (
                  <img
                    src={activePhoneStream}
                    alt="Phone Live Stream"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={() => {
                      alert('Could not connect to phone stream. Ensure phone and PC are on the same Wi-Fi network and IP Webcam is running.');
                      setActivePhoneStream('');
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>
                    <Smartphone size={44} color="var(--color-aquamarine)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>
                      Connect Your Mobile Phone as a Camera
                    </div>
                    <p style={{ fontSize: 13, marginTop: 4, maxWidth: 380 }}>
                      Enter your phone's IP Webcam URL below and click <strong>"Connect Stream"</strong> to view real-time footage.
                    </p>
                  </div>
                )}
                {activePhoneStream && (
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: '#10B981',
                    color: '#000000',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    ● LIVE PHONE FEED
                  </div>
                )}
              </>
            )}

            {/* Mode 3: Device / Laptop Webcam */}
            {streamMode === 'device_webcam' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: webcamActive ? 'block' : 'none'
                  }}
                />
                {!webcamActive && (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>
                    <Video size={44} color="var(--color-aquamarine)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>
                      Device Webcam Feed
                    </div>
                    <p style={{ fontSize: 13, marginTop: 4, maxWidth: 360 }}>
                      Click <strong>"Start Webcam"</strong> to stream directly from your PC or laptop camera.
                    </p>
                    {webcamError && (
                      <div style={{ marginTop: 10, color: '#EF4444', fontSize: 12 }}>
                        {webcamError}
                      </div>
                    )}
                  </div>
                )}
                {webcamActive && (
                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: '#10B981',
                    color: '#000000',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    ● WEBCAM LIVE
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sub-Controls depending on selected mode */}
          {streamMode === 'phone_ip' && (
            <form onSubmit={handleConnectPhone} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                className="form-control"
                style={{ flex: 1 }}
                placeholder="http://192.168.1.5:8080/video"
                value={phoneUrl}
                onChange={(e) => setPhoneUrl(e.target.value)}
              />
              <button type="submit" className="btn-pill-primary" style={{ padding: '0 18px', whiteSpace: 'nowrap' }}>
                <Wifi size={15} /> Connect Stream
              </button>
            </form>
          )}

          {streamMode === 'device_webcam' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {!webcamActive ? (
                <button className="btn-pill-primary" onClick={startWebcam}>
                  <Play size={15} /> Start Webcam
                </button>
              ) : (
                <button
                  className="btn-pill-secondary"
                  style={{ background: '#EF4444', color: '#FFFFFF', borderColor: '#EF4444' }}
                  onClick={stopWebcam}
                >
                  <Square size={15} /> Stop Webcam
                </button>
              )}
            </div>
          )}

          {/* Node Metadata Footer */}
          {selectedCam && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--color-card-subtle)', padding: 14, borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Station Name</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginTop: 2 }}>{selectedCam.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinates & Status</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', marginTop: 2 }}>
                  {selectedCam.latitude}, {selectedCam.longitude} • <span style={{ color: 'var(--color-aquamarine)' }}>Active</span>
                </div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
            {cameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => { setSelectedCam(cam); setStreamMode('cctv'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: selectedCam?.id === cam.id && streamMode === 'cctv' ? 'var(--color-aquamarine-light)' : 'var(--color-card-subtle)',
                  border: selectedCam?.id === cam.id && streamMode === 'cctv' ? '1px solid var(--color-aquamarine)' : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)' }}>{cam.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{cam.address}</div>
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

      {/* Step-by-Step Interactive Guide: Connecting Your Phone as a Camera */}
      <div className="modern-card" style={{ padding: '24px 28px' }}>
        <div className="card-header-row" style={{ marginBottom: 16 }}>
          <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-aquamarine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-aquamarine)' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <h3>How to Connect Your Phone as a Camera to CityEye</h3>
              <p>Simple 3-minute setup using free tools</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 20 }}>
          {/* Method A */}
          <div style={{ background: 'var(--color-card-subtle)', padding: 18, borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: 'var(--color-aquamarine)', color: '#000', fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
                METHOD 1
              </span>
              <strong style={{ fontSize: 13, color: 'var(--color-navy)' }}>IP Webcam (Wi-Fi)</strong>
            </div>
            <ol style={{ fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
              <li>Install <strong>IP Webcam</strong> (Android) or <strong>IP Camera Lite</strong> (iOS).</li>
              <li>Connect phone to the <strong>same Wi-Fi</strong> as this PC.</li>
              <li>Open the app, scroll to bottom and tap <strong>Start Server</strong>.</li>
              <li>Note the IP shown on screen (e.g. <code>http://192.168.1.5:8080</code>).</li>
            </ol>
          </div>

          {/* Method B */}
          <div style={{ background: 'var(--color-card-subtle)', padding: 18, borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: '#38BDF8', color: '#000', fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
                METHOD 2
              </span>
              <strong style={{ fontSize: 13, color: 'var(--color-navy)' }}>Iriun / DroidCam (USB)</strong>
            </div>
            <ol style={{ fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
              <li>Install <strong>Iriun Webcam</strong> on both your phone & PC.</li>
              <li>Connect phone via USB cable or Wi-Fi.</li>
              <li>Your phone instantly behaves like a standard Windows webcam.</li>
              <li>Switch to the <strong>Webcam</strong> tab above to view live.</li>
            </ol>
          </div>

          {/* Real AI Inference Command */}
          <div style={{ background: 'var(--color-card-subtle)', padding: 18, borderRadius: 14, border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: '#F59E0B', color: '#000', fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
                LIVE AI RUN
              </span>
              <strong style={{ fontSize: 13, color: 'var(--color-navy)' }}>Run Real-Time Detection</strong>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              Run this command in terminal to detect defects live through your phone:
            </p>
            <div style={{
              background: '#090B0E',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#34D399',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              python ml/inference/detect.py --source http://&lt;phone-ip&gt;:8080/video
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
              Or for USB/Webcam mode: <code>python ml/inference/detect.py --source 0</code>
            </div>
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
