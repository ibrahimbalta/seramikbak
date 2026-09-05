'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone, Download, Sparkles, Maximize2 } from 'lucide-react';
import ARRoomScannerModal from './ARRoomScannerModal';

export default function WebARModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraLoading, setCameraLoading] = useState(true);
  
  // AR View Mode: 'STUDIO' (Live 2D Tile Grid) or 'SCANNER' (LiDAR & Cutout Measurement)
  const [viewMode, setViewMode] = useState('STUDIO');

  // AR Customization Controls
  const [activeTileTexture, setActiveTileTexture] = useState(selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg');
  const [tileSize, setTileSize] = useState(selectedProduct?.width && selectedProduct?.height ? `${selectedProduct.width}x${selectedProduct.height}` : '60x120');
  const [layStyle, setLayStyle] = useState('straight'); // straight, diagonal, herringbone
  const [tilePerspectiveAngle, setTilePerspectiveAngle] = useState(55); // Degrees for floor tilt
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    if (selectedProduct?.imageUrl) {
      setActiveTileTexture(selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // Start Camera Stream when Modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError('');
    setCapturedPhoto(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tarayıcınız kamera erişimini desteklemiyor.');
      }

      let mediaStream = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (e1) {
        console.warn('Rear camera unavailable, trying any camera:', e1);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (!mediaStream) {
        throw new Error('Kamera akışı alınamadı.');
      }

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
    } catch (err) {
      console.error('WebAR Camera Error:', err);
      const errMsg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Kamera izni reddedildi. Lütfen adres çubuğundaki kilit (veya ayarlar) ikonuna tıklayıp kamera iznini "İzin Ver" olarak değiştirin.'
        : 'Canlı kamera başlatılamadı (Kamera kullanılamıyor veya kapalı).';
      setCameraError(errMsg);
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Render Web-AR Perspective Floor Grid on Canvas
  useEffect(() => {
    if (!isOpen || cameraLoading || cameraError || capturedPhoto) return;

    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeTileTexture;

    const renderAROverlay = () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) {
        animationFrameId = requestAnimationFrame(renderAROverlay);
        return;
      }

      // Match canvas dimensions to video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw live camera video frame
      ctx.drawImage(video, 0, 0, w, h);

      // 2. Calculate perspective trapezoid for floor plane (lower 55% of screen)
      const horizonY = h * (1 - tilePerspectiveAngle / 100); // Floor starts here
      const topWidth = w * 0.45;
      const bottomWidth = w * 1.1;

      // Floor Trapazoid vertices
      const p1 = { x: (w - topWidth) / 2, y: horizonY }; // Top Left
      const p2 = { x: (w + topWidth) / 2, y: horizonY }; // Top Right
      const p3 = { x: (w + bottomWidth) / 2, y: h };     // Bottom Right
      const p4 = { x: (w - bottomWidth) / 2, y: h };    // Bottom Left

      // 3. Render AR Ceramic Tile Grid Layer
      ctx.save();
      
      // Clip rendering to floor region
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.clip();

      // Create patterned tile fill
      if (img.complete && img.naturalWidth > 0) {
        const pattern = ctx.createPattern(img, 'repeat');
        if (pattern) {
          ctx.globalAlpha = 0.85; // Subtle blend with room lighting
          
          // Apply transformation for floor tilt
          ctx.translate(w / 2, h);
          if (layStyle === 'diagonal') ctx.rotate(Math.PI / 4);
          if (layStyle === 'herringbone') ctx.rotate(Math.PI / 6);
          ctx.scale(0.35, 0.22); // Perspective scale
          ctx.translate(-w / 2, -h);

          ctx.fillStyle = pattern;
          ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);
        }
      } else {
        // Fallback grid pattern if texture loading
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      // 4. Draw Tile Joint Grid Overlay Lines (Joint Grout lines)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.clip();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 2;

      // Vertical perspective lines
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

      // Horizontal perspective joint lines
      const hCount = 10;
      for (let j = 1; j <= hCount; j++) {
        const t = Math.pow(j / hCount, 1.8); // Perspective compression towards horizon
        const yVal = p1.y + (h - p1.y) * t;
        const leftX = p1.x + (p4.x - p1.x) * t;
        const rightX = p2.x + (p3.x - p2.x) * t;
        ctx.beginPath();
        ctx.moveTo(leftX, yVal);
        ctx.lineTo(rightX, yVal);
        ctx.stroke();
      }

      ctx.restore();

      // 5. Watermark Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 40, 10);
      ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('✨ SeramikBak WebAR Live Studio', 32, 45);

      animationFrameId = requestAnimationFrame(renderAROverlay);
    };

    renderAROverlay();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, cameraLoading, cameraError, activeTileTexture, layStyle, tilePerspectiveAngle, capturedPhoto]);

  // Capture Photo Snapshot
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
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Top Header Controls Bar */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
            color: '#000',
            padding: '6px 12px',
            borderRadius: '10px',
            fontWeight: '900',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            <span>WebAR Studio</span>
          </div>
          <span style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: '600' }}>
            {selectedProduct?.name || 'Canlı Zemin Seramik Önizleme'}
          </span>
        </div>

        {/* View Mode Switcher Header Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setViewMode('SCANNER')}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Maximize2 size={14} />
            <span>📱 LiDAR & Oda Ölçüm Taraması</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Hidden HTML5 Video element */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ display: 'none' }}
        />

        {/* Live Render Canvas */}
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

        {/* Captured Photo Snapshot View */}
        {capturedPhoto && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={capturedPhoto} alt="WebAR Fotoğraf Snapshot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              zIndex: 20
            }}>
              <a
                href={capturedPhoto}
                download={`seramikbak-webar-${Date.now()}.png`}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.4)'
                }}
              >
                <Download size={18} />
                <span>Fotoğrafı İndir</span>
              </a>
              <button
                onClick={() => setCapturedPhoto(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Yeniden Çek
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {cameraLoading && !cameraError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 15
          }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: '#d4af37' }} />
            <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '600' }}>Canlı Kamera ve Zemin Taraması Başlatılıyor...</span>
          </div>
        )}

        {/* Error Fallback Box */}
        {cameraError && (
          <div style={{
            margin: '20px',
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '480px',
            zIndex: 15
          }}>
            <Smartphone size={40} style={{ color: '#f87171', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#fff' }}>Kamera Başlatılamadı</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px 0' }}>{cameraError}</p>
            <button
              onClick={startCamera}
              style={{
                background: '#d4af37',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Tekrar Deneyin
            </button>
          </div>
        )}
      </div>

      {/* Bottom AR Controls Toolbar */}
      {!cameraLoading && !cameraError && !capturedPhoto && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 10
        }}>
          {/* Tile Texture Swatch Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', minWidth: '60px' }}>Desen:</span>
            {[
              { name: 'Calacatta Gold', url: '/textures/calacatta_gold.jpg' },
              { name: 'Traverten', url: '/textures/travertine.jpg' },
              { name: 'Ahşap Meşe', url: '/textures/wood.jpg' },
              { name: 'Antrasit Granit', url: '/textures/antrasit.jpg' },
              { name: 'Gri Beton', url: '/textures/beton.jpg' }
            ].map(t => (
              <button
                key={t.name}
                onClick={() => setActiveTileTexture(t.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: activeTileTexture === t.url ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.06)',
                  border: activeTileTexture === t.url ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                  color: activeTileTexture === t.url ? '#d4af37' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src={t.url} alt={t.name} style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Controls Bar: Laying Style + Perspective Slider + Snapshot Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {/* Laying Style Switcher */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'straight', label: 'Düz' },
                { id: 'diagonal', label: 'Çapraz' },
                { id: 'herringbone', label: 'Balıksırtı' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setLayStyle(s.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: layStyle === s.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                    color: layStyle === s.id ? '#000' : '#fff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Perspective Tilt Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={14} style={{ color: '#d4af37' }} />
              <input
                type="range"
                min="30"
                max="75"
                value={tilePerspectiveAngle}
                onChange={(e) => setTilePerspectiveAngle(parseInt(e.target.value, 10))}
                style={{ width: '80px', accentColor: '#d4af37', cursor: 'pointer' }}
                title="Zemin Açısını Ayarla"
              />
            </div>

            {/* Capture Snapshot Button */}
            <button
              onClick={handleTakeSnapshot}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#000',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Camera size={16} />
              <span>Fotoğraf Çek</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
