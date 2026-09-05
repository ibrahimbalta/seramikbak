'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone,
  Download, Sparkles, Plus, Trash2, Send, MessageCircle, Calculator,
  Maximize2, ShieldCheck, Store, ChevronRight, AlertCircle, ChevronDown, ChevronUp,
  Target, Compass, CornerDownRight, Check
} from 'lucide-react';

export default function ARRoomScannerModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(true);
  const [userPhotoBg, setUserPhotoBg] = useState(null);

  // Surface Type: 'WALL' or 'FLOOR'
  const [surfaceType, setSurfaceType] = useState('WALL');

  // Room Measurement State (in meters)
  const [roomWidth, setRoomWidth] = useState(3.5);  // meters (En)
  const [roomHeight, setRoomHeight] = useState(2.6); // meters (Boy)

  // Interactive Laser Pinning State (Points P1, P2 set via camera reticle tap)
  const [pinnedPointCount, setPinnedPointCount] = useState(0);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Active Tile Product info
  const tileW = (selectedProduct?.width || 60) / 100;
  const tileH = (selectedProduct?.height || 120) / 100;
  const tileM2PerBox = (tileW * tileH * 2) || 1.44;
  const tilePricePerM2 = selectedProduct?.trendyolPrice || selectedProduct?.koctasPrice || 450;

  // Cutout Subtractions List (Doors, Windows, Shower enclosures)
  const [cutouts, setCutouts] = useState([
    { id: 1, type: 'Pencere', w: 1.2, h: 1.2 },
    { id: 2, type: 'Kapı', w: 0.9, h: 2.1 }
  ]);

  // Tile Customization
  const [activeTileTexture, setActiveTileTexture] = useState(
    selectedProduct?.textureUrl || selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg'
  );
  const [layStyle, setLayStyle] = useState('straight');
  const [groutColor, setGroutColor] = useState('#d4af37');
  const [perspectiveTilt, setPerspectiveTilt] = useState(50);

  // Quote & Lead Submission State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('SCANNER'); // 'SCANNER' | 'CALCULATOR' | 'QUOTE'

  // Calculated Metrics
  const grossAreaM2 = parseFloat((roomWidth * roomHeight).toFixed(2));
  const cutoutAreaM2 = parseFloat(
    cutouts.reduce((acc, curr) => acc + curr.w * curr.h, 0).toFixed(2)
  );
  const netAreaM2 = Math.max(0, parseFloat((grossAreaM2 - cutoutAreaM2).toFixed(2)));
  const netWithWasteM2 = parseFloat((netAreaM2 * 1.10).toFixed(2));
  const boxCount = Math.ceil(netWithWasteM2 / tileM2PerBox);
  const totalTileCost = Math.round(netWithWasteM2 * tilePricePerM2);
  const adhesiveBags = Math.ceil(netWithWasteM2 / 5);
  const groutKg = Math.ceil(netWithWasteM2 * 0.4);
  const totalEstMaterialCost = totalTileCost + (adhesiveBags * 280) + (groutKg * 45);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedProduct?.imageUrl || selectedProduct?.textureUrl) {
      setActiveTileTexture(selectedProduct.textureUrl || selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // Handle Camera Feed Direct Auto-Start on Mount
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
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera erişimi desteklenmiyor. Sanal Showroom modu aktif.');
      setCameraLoading(false);
      return;
    }

    let mediaStream = null;

    // Constraint Strategy 1: Rear environment camera
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } catch (e1) {
      // Constraint Strategy 2: User/front camera
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
          console.warn('All camera constraints failed:', e3);
        }
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      setCameraError('');
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
      setCameraError('Kamera izni kısıtlı. Dokunmatik Lazer Sanal Showroom aktif.');
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  // Pin Point Action for Camera Laser Reticle
  const handlePinNextPoint = () => {
    if (pinnedPointCount === 0) {
      setPinnedPointCount(1);
    } else if (pinnedPointCount === 1) {
      setPinnedPointCount(2);
      setIsScanningActive(false);
    } else {
      setPinnedPointCount(0);
      setIsScanningActive(true);
    }
  };

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

  // Render Canvas Laser AR Overlay & Live Camera Feed
  useEffect(() => {
    if (!isOpen) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tileImg = new Image();
    tileImg.crossOrigin = 'anonymous';
    tileImg.src = activeTileTexture;

    const userBgImg = new Image();
    if (userPhotoBg) {
      userBgImg.src = userPhotoBg;
    }

    const renderARScanner = () => {
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
        
        // Dark Procedural Showroom Backdrop
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 3, 100,
          canvas.width / 2, canvas.height / 2, canvas.width / 1.1
        );
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective Guidelines
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;

        const horizY = canvas.height * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, horizY);
        ctx.lineTo(canvas.width, horizY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.1, 0); ctx.lineTo(canvas.width * 0.1, horizY);
        ctx.moveTo(canvas.width * 0.9, 0); ctx.lineTo(canvas.width * 0.9, horizY);
        ctx.moveTo(canvas.width * 0.1, horizY); ctx.lineTo(0, canvas.height);
        ctx.moveTo(canvas.width * 0.9, horizY); ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();
        ctx.restore();
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Surface Bounding Box & Laser Mesh
      const paddingX = w * (isMobile ? 0.08 : 0.15);
      const topY = h * (1 - perspectiveTilt / 100);
      const botY = h * 0.85;

      ctx.save();

      // Laser Scanning Outer Boundary Box
      ctx.strokeStyle = isScanningActive ? '#d4af37' : '#10b981';
      ctx.lineWidth = isMobile ? 2 : 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(paddingX, topY, w - (paddingX * 2), botY - topY);
      ctx.setLineDash([]);

      // Fill Tile Pattern inside Surface Box
      if (tileImg.complete && tileImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(paddingX, topY, w - (paddingX * 2), botY - topY);
        ctx.clip();
        ctx.globalAlpha = 0.88;

        const pattern = ctx.createPattern(tileImg, 'repeat');
        if (pattern) {
          ctx.translate(w / 2, h / 2);
          if (layStyle === 'diagonal') ctx.rotate(Math.PI / 4);
          if (layStyle === 'herringbone') ctx.rotate(Math.PI / 6);
          ctx.scale(0.4, 0.4);
          ctx.translate(-w / 2, -h / 2);
          ctx.fillStyle = pattern;
          ctx.fillRect(-w, -h, w * 3, h * 3);
        }
        ctx.restore();
      }

      // Joint Grout Grid Lines
      ctx.save();
      ctx.beginPath();
      ctx.rect(paddingX, topY, w - (paddingX * 2), botY - topY);
      ctx.clip();
      ctx.strokeStyle = groutColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;

      const cols = Math.max(2, Math.round(roomWidth * 1.8));
      const rows = Math.max(2, Math.round(roomHeight * 1.8));
      const stepX = (w - paddingX * 2) / cols;
      const stepY = (botY - topY) / rows;

      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(paddingX + i * stepX, topY);
        ctx.lineTo(paddingX + i * stepX, botY);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        ctx.beginPath();
        ctx.moveTo(paddingX, topY + j * stepY);
        ctx.lineTo(w - paddingX, topY + j * stepY);
        ctx.stroke();
      }
      ctx.restore();

      // Laser Pins Corner Crosshairs
      const corners = [
        { x: paddingX, y: topY },
        { x: w - paddingX, y: topY },
        { x: w - paddingX, y: botY },
        { x: paddingX, y: botY }
      ];

      corners.forEach(c => {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(c.x, c.y, isMobile ? 6 : 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, isMobile ? 10 : 14, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Center Laser Reticle Target Pointer
      ctx.save();
      const centerX = w / 2;
      const centerY = (topY + botY) / 2;

      // Pulsing Center Target Ring
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, isMobile ? 16 : 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Laser Crosshair lines
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 30, centerY); ctx.lineTo(centerX + 30, centerY);
      ctx.moveTo(centerX, centerY - 30); ctx.lineTo(centerX, centerY + 30);
      ctx.stroke();
      ctx.restore();

      // Dimension Badges
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;

      // Top Width Badge (En)
      ctx.beginPath();
      ctx.roundRect(w / 2 - (isMobile ? 55 : 65), topY - (isMobile ? 30 : 36), isMobile ? 110 : 130, isMobile ? 24 : 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isMobile ? '11px' : '13px'} Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`↔ En: ${roomWidth} m`, w / 2, topY - (isMobile ? 14 : 18));

      // Left Height Badge (Boy)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(paddingX - (isMobile ? 90 : 110), (topY + botY) / 2 - 14, isMobile ? 85 : 100, 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`↕ Boy: ${roomHeight} m`, paddingX - (isMobile ? 48 : 60), (topY + botY) / 2 + 4);

      // Center Net Area Badge
      ctx.fillStyle = 'rgba(212, 175, 55, 0.95)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - (isMobile ? 80 : 95), (topY + botY) / 2 - (isMobile ? 16 : 20), isMobile ? 160 : 190, isMobile ? 32 : 40, 10);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${isMobile ? '13px' : '15px'} Outfit, sans-serif`;
      ctx.fillText(`Net Kaplama: ${netAreaM2} m²`, w / 2, (topY + botY) / 2 + (isMobile ? 4 : 5));

      ctx.restore();

      animId = requestAnimationFrame(renderARScanner);
    };

    renderARScanner();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, roomWidth, roomHeight, netAreaM2, activeTileTexture, layStyle, groutColor, perspectiveTilt, stream, isMobile, isScanningActive]);

  // Cutout Handlers
  const addCutout = (type) => {
    const defaults = {
      'Kapı': { w: 0.9, h: 2.1 },
      'Pencere': { w: 1.2, h: 1.2 },
      'Duşakabin': { w: 1.0, h: 2.0 }
    };
    const size = defaults[type] || { w: 1.0, h: 1.0 };
    setCutouts([...cutouts, { id: Date.now(), type, w: size.w, h: size.h }]);
  };

  const removeCutout = (id) => {
    setCutouts(cutouts.filter(c => c.id !== id));
  };

  // Submit Lead API
  const handleSaveLead = async () => {
    if (!clientName || !clientPhone) {
      alert('Lütfen Ad Soyad ve Telefon numaranızı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ar/scan-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?.id || 'demo-product-id',
          dealerId: currentDealer?.id || null,
          clientName,
          clientPhone,
          clientEmail: '',
          surfaceType,
          grossAreaM2,
          cutoutAreaM2,
          netAreaM2,
          boxCount,
          adhesiveBags,
          groutKg,
          notes: clientNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        alert(data.error || 'Teklif kaydı oluşturulamadı.');
      }
    } catch (err) {
      alert('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Link
  const getWhatsAppShareUrl = () => {
    const dealerPhone = currentDealer?.phone?.replace(/\D/g, '') || '905555555555';
    const text = encodeURIComponent(
      `Merhaba Sayın Bayi,\nSeramikBak AR LiDAR Scanner ile aldığım oda ölçüm teklif detayım:\n\n` +
      `📦 *Ürün:* ${selectedProduct?.name || 'Seramik Karo'} (${selectedProduct?.width || 60}x${selectedProduct?.height || 120} cm)\n` +
      `📏 *Oda Tipi:* ${surfaceType === 'WALL' ? 'Duvar Kaplama' : 'Zemin Kaplama'}\n` +
      `📐 *Ölçü:* Brüt ${grossAreaM2}m² | Düşülen Boşluk ${cutoutAreaM2}m² | *Net ${netAreaM2}m²*\n` +
      `📦 *Gerekli Kutu:* ${boxCount} Kutu (%10 fire dahil)\n` +
      `🧱 *Sarf Malzemesi:* ${adhesiveBags} Çuval Yapıştırıcı + ${groutKg}kg Derz Dolgusu\n` +
      `💰 *Tahmini Tutar:* ${totalEstMaterialCost.toLocaleString('tr-TR')} ₺\n\n` +
      `Müşteri: ${clientName || 'İsimsiz Müşteri'} (${clientPhone || 'Telefon belirtilmedi'})\n` +
      `Teklifi onaylamak ve sevkiyat planlamak istiyorum.`
    );
    return `https://wa.me/${dealerPhone}?text=${text}`;
  };

  if (!isOpen) return null;

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
      height: '100dvh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Responsive Mobile Header Bar */}
      <div style={{
        padding: isMobile ? '10px 14px' : '12px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '12px',
        zIndex: 30,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
              color: '#000',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: isMobile ? '0.75rem' : '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={14} />
              <span>AR LiDAR</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '180px' : '300px' }}>
                {selectedProduct?.name || 'Canlı AR Oda Tarayıcısı'}
              </h3>
            </div>
          </div>

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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '10px', gap: '4px', width: '100%' }}>
          <button
            onClick={() => setActiveTab('SCANNER')}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'SCANNER' ? '#d4af37' : 'transparent',
              color: activeTab === 'SCANNER' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📷 AR Kamera
          </button>
          <button
            onClick={() => setActiveTab('CALCULATOR')}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'CALCULATOR' ? '#d4af37' : 'transparent',
              color: activeTab === 'CALCULATOR' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📐 Metraj ({netAreaM2}m²)
          </button>
          <button
            onClick={() => setActiveTab('QUOTE')}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'QUOTE' ? '#10b981' : 'transparent',
              color: activeTab === 'QUOTE' ? '#fff' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📄 Teklif Al
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* TAB 1: AR CAMERA & SCANNER VIEW */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: activeTab === 'SCANNER' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Video Stream Element */}
          <video ref={videoRef} playsInline muted autoPlay style={{ display: 'none' }} />
          
          {/* Native Camera Capture File Input (Bypasses WebRTC PWA OS permission blocks) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleNativePhotoCapture}
            style={{ display: 'none' }}
          />

          {/* Live / Fallback Interactive Canvas */}
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Floating Top Action Bar: Corner Pinning & Native Camera Capture */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: 'calc(100% - 32px)',
            maxWidth: '480px'
          }}>
            <button
              onClick={handlePinNextPoint}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#000',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '20px',
                fontWeight: '900',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Target size={16} />
              <span>{pinnedPointCount === 0 ? '📍 1. Köşeyı İşaretle' : pinnedPointCount === 1 ? '📍 2. Köşeyi İşaretle' : '🔄 Yeniden Ölç'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                backdropFilter: 'blur(8px)',
                padding: '8px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
              }}
            >
              <Camera size={16} />
              <span>📸 Fotoğraf Çek & Odana Döşe</span>
            </button>
          </div>

          {/* Camera Permission / Fallback Information Banner */}
          {cameraError && !userPhotoBg && (
            <div style={{
              position: 'absolute',
              top: '64px',
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
              <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                <span>{cameraError}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={startCamera}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
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
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  📸 Fotoğraf Çek & Odana Döşe
                </button>
              </div>
            </div>
          )}

          {/* Mobile & Desktop Floating Controls Panel */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '12px' : '20px',
            left: isMobile ? '12px' : '20px',
            right: isMobile ? '12px' : 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px',
            padding: isMobile ? '12px' : '16px',
            width: isMobile ? 'auto' : '290px',
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMobilePanel ? '10px' : '0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37' }}>ÖLÇÜM & YÜZEY SEÇİMİ</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setSurfaceType('WALL')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      border: 'none',
                      background: surfaceType === 'WALL' ? '#d4af37' : 'rgba(255,255,255,0.1)',
                      color: surfaceType === 'WALL' ? '#000' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Duvar
                  </button>
                  <button
                    onClick={() => setSurfaceType('FLOOR')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      border: 'none',
                      background: surfaceType === 'FLOOR' ? '#d4af37' : 'rgba(255,255,255,0.1)',
                      color: surfaceType === 'FLOOR' ? '#000' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Zemin
                  </button>
                </div>

                {isMobile && (
                  <button
                    onClick={() => setShowMobilePanel(!showMobilePanel)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    {showMobilePanel ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}
              </div>
            </div>

            {showMobilePanel && (
              <>
                {/* Width Slider */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                    <span>Genişlik (En):</span>
                    <strong style={{ color: '#d4af37' }}>{roomWidth} Metre</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="12.0"
                    step="0.1"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#d4af37', height: '6px' }}
                  />
                </div>

                {/* Height Slider */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                    <span>Yükseklik (Boy):</span>
                    <strong style={{ color: '#d4af37' }}>{roomHeight} Metre</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#d4af37', height: '6px' }}
                  />
                </div>

                <button
                  onClick={() => setActiveTab('CALCULATOR')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Calculator size={16} />
                  <span>Boşluk Düş & Metrajı Gör</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAB 2: CALCULATOR & CUTOUT MANAGER */}
        <div style={{
          flex: 1,
          display: activeTab === 'CALCULATOR' ? 'flex' : 'none',
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '14px' : '24px',
          overflowY: 'auto',
          gap: isMobile ? '16px' : '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Left Column: Dimensions & Cutouts */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={16} />
                <span>Oda & Duvar Brüt Alanı</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Genişlik En (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: '700'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Yükseklik Boy (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: '700'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Brüt Yüzey Alanı: <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
              </div>
            </div>

            {/* Cutout Subtractions Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px'
            }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '8px', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={16} />
                  <span>Düşülecek Boşluklar</span>
                </h4>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => addCutout('Kapı')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    + Kapı
                  </button>
                  <button
                    onClick={() => addCutout('Pencere')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    + Pencere
                  </button>
                  <button
                    onClick={() => addCutout('Duşakabin')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    + Duşakabin
                  </button>
                </div>
              </div>

              {cutouts.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Henüz düşülen boşluk yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cutouts.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#fff' }}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.w}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map(c => c.id === item.id ? { ...c, w: val } : c));
                          }}
                          style={{ width: '50px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.h}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map(c => c.id === item.id ? { ...c, h: val } : c));
                          }}
                          style={{ width: '50px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m =</span>
                        <strong style={{ color: '#f87171', fontSize: '0.82rem' }}>{(item.w * item.h).toFixed(2)} m²</strong>
                      </div>
                      <button
                        onClick={() => removeCutout(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Material Calculations */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid #d4af37',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '24px'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#d4af37', fontWeight: '900' }}>
                📊 Otomatik Malzeme Özeti
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Brüt Alan:</span>
                  <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#f87171' }}>Boşluklar Toplamı:</span>
                  <strong style={{ color: '#f87171' }}>- {cutoutAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>Net Kaplama Alanı:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{netAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Gerekli Seramik (%10 Fire Dahil):</span>
                  <strong style={{ color: '#d4af37' }}>{netWithWasteM2} m² ({boxCount} Kutu)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Yapıştırıcı (25kg Çuval):</span>
                  <strong style={{ color: '#fff' }}>{adhesiveBags} Çuval</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Derz Dolgusu:</span>
                  <strong style={{ color: '#fff' }}>{groutKg} kg</strong>
                </div>

                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Tahmini Toplam Tutar</span>
                    <strong style={{ fontSize: '1.25rem', color: '#d4af37', fontWeight: '900' }}>{totalEstMaterialCost.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <button
                    onClick={() => setActiveTab('QUOTE')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Teklif Al</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 3: SHOWROOM QUOTE & WHATSAPP GENERATOR */}
        <div style={{
          flex: 1,
          display: activeTab === 'QUOTE' ? 'flex' : 'none',
          padding: isMobile ? '16px' : '32px',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '20px',
            padding: isMobile ? '20px' : '32px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            {!submitSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Store size={24} style={{ color: '#d4af37' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#fff', fontWeight: '900' }}>
                      Bayiden Anında Fiyat & Teklif Alın
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {currentDealer?.name ? `${currentDealer.name} Bayisine Gönderiliyor` : 'En Yakın Yetkili Bayi Eşleşiyor'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Adınız Soyadınız *</label>
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Özel Not / Proje Detayı</label>
                    <textarea
                      rows="2"
                      placeholder="Örn: Usta montaj hizmeti de istiyorum..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSaveLead}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(37,211,102,0.4)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp'tan Bayiye Gönder & Teklif Al</span>
                  </a>

                  <button
                    onClick={handleSaveLead}
                    disabled={isSubmitting}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid #d4af37',
                      color: '#d4af37',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Kaydediliyor...' : 'Sadece Kaydet & Bayiye İlet'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#fff' }}>AR Ölçüm Teklifiniz Alındı!</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
                  {netAreaM2} m² net kaplama alanınız ve malzeme sepetiniz ilgili bayimize iletildi.
                </p>
                <button
                  onClick={onClose}
                  style={{
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
