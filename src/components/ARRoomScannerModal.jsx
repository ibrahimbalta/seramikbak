'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone,
  Download, Sparkles, Plus, Trash2, Send, MessageCircle, Calculator,
  Maximize2, ShieldCheck, Store, ChevronRight
} from 'lucide-react';

export default function ARRoomScannerModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');

  // Surface Type: 'WALL' or 'FLOOR'
  const [surfaceType, setSurfaceType] = useState('WALL');

  // Physical Room Measurement State (in meters)
  const [roomWidth, setRoomWidth] = useState(3.5);  // meters
  const [roomHeight, setRoomHeight] = useState(2.6); // meters

  // Active Tile Product info
  const tileW = (selectedProduct?.width || 60) / 100; // in meters (e.g. 0.6)
  const tileH = (selectedProduct?.height || 120) / 100; // in meters (e.g. 1.2)
  const tileM2PerBox = (tileW * tileH * 2) || 1.44; // estimated 2 pcs per box = 1.44m²
  const tilePricePerM2 = selectedProduct?.trendyolPrice || selectedProduct?.koctasPrice || 450; // TL/m² fallback

  // Cutout Subtractions List (Doors, Windows, Shower enclosures)
  const [cutouts, setCutouts] = useState([
    { id: 1, type: 'Pencere', w: 1.2, h: 1.2 },
    { id: 2, type: 'Kapı', w: 0.9, h: 2.1 }
  ]);

  // Tile Customization
  const [activeTileTexture, setActiveTileTexture] = useState(
    selectedProduct?.textureUrl || selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg'
  );
  const [layStyle, setLayStyle] = useState('straight'); // 'straight', 'diagonal', 'herringbone'
  const [groutColor, setGroutColor] = useState('#d4af37'); // Gold, White, Gray, Dark
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
  const netWithWasteM2 = parseFloat((netAreaM2 * 1.10).toFixed(2)); // %10 fire dahil
  const boxCount = Math.ceil(netWithWasteM2 / tileM2PerBox);
  const totalTileCost = Math.round(netWithWasteM2 * tilePricePerM2);
  const adhesiveBags = Math.ceil(netWithWasteM2 / 5); // 1 bag per 5m²
  const groutKg = Math.ceil(netWithWasteM2 * 0.4);   // 0.4kg grout per m²
  const totalEstMaterialCost = totalTileCost + (adhesiveBags * 280) + (groutKg * 45); // Yapıştırıcı 280₺, Derz 45₺/kg

  useEffect(() => {
    if (selectedProduct?.imageUrl || selectedProduct?.textureUrl) {
      setActiveTileTexture(selectedProduct.textureUrl || selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // Handle Camera Feed
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
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tarayıcınız kamera erişimini desteklemiyor.');
      }
      
      let mediaStream = null;
      
      // 1. Try environment / rear camera (ideal for mobile room scan)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (e1) {
        // 2. Fallback to any available video camera (webcam / front camera)
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
      console.error('AR Camera Error:', err);
      const errMsg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Kamera izni verimedi. Lütfen adres çubuğundaki kilit ikonuna tıklayıp kamera iznini "İzin Ver" olarak değiştirin.'
        : 'Cihazınızda kamera bulunamadı veya başka bir uygulama tarafından kullanılıyor.';
      setCameraError(errMsg);
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  // Render Canvas Laser AR Overlay
  useEffect(() => {
    if (!isOpen || cameraLoading || cameraError) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tileImg = new Image();
    tileImg.crossOrigin = 'anonymous';
    tileImg.src = activeTileTexture;

    const renderARScanner = () => {
      const video = videoRef.current;
      if (video && video.readyState === 4) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        if (canvas.width !== 1280) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Surface Bounding Box & Laser Pins
      const paddingX = w * 0.15;
      const topY = h * (1 - perspectiveTilt / 100);
      const botY = h * 0.85;

      ctx.save();
      
      // Laser Scanning Grid Box
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
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

      const cols = Math.round(roomWidth * 2);
      const rows = Math.round(roomHeight * 2);
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
        { x: paddingX, y: topY, label: 'P1' },
        { x: w - paddingX, y: topY, label: 'P2' },
        { x: w - paddingX, y: botY, label: 'P3' },
        { x: paddingX, y: botY, label: 'P4' }
      ];

      corners.forEach(c => {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Live Dimension Measurement Tags
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;

      // Top Width Badge
      ctx.beginPath();
      ctx.roundRect(w / 2 - 60, topY - 36, 120, 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`↔ ${roomWidth} m`, w / 2, topY - 18);

      // Left Height Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(paddingX - 110, (topY + botY) / 2 - 14, 100, 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`↕ ${roomHeight} m`, paddingX - 60, (topY + botY) / 2 + 4);

      // Center Area Badge
      ctx.fillStyle = 'rgba(212, 175, 55, 0.95)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 90, (topY + botY) / 2 - 20, 180, 40, 12);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = '900 15px Outfit, sans-serif';
      ctx.fillText(`Net Kaplama: ${netAreaM2} m²`, w / 2, (topY + botY) / 2 + 5);

      ctx.restore();

      animId = requestAnimationFrame(renderARScanner);
    };

    renderARScanner();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, cameraLoading, cameraError, roomWidth, roomHeight, netAreaM2, activeTileTexture, layStyle, groutColor, perspectiveTilt]);

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

  // Submit Quote & Save Lead
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

  // Generate Pre-filled WhatsApp Share URL
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
      fontFamily: 'Outfit, system-ui, sans-serif'
    }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '12px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Sparkles size={16} />
            <span>AR LiDAR Scanner</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
              {selectedProduct?.name || 'Canlı AR Oda & Duvar Tarayıcısı'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {currentDealer?.name ? `Showroom Kiosk: ${currentDealer.name}` : 'Mobil Evde Ölç & Gör Modu'}
            </span>
          </div>
        </div>

        {/* Tab Switchers */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('SCANNER')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'SCANNER' ? '#d4af37' : 'transparent',
              color: activeTab === 'SCANNER' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            📷 AR Kamera
          </button>
          <button
            onClick={() => setActiveTab('CALCULATOR')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'CALCULATOR' ? '#d4af37' : 'transparent',
              color: activeTab === 'CALCULATOR' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            📐 Metraj & Boşluklar ({netAreaM2} m²)
          </button>
          <button
            onClick={() => setActiveTab('QUOTE')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'QUOTE' ? '#10b981' : 'transparent',
              color: activeTab === 'QUOTE' ? '#fff' : '#cbd5e1',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            📄 Teklif & WhatsApp
          </button>
        </div>

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

      {/* Main Container Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        
        {/* TAB 1: AR CAMERA & SCANNER VIEW */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: activeTab === 'SCANNER' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Floating Live Dimensions Controller Panel on Camera */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px',
            padding: '16px',
            width: '280px',
            zIndex: 15,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#d4af37' }}>YÜZEY TİPİ SEÇİN</span>
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
            </div>

            {/* Width Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                <span>Genişlik (En):</span>
                <span style={{ fontWeight: '800', color: '#d4af37' }}>{roomWidth} Metre</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.1"
                value={roomWidth}
                onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#d4af37' }}
              />
            </div>

            {/* Height Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                <span>Yükseklik (Boy):</span>
                <span style={{ fontWeight: '800', color: '#d4af37' }}>{roomHeight} Metre</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={roomHeight}
                onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#d4af37' }}
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
                fontSize: '0.82rem',
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
          </div>
        </div>

        {/* TAB 2: CALCULATOR & CUTOUT MANAGER */}
        <div style={{
          flex: 1,
          display: activeTab === 'CALCULATOR' ? 'flex' : 'none',
          padding: '24px',
          overflowY: 'auto',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Left Column: Dimensions & Cutouts */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={18} />
                <span>Oda & Duvar Brüt Alanı</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Duvar / Zemin Genişliği (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Yükseklik / Derinlik (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '14px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                Brüt Yüzey Alanı: <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
              </div>
            </div>

            {/* Cutout Subtractions Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} />
                  <span>Düşülecek Boşluklar (Kapı, Pencere, Duşakabin)</span>
                </h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => addCutout('Kapı')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    + Kapı
                  </button>
                  <button
                    onClick={() => addCutout('Pencere')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    + Pencere
                  </button>
                  <button
                    onClick={() => addCutout('Duşakabin')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    + Duşakabin
                  </button>
                </div>
              </div>

              {cutouts.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Henüz düşülen boşluk yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cutouts.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff', width: '100px' }}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.w}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map(c => c.id === item.id ? { ...c, w: val } : c));
                          }}
                          style={{ width: '60px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', color: '#fff' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>m x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.h}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map(c => c.id === item.id ? { ...c, h: val } : c));
                          }}
                          style={{ width: '60px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', color: '#fff' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>m =</span>
                        <strong style={{ color: '#f87171', width: '60px', textAlign: 'right' }}>{(item.w * item.h).toFixed(2)} m²</strong>
                      </div>
                      <button
                        onClick={() => removeCutout(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Calculations & Material Basket */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid #d4af37',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#d4af37', fontWeight: '900' }}>
                📊 Otematik Malzeme & Metraj Özeti
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Brüt Yüzey Alanı:</span>
                  <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#f87171' }}>Düşülen Boşluklar Toplamı:</span>
                  <strong style={{ color: '#f87171' }}>- {cutoutAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>Net Kaplama Alanı:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{netAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Gerekli Seramik (%10 Fire Dahil):</span>
                  <strong style={{ color: '#d4af37' }}>{netWithWasteM2} m² ({boxCount} Kutu)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>C2TE Seramik Yapıştırıcısı (25kg):</span>
                  <strong style={{ color: '#fff' }}>{adhesiveBags} Çuval</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Derz Dolgusu:</span>
                  <strong style={{ color: '#fff' }}>{groutKg} kg</strong>
                </div>

                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Tahmini Toplam Malzeme Tutarı</span>
                    <strong style={{ fontSize: '1.4rem', color: '#d4af37', fontWeight: '900' }}>{totalEstMaterialCost.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                  <button
                    onClick={() => setActiveTab('QUOTE')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Teklif Oluştur</span>
                    <ChevronRight size={18} />
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
          padding: '32px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            {!submitSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <Store size={28} style={{ color: '#d4af37' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: '900' }}>
                      Bayiden Anında Fiyat & Teklif Alın
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {currentDealer?.name ? `${currentDealer.name} Bayisine Gönderiliyor` : 'En Yakın Yetkili Bayi Eşleşiyor'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Adınız Soyadınız *</label>
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Özel Not / Proje Detayı</label>
                    <textarea
                      rows="2"
                      placeholder="Örn: Usta montaj hizmeti de istiyorum..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSaveLead}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      padding: '14px',
                      borderRadius: '14px',
                      fontWeight: '900',
                      fontSize: '1rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 24px rgba(37,211,102,0.4)'
                    }}
                  >
                    <MessageCircle size={20} />
                    <span>WhatsApp'tan Bayiye Gönder & Teklif Al</span>
                  </a>

                  <button
                    onClick={handleSaveLead}
                    disabled={isSubmitting}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid #d4af37',
                      color: '#d4af37',
                      padding: '14px',
                      borderRadius: '14px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <Send size={18} />
                    <span>{isSubmitting ? 'Kaydediliyor...' : 'Sadece Kaydet & Bayiye İlet'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={56} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#fff' }}>AR Ölçüm Teklifiniz Alındı!</h3>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
                  {netAreaM2} m² net kaplama alanınız ve malzeme sepetiniz ilgili bayimize iletildi. En kısa sürede sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={onClose}
                  style={{
                    background: '#d4af37',
                    color: '#000',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '12px',
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
