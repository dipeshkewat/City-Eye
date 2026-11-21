import { useState, useRef, useEffect } from 'react';
import { Camera, Radio, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

export default function MobileCameraStreamer() {
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [statusText, setStatusText] = useState('Ready to broadcast');
  const [framesSent, setFramesSent] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const startBroadcast = async () => {
    setErrorMsg('');
    setStatusText('Requesting camera access...');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }

      setIsStreaming(true);
      setStatusText('● Broadcasting live to CityEye dashboard');

      // Frame capture loop (~8 FPS for smooth responsive feed)
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(captureAndSendFrame, 120);
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg(err.message || 'Unable to access mobile camera. Please allow camera permissions in your browser.');
      setStatusText('Connection failed');
      setIsStreaming(false);
    }
  };

  const stopBroadcast = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setStatusText('Broadcast stopped');
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        fetch(`${API_BASE}/cameras/stream-frame`, {
          method: 'POST',
          body: formData,
        })
          .then((res) => {
            if (res.ok) {
              setFramesSent((prev) => prev + 1);
            }
          })
          .catch(() => {});
      },
      'image/jpeg',
      0.65 // High performance JPEG compression
    );
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isStreaming) {
      startBroadcast();
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      stopBroadcast();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090D14',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={() => navigate('/officer/cameras')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Smartphone size={16} /> CityEye Mobile CCTV
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Live Phone Camera Broadcaster</div>
        </div>
        <button
          onClick={toggleFacingMode}
          title="Switch Front/Back Camera"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw size={15} /> Flip
        </button>
      </div>

      {/* Main Camera Viewport */}
      <div style={{
        flex: 1,
        background: '#000000',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isStreaming ? '2px solid #10B981' : '1px solid #1E293B'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!isStreaming && (
          <div style={{ position: 'absolute', textAlign: 'center', padding: 24, zIndex: 10 }}>
            <Camera size={48} color="#38BDF8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Ready to Stream Phone Camera</h3>
            <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 320 }}>
              Tap <strong>Start Broadcasting</strong> to stream this smartphone's live camera feed straight to the CityEye Municipal Dashboard.
            </p>
          </div>
        )}

        {isStreaming && (
          <div style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 11,
            color: '#10B981',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Radio size={14} className="animate-pulse" color="#10B981" />
            <span>LIVE TO DASHBOARD • {framesSent} Frames</span>
          </div>
        )}
      </div>

      {/* Status & Error Notice */}
      <div style={{ margin: '14px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isStreaming ? '#34D399' : '#94A3B8' }}>
          {statusText}
        </div>
        {errorMsg && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: 8 }}>
            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div>
        {!isStreaming ? (
          <button
            onClick={startBroadcast}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              background: '#10B981',
              color: '#000000',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Radio size={18} /> Start Broadcasting
          </button>
        ) : (
          <button
            onClick={stopBroadcast}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 800,
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            Stop Broadcast
          </button>
        )}
      </div>
    </div>
  );
}
