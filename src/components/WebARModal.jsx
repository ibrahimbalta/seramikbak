'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Sliders, Smartphone, Download, Sparkles, Maximize2, ShieldAlert } from 'lucide-react';
import ARRoomScannerModal from './ARRoomScannerModal';

export default function WebARModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userPhotoBg, setUserPhotoBg] = useState(null);

  // Native Camera Photo Upload Handler (Bypasses PWA WebAPK permission restrictions)
  const handleNativePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUserPhotoBg(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // AR View Mode: 'STUDIO' (Live 2D Tile Grid) or 'SCANNER' (LiDAR & Cutout Measurement)
  const [viewMode, setViewMode] = useState('STUDIO');

  // AR Customization Controls
  const [activeTileTexture, setActiveTileTexture] = useState(selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg');
  const [layStyle, setLayStyle] = useState('straight'); // straight, diagonal, herringbone
  const [tilePerspectiveAngle, setTilePerspectiveAngle] = useState(55);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedProduct?.imageUrl) {
      setActiveTileTexture(selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // Start Camera Stream (Triggered on mount & explicit button tap)
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError('');
    setCapturedPhoto(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Tarayıcınız kamera akışını desteklemiyor. Sanal Showroom modu aktif.');
      setCameraLoading(false);
      return;
    }

    let mediaStream = null;

    // Constraint Strategy 1: Environment (rear camera)
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } catch (e1) {
      // Constraint Strategy 2: User (front camera)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } catch (e2) {
        // Constraint Strategy 3: Any video track
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (e3) {
          console.warn('All camera constraints rejected:', e3);
        }
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
          } catch (pErr) {
            console.error('Video play error:', pErr);
          }
          setCameraLoading(false);
        };
      }
    } else {
      setCameraError('Kamera izni kısıtlı. Aşağıdaki butona dokunarak kamera iznini etkinleştirebilir veya Sanal Showroom modunu kullanabilirsiniz.');
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Render Canvas (Live Video OR Procedural Virtual Showroom Room Background)
  useEffect(() => {
    if (!isOpen || capturedPhoto) return;

    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeTileTexture;

    const userBgImg = new Image();
    if (userPhotoBg) {
      userBgImg.src = userPhotoBg;
    }

    const renderAROverlay = () => {
      const video = videoRef.current;
      const hasLiveVideo = video && video.readyState === 4 && stream;

      if (hasLiveVideo) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if (userPhotoBg && userBgImg.complete && userBgImg.naturalWidth > 0) {
        if (canvas.width !== 1280) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        ctx.drawImage(userBgImg, 0, 0, canvas.width, canvas.height);
      } else {
        if (canvas.width !== 1280) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        // Procedural Virtual Showroom Backdrop
        const roomGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 3, 100,
          canvas.width / 2, canvas.height / 2, canvas.width / 1.1
        );
        roomGrad.addColorStop(0, '#1e293b');
        roomGrad.addColorStop(0.6, '#0f172a');
        roomGrad.addColorStop(1, '#020617');
        ctx.fillStyle = roomGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective wall line
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;
        const horizY = canvas.height * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, horizY);
        ctx.lineTo(canvas.width, horizY);
        ctx.stroke();
        ctx.restore();
      }

      const w = canvas.width;
      const h = canvas.height;

      // Calculate perspective trapezoid for floor plane
      const horizonY = h * (1 - tilePerspectiveAngle / 100);
      const topWidth = w * 0.45;
      const bottomWidth = w * 1.1;

      const p1 = { x: (w - topWidth) / 2, y: horizonY };
      const p2 = { x: (w + topWidth) / 2, y: horizonY };
      const p3 = { x: (w + bottomWidth) / 2, y: h };
      const p4 = { x: (w - bottomWidth) / 2, y: h };

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        const pattern = ctx.createPattern(img, 'repeat');
        if (pattern) {
          ctx.globalAlpha = 0.88;
          ctx.translate(w / 2, h);
          if (layStyle === 'diagonal') ctx.rotate(Math.PI / 4);
          if (layStyle === 'herringbone') ctx.rotate(Math.PI / 6);
          ctx.scale(0.35, 0.22);
          ctx.translate(-w / 2, -h);

          ctx.fillStyle = pattern;
          ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);
        }
      } else {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // Draw Joint Grout Grid Lines
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.clip();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 2;

      const lineCount = 8;
      for (let i = 0; i <= lineCount; i++) {
        const t = i / lineCount;
        const startX = p1.x + (p2.x - p1.x) * t;
        const endX = p4.x + (p3.x - p4.x) * t;
        ctx.beginPath();
        ctx.moveTo(startX, p1.y);
        ctx.lineTo(endX, p3.y);
        ctx.stroke();
      }

      const hCount = 10;
      for (let j = 1; j <= hCount; j++) {
        const t = Math.pow(j / hCount, 1.8);
        const yVal = p1.y + (h - p1.y) * t;
        const leftX = p1.x + (p4.x - p1.x) * t;
        const rightX = p2.x + (p3.x - p2.x) * t;
        ctx.beginPath();
        ctx.moveTo(leftX, yVal);
        ctx.lineTo(rightX, yVal);
        ctx.stroke();
      }
      ctx.restore();

      // Watermark Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(16, 16, isMobile ? 180 : 250, 34, 10);
      ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.font = `bold ${isMobile ? '11px' : '13px'} Outfit, sans-serif`;
      ctx.fillText(hasLiveVideo ? '✨ Canlı WebAR Kamera' : '🏛️ Sanal Showroom Modu', 26, 38);

      animationFrameId = requestAnimationFrame(renderAROverlay);
    };

    renderAROverlay();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, activeTileTexture, layStyle, tilePerspectiveAngle, capturedPhoto, stream, isMobile]);

  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPhoto(dataUrl);
    }
  };

  if (!isOpen) return null;

  if (viewMode === 'SCANNER') {
    return (
      <ARRoomScannerModal
        isOpen={isOpen}
        onClose={onClose}
        selectedProduct={selectedProduct}
        currentDealer={currentDealer}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden'
    }}>
      {/* Sleek Mobile Native Top App Bar */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
            color: '#000',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '900',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            <Sparkles size={12} />
            <span>WebAR</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedProduct?.name || 'Zemin Kaplama'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setViewMode('SCANNER')}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Maximize2 size={13} />
            <span>Oda Taraması</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Hidden HTML5 Video element */}
        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

        {/* Native Camera Capture File Input (Bypasses WebRTC PWA OS permission blocks) */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleNativePhotoCapture}
          style={{ display: 'none' }}
        />

        {/* Live / Fallback Render Canvas */}
        {!capturedPhoto && (
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}

        {/* Camera Permission / Action Banner */}
        {cameraError && !capturedPhoto && !userPhotoBg && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            width: 'calc(100% - 32px)',
            maxWidth: '420px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            padding: '12px 14px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: '700', marginBottom: '8px' }}>
              {cameraError}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={startCamera}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                🔄 Canlı Kamerayı Yeniden Dene
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                  border: 'none',
                  color: '#000',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                📸 Fotoğraf Çek & Odana Döşe
              </button>
            </div>
          </div>
        )}

        {/* Captured Photo Snapshot View */}
        {capturedPhoto && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={capturedPhoto} alt="WebAR Snapshot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              zIndex: 25
            }}>
              <a
                href={capturedPhoto}
                download={`seramikbak-webar-${Date.now()}.png`}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={16} />
                <span>İndir</span>
              </a>
              <button
                onClick={() => setCapturedPhoto(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Tekrar Çek
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sleek Mobile Bottom Toolbar */}
      {!capturedPhoto && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(14px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 20,
          boxSizing: 'border-box'
        }}>
          {/* Tile Laying Style & Snapshot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'straight', label: 'Düz' },
                { id: 'diagonal', label: 'Çapraz' },
                { id: 'herringbone', label: 'Balıksırtı' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setLayStyle(s.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: layStyle === s.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                    color: layStyle === s.id ? '#000' : '#fff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleTakeSnapshot}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Camera size={14} />
              <span>Fotoğraf Çek</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
