import { useState, useRef, useEffect } from 'react';
import {
  Camera, Plus, MapPin, CheckCircle2, AlertCircle, Video,
  ArrowUpRight, Smartphone, Wifi, Play, Square, RefreshCw,
  ExternalLink, QrCode, Globe, Radio
} from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import AddCameraModal from '../../components/AddCameraModal';
import { resolveMediaUrl, API_BASE } from '../../api';

export default function OfficerCameras() {
  const { cameras, addCamera } = useReports();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCam, setSelectedCam] = useState(cameras[0] || null);

  // Stream Modes: 'cctv' | 'phone_ip' | 'device_webcam'
  const [streamMode, setStreamMode] = useState('cctv');

  // Phone Stream Settings (Method 2: IP Webcam is primary)
  const [phoneSubMode, setPhoneSubMode] = useState('app_ip'); // 'app_ip' (IP Webcam app) | 'browser'
  const [phoneUrl, setPhoneUrl] = useState(() => {
    return localStorage.getItem('cityeye_phone_ip_url') || 'http://192.168.1.5:8080/video';
  });
  const [activePhoneStream, setActivePhoneStream] = useState(() => {
    return localStorage.getItem('cityeye_phone_ip_url') || '';
  });
  const [phoneStreamStatus, setPhoneStreamStatus] = useState('');
  const [isLiveRelayActive, setIsLiveRelayActive] = useState(false);
  const [relayFrameUrl, setRelayFrameUrl] = useState('');
  const [relayFrameCount, setRelayFrameCount] = useState(0);

  // Direct Hardware Webcam Stream via OpenCV (Bypasses browser locks)
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const [webcamStreamKey, setWebcamStreamKey] = useState(Date.now());

  const videoRef = useRef(null);
  const cctvVideoRef = useRef(null);
  const streamRef = useRef(null);
  const relayPollRef = useRef(null);

  const activeCount = cameras.filter((c) => c.is_active).length;
  const localHostIp = window.location.hostname || '192.168.1.101';
  const mobileBroadcasterUrl = `http://${localHostIp}:5173/mobile-camera`;

  // Start Device Webcam via Direct Python OpenCV Hardware Stream
  const startWebcam = () => {
    setWebcamError('');
    setWebcamStreamKey(Date.now());
    setWebcamActive(true);
  };

  const stopWebcam = () => {
    setWebcamActive(false);
  };

  // Connect Third-Party Phone IP Webcam app
  const handleConnectPhone = (e) => {
    e.preventDefault();
    let url = phoneUrl.trim();
    if (!url) return;

    // Normalise URL input
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }

    try {
      const parsed = new URL(url);
      // Auto-append stream path if missing for common apps
      if ((parsed.port === '8080' || parsed.port === '4747') && (parsed.pathname === '/' || parsed.pathname === '')) {
        url = url.replace(/\/+$/, '') + '/video';
      }
    } catch (_) {}

    setPhoneUrl(url);
    setActivePhoneStream(url);
    localStorage.setItem('cityeye_phone_ip_url', url);
    setPhoneStreamStatus('Connected & Streaming');
  };

  // Poll for live mobile browser streamer frames from /api/v1/cameras/stream-frame
  useEffect(() => {
    if (streamMode === 'phone_ip' && phoneSubMode === 'browser') {
      let isSubscribed = true;

      const pollRelay = async () => {
        try {
          const res = await fetch(`${API_BASE}/cameras/stream-frame?t=${Date.now()}`);
          if (res.ok) {
            const blob = await res.blob();
            if (isSubscribed && blob.size > 500) {
              const objUrl = URL.createObjectURL(blob);
              setRelayFrameUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return objUrl;
              });
              setIsLiveRelayActive(true);
              setRelayFrameCount((prev) => prev + 1);
            }
          } else {
            if (isSubscribed) setIsLiveRelayActive(false);
          }
        } catch (_) {
          if (isSubscribed) setIsLiveRelayActive(false);
        }
      };

      relayPollRef.current = setInterval(pollRelay, 120);

      return () => {
        isSubscribed = false;
        if (relayPollRef.current) clearInterval(relayPollRef.current);
      };
    }
  }, [streamMode, phoneSubMode]);

  useEffect(() => {
    return () => {
      stopWebcam();
      if (relayFrameUrl) URL.revokeObjectURL(relayFrameUrl);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">CCTV & Live Camera Stations</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Connected traffic surveillance, municipal CCTV nodes, smartphone camera streams, and laptop webcams
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-pill-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Register New Camera
          </button>
        </div>
      </div>

      {/* Main Grid: Stream Player + Camera Directory */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 24 }}>
        {/* Stream Player Card */}
        <div className="modern-card">
          <div className="card-header-row" style={{ marginBottom: 14 }}>
            <div className="card-title-group">
              <h3>
                {streamMode === 'cctv'
                  ? `Live CCTV Feed: ${selectedCam ? selectedCam.name : 'Select Stream'}`
                  : streamMode === 'phone_ip'
                  ? '📱 Smartphone Camera Feed'
                  : '💻 Laptop / Device Webcam Feed'}
              </h3>
              <p>YOLOv8 Edge Surveillance Feed • 1080p @ 30 FPS</p>
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
                Phone Camera
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
              height: 380,
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
            {/* Mode 1: CCTV Live Video Feed */}
            {streamMode === 'cctv' && (
              <>
                <video
                  ref={cctvVideoRef}
                  key={selectedCam?.id || 'live-feed'}
                  src={resolveMediaUrl('/uploads/evidence/upload_4267e266.mp4')}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onCanPlay={(e) => {
                    e.target.muted = true;
                    e.target.play().catch(() => {});
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 10,
                  color: '#34D399',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span className="status-dot green" />
                  <span>● LIVE CCTV SURVEILLANCE • 1080P @ 30 FPS</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  background: 'rgba(15, 23, 42, 0.88)',
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
                  <span>NODE: {selectedCam?.id} • {selectedCam?.name} — {selectedCam?.address}</span>
                </div>
              </>
            )}

            {/* Mode 2: Phone Camera Feed */}
            {streamMode === 'phone_ip' && (
              <>
                {/* Sub-Mode A: Direct Browser Streaming */}
                {phoneSubMode === 'browser' && (
                  <>
                    {isLiveRelayActive && relayFrameUrl ? (
                      <>
                        <img
                          src={relayFrameUrl}
                          alt="Live Phone Stream"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
                          ● PHONE LIVE BROADCAST ({relayFrameCount} Frames)
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', maxWidth: 420 }}>
                        <Smartphone size={46} color="#38BDF8" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)' }}>
                          Stream Camera Directly from Your Phone
                        </div>
                        <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                          No third-party app needed! Open the link below on your phone browser (Chrome/Safari) and tap <strong>"Start Broadcasting"</strong>.
                        </p>
                        <div style={{
                          marginTop: 12,
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#0284C7',
                          wordBreak: 'break-all'
                        }}>
                          {mobileBroadcasterUrl}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Sub-Mode B: External IP Webcam App Stream */}
                {phoneSubMode === 'app_ip' && (
                  <>
                    {activePhoneStream ? (
                      <>
                        <img
                          src={activePhoneStream}
                          alt="IP Webcam Stream"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onLoad={() => setPhoneStreamStatus('Connected & Streaming')}
                          onError={() => {
                            setPhoneStreamStatus('Stream connection error. Verify phone app is running.');
                          }}
                        />
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
                          ● IP WEBCAM STREAM
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>
                        <Wifi size={44} color="#10B981" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>
                          Connect IP Webcam / DroidCam Stream
                        </div>
                        <p style={{ fontSize: 13, marginTop: 4, maxWidth: 380 }}>
                          Enter your phone app's streaming URL (e.g. <code>http://192.168.1.5:8080/video</code>) below.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Mode 3: Laptop / USB Webcam via Direct OpenCV Stream */}
            {streamMode === 'device_webcam' && (
              <>
                {webcamActive ? (
                  <>
                    <img
                      key={webcamStreamKey}
                      src={`${API_BASE}/cameras/webcam-stream?t=${webcamStreamKey}`}
                      alt="OpenCV Live Hardware Webcam"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => {
                        setWebcamError('Unable to connect to camera via OpenCV hardware interface.');
                      }}
                    />
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
                      ● WEBCAM LIVE (OPENCV HARDWARE)
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', maxWidth: 380 }}>
                    <Video size={44} color="#38BDF8" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-navy)' }}>
                      Device Webcam Feed
                    </div>
                    <p style={{ fontSize: 13, marginTop: 4 }}>
                      Click <strong>"Start Webcam"</strong> to stream live from your PC or laptop camera directly via hardware interface.
                    </p>
                    {webcamError && (
                      <div style={{ marginTop: 10, color: '#EF4444', fontSize: 12, background: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 8 }}>
                        {webcamError}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sub-Controls for Phone Camera Mode */}
          {streamMode === 'phone_ip' && (
            <div style={{ marginBottom: 16 }}>
              {/* Phone Method Tabs */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button
                  onClick={() => setPhoneSubMode('browser')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: phoneSubMode === 'browser' ? '#0284C7' : 'var(--color-card-subtle)',
                    color: phoneSubMode === 'browser' ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Smartphone size={14} /> Method 1: Phone Browser (No App Required)
                </button>
                <button
                  onClick={() => setPhoneSubMode('app_ip')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: phoneSubMode === 'app_ip' ? '#0284C7' : 'var(--color-card-subtle)',
                    color: phoneSubMode === 'app_ip' ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Wifi size={14} /> Method 2: IP Webcam / DroidCam App
                </button>
              </div>

              {phoneSubMode === 'browser' && (
                <div style={{
                  background: 'var(--color-card-subtle)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div style={{ fontSize: 12, color: 'var(--color-navy)' }}>
                    Open on your phone: <strong style={{ color: '#0284C7' }}>{mobileBroadcasterUrl}</strong>
                  </div>
                  <button
                    onClick={() => window.open('/mobile-camera', '_blank')}
                    style={{
                      background: '#10B981',
                      color: '#000000',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ExternalLink size={13} /> Test Mobile Streamer
                  </button>
                </div>
              )}

              {phoneSubMode === 'app_ip' && (
                <form onSubmit={handleConnectPhone} style={{ display: 'flex', gap: 10 }}>
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
            </div>
          )}

          {/* Sub-Controls for Webcam */}
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
                  {selectedCam.latitude}, {selectedCam.longitude} • <span style={{ color: 'var(--color-aquamarine)' }}>Active Online</span>
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

      {showAddModal && (
        <AddCameraModal
          onClose={() => setShowAddModal(false)}
          onConfirm={(data) => addCamera(data)}
        />
      )}
    </div>
  );
}
