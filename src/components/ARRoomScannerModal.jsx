'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone,
  Download, Sparkles, Plus, Trash2, Send, MessageCircle, Calculator,
  Maximize2, ShieldCheck, Store, ChevronRight, AlertCircle, ChevronDown, ChevronUp,
  Target, Compass, CornerDownRight, Check, Move, Eye, Upload, MapPin, CheckCircle,
  Palette, Grid, Image as ImageIcon, SlidersHorizontal, ArrowRight, Share2
} from 'lucide-react';

export default function ARRoomScannerModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [userPhotoBg, setUserPhotoBg] = useState(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);

  // Active Tab: 'VISUALIZER' (Odamda Gör) | 'CALCULATOR' (Metraj & Malzeme) | 'QUOTE' (En Yakın Bayi)
  const [activeTab, setActiveTab] = useState('VISUALIZER');

  // Surface Type: 'WALL' (Duvar Kaplama) or 'FLOOR' (Zemin Kaplama)
  const [surfaceType, setSurfaceType] = useState('WALL');

  // Tile Laying Style & Customization
  const [layStyle, setLayStyle] = useState('straight'); // straight, diagonal, herringbone
  const [groutColor, setGroutColor] = useState('#d4af37'); // Gold, White, Grey, Anthracite, Beige
  const [tileScale, setTileScale] = useState(1.0); // 0.6x to 1.6x zoom scale
  const [perspectiveTilt, setPerspectiveTilt] = useState(55); // Perspective horizon angle

  // Active Tile Product Texture
  const [activeTileTexture, setActiveTileTexture] = useState(
    selectedProduct?.textureUrl || selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg'
  );

  // Tile Dimensions & Calculation Info
  const tileW = (selectedProduct?.width || 60) / 100;
  const tileH = (selectedProduct?.height || 120) / 100;
  const tileM2PerBox = (tileW * tileH * 2) || 1.44;
  const tilePricePerM2 = selectedProduct?.trendyolPrice || selectedProduct?.koctasPrice || 450;

  // Room Sizing (Meters)
  const [roomWidth, setRoomWidth] = useState(2.4);  // En (m)
  const [roomHeight, setRoomHeight] = useState(2.6); // Boy (m)

  // Cutout Deductions List (Kapı, Pencere, vb.)
  const [cutouts, setCutouts] = useState([]);

  // Calculated Metrics
  const grossAreaM2 = parseFloat((roomWidth * roomHeight).toFixed(2));
  const cutoutAreaM2 = parseFloat(
    cutouts.reduce((acc, curr) => acc + curr.w * curr.h, 0).toFixed(2)
  );
  const netAreaM2 = Math.max(0, parseFloat((grossAreaM2 - cutoutAreaM2).toFixed(2)));
  const netWithWasteM2 = parseFloat((netAreaM2 * 1.10).toFixed(2)); // +%10 fire payı
  const boxCount = Math.ceil(netWithWasteM2 / tileM2PerBox);
  const totalTileCost = Math.round(netWithWasteM2 * tilePricePerM2);
  const adhesiveBags = Math.ceil(netWithWasteM2 / 5); // 1 çuval ~ 5m²
  const groutKg = Math.ceil(netWithWasteM2 * 0.4);   // ~0.4 kg/m²
  const estLaborCost = Math.round(netWithWasteM2 * 350); // Ortalama 350 TL/m² işçilik
  const totalEstMaterialCost = totalTileCost + (adhesiveBags * 280) + (groutKg * 45);
  const totalEstRenovationCost = totalEstMaterialCost + estLaborCost;

  // Nearest Dealer Matching State
  const [assignedDealer, setAssignedDealer] = useState(currentDealer || null);
  const [nearbyDealers, setNearbyDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  // Quote / Lead Submission State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update texture when product changes
  useEffect(() => {
    if (selectedProduct?.imageUrl || selectedProduct?.textureUrl) {
      setActiveTileTexture(selectedProduct.textureUrl || selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // =========================================================================
  // AUTOMATIC NEAREST PRODUCT-DEALER DETECTION
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const findNearestProductDealer = async (userLat, userLng) => {
      setLoadingDealers(true);
      try {
        const prodId = selectedProduct?.id || '';
        const brandId = selectedProduct?.brandId || '';
        const url = `/api/dealers/nearest?lat=${userLat}&lng=${userLng}&productId=${encodeURIComponent(prodId)}&brandId=${encodeURIComponent(brandId)}`;
        const res = await fetch(url);
        const dealers = await res.json();

        if (Array.isArray(dealers) && dealers.length > 0) {
          setNearbyDealers(dealers);
          setAssignedDealer(dealers[0]);
        }
      } catch (err) {
        console.warn('Failed to fetch nearest dealer for product:', err);
      } finally {
        setLoadingDealers(false);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => findNearestProductDealer(pos.coords.latitude, pos.coords.longitude),
        () => findNearestProductDealer(40.9901, 29.0278),
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      findNearestProductDealer(40.9901, 29.0278);
    }
  }, [isOpen, selectedProduct]);

  // =========================================================================
  // CAMERA STREAM LIFECYCLE MANAGEMENT (ZERO HARDWARE LEAK)
  // =========================================================================
  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Track stop error:', e);
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const vStream = videoRef.current.srcObject;
          if (vStream && typeof vStream.getTracks === 'function') {
            vStream.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch (e) {
                console.warn('Video track stop error:', e);
              }
            });
          }
          videoRef.current.srcObject = null;
        }
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
    setStream(null);
    setCameraLoading(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraLoading(true);
    setCameraError('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera erişimi desteklenmiyor. Sanal Showroom modu devrede.');
      setCameraLoading(false);
      return;
    }

    let mediaStream = null;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    } catch (e1) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } catch (e2) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (e3) {
          console.warn('Camera constraints failed:', e3);
        }
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
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
      setCameraError('Kamera izni kısıtlı. Sanal Showroom moduyla devam edebilirsiniz.');
      setCameraLoading(false);
    }
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    if (onClose) onClose();
  }, [stopCamera, onClose]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();

    const handleBeforeUnload = () => stopCamera();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // =========================================================================
  // ACTIONS: PRESETS, SNAPSHOTS & PHOTO UPLOADS
  // =========================================================================
  // 1-Tap Quick Room Sizer
  const applyRoomPreset = (w, h) => {
    setRoomWidth(w);
    setRoomHeight(h);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  };

  // Add / Remove Cutouts
  const addCutout = (type) => {
    const defaults = {
      'Kapı': { w: 0.9, h: 2.0 },
      'Pencere': { w: 1.2, h: 1.2 },
      'Duşakabin': { w: 1.0, h: 2.0 },
      'Mutfak Tezgahı': { w: 2.5, h: 0.6 }
    };
    const size = defaults[type] || { w: 1.0, h: 1.0 };
    setCutouts([...cutouts, { id: Date.now(), type, w: size.w, h: size.h }]);
  };

  const removeCutout = (id) => {
    setCutouts(cutouts.filter((c) => c.id !== id));
  };

  // Freeze Frame / Snapshot
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedSnapshot(dataUrl);
    }
  };

  // Upload Local Room Photo (Gallery)
  const handleNativePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUserPhotoBg(evt.target.result);
        setCapturedSnapshot(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // CANVAS RENDERING ENGINE (PHOTOREALISTIC ROOM TILING)
  // =========================================================================
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
    if (userPhotoBg) userBgImg.src = userPhotoBg;

    const snapshotImg = new Image();
    if (capturedSnapshot) snapshotImg.src = capturedSnapshot;

    const renderVisualizer = () => {
      const video = videoRef.current;
      const hasLiveVideo = !capturedSnapshot && !userPhotoBg && video && video.readyState === 4 && stream;

      // Handle Canvas Resolution
      if (hasLiveVideo) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if (capturedSnapshot && snapshotImg.complete && snapshotImg.naturalWidth > 0) {
        if (canvas.width !== snapshotImg.naturalWidth) {
          canvas.width = snapshotImg.naturalWidth;
          canvas.height = snapshotImg.naturalHeight;
        }
        ctx.drawImage(snapshotImg, 0, 0, canvas.width, canvas.height);
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
        // Procedural Luxury Showroom Room Background
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 3, 100,
          canvas.width / 2, canvas.height / 2, canvas.width / 1.1
        );
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective wall lines
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

      // -------------------------------------------------------------
      // 1. CALCULATE SURFACE POLYGON (WALL vs FLOOR PERSPECTIVE)
      // -------------------------------------------------------------
      let p0, p1, p2, p3;

      if (surfaceType === 'WALL') {
        // Wall Surface: Covers central and upper area with subtle perspective
        const topY = h * 0.12;
        const botY = h * 0.88;
        const padX = w * 0.10;
        p0 = { x: padX, y: botY };
        p1 = { x: w - padX, y: botY };
        p2 = { x: w - padX * 0.95, y: topY };
        p3 = { x: padX * 0.95, y: topY };
      } else {
        // Floor Surface: Perspective trapezoid stretching towards the camera
        const horizonY = h * (1 - perspectiveTilt / 100);
        const topWidth = w * 0.40;
        const bottomWidth = w * 1.10;
        p0 = { x: (w - bottomWidth) / 2, y: h };
        p1 = { x: (w + bottomWidth) / 2, y: h };
        p2 = { x: (w + topWidth) / 2, y: horizonY };
        p3 = { x: (w - topWidth) / 2, y: horizonY };
      }

      // -------------------------------------------------------------
      // 2. RENDER TILES INSIDE PERSPECTIVE POLYGON
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.clip();

      if (tileImg.complete && tileImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.90;
        const pattern = ctx.createPattern(tileImg, 'repeat');
        if (pattern) {
          ctx.save();
          const centerX = (p0.x + p1.x + p2.x + p3.x) / 4;
          const centerY = (p0.y + p1.y + p2.y + p3.y) / 4;
          ctx.translate(centerX, centerY);

          if (layStyle === 'diagonal') ctx.rotate(Math.PI / 4);
          if (layStyle === 'herringbone') ctx.rotate(Math.PI / 6);

          const scaleX = 0.36 * tileScale;
          const scaleY = (surfaceType === 'FLOOR' ? 0.22 : 0.36) * tileScale;
          ctx.scale(scaleX, scaleY);
          ctx.translate(-centerX, -centerY);

          ctx.fillStyle = pattern;
          ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);
          ctx.restore();
        }
      } else {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.fillRect(0, 0, w, h);
      }

      // -------------------------------------------------------------
      // 3. REALISTIC GROUT GRID LINES
      // -------------------------------------------------------------
      ctx.strokeStyle = groutColor || '#d4af37';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.70;

      const cols = Math.max(3, Math.round(roomWidth * 2.2));
      const rows = Math.max(3, Math.round(roomHeight * 2.2));

      for (let i = 1; i < cols; i++) {
        const t = i / cols;
        const botX = p0.x + (p1.x - p0.x) * t;
        const botY = p0.y + (p1.y - p0.y) * t;
        const topX = p3.x + (p2.x - p3.x) * t;
        const topY = p3.y + (p2.y - p3.y) * t;
        ctx.beginPath();
        ctx.moveTo(botX, botY);
        ctx.lineTo(topX, topY);
        ctx.stroke();
      }

      for (let j = 1; j < rows; j++) {
        const t = j / rows;
        const leftX = p0.x + (p3.x - p0.x) * t;
        const leftY = p0.y + (p3.y - p0.y) * t;
        const rightX = p1.x + (p2.x - p1.x) * t;
        const rightY = p1.y + (p2.y - p1.y) * t;
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 4. ELEGANT GOLD PERIMETER BORDER & SHADOW
      // -------------------------------------------------------------
      ctx.save();
      ctx.strokeStyle = '#d4af37';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 5. WATERMARK BADGE FOR SCREENSHOTS
      // -------------------------------------------------------------
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(14, 14, isMobile ? 180 : 260, 34, 10);
      ctx.fill();

      ctx.fillStyle = '#d4af37';
      ctx.font = `bold ${isMobile ? '11px' : '13px'} Outfit, system-ui, sans-serif`;
      ctx.fillText(`✨ SeramikBak | ${selectedProduct?.name || 'Odamda Canlı Gör'}`, 24, 36);
      ctx.restore();

      animId = requestAnimationFrame(renderVisualizer);
    };

    renderVisualizer();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    isOpen,
    surfaceType,
    layStyle,
    groutColor,
    tileScale,
    perspectiveTilt,
    activeTileTexture,
    roomWidth,
    roomHeight,
    capturedSnapshot,
    userPhotoBg,
    stream,
    isMobile,
    selectedProduct
  ]);

  // Submit Lead to API
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
          dealerId: assignedDealer?.id || currentDealer?.id || null,
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

  // WhatsApp Link Builder targeted to the Nearest Dealer
  const getWhatsAppShareUrl = () => {
    const dealerPhone = assignedDealer?.phone?.replace(/\D/g, '') || '905555555555';
    const text = encodeURIComponent(
      `Selamlar, SeramikBak Odamda Gör uygulamasında beğendiğim ürün için metraj ve fiyat teklifi almak istiyorum:\n\n` +
      `📦 *Seçtiğim Ürün:* ${selectedProduct?.name || 'Seramik Karo'} (${selectedProduct?.width || 60}x${selectedProduct?.height || 120} cm)\n` +
      `🏢 *Hedef Bayi:* ${assignedDealer?.name || 'Yetkili Bayi'} (${assignedDealer?.city || 'İstanbul'})\n` +
      `📐 *Uygulama Yüzeyi:* ${surfaceType === 'WALL' ? 'Duvar Kaplama' : 'Zemin Kaplama'}\n` +
      `📏 *Oda Ölçüsü:* En ${roomWidth}m x Boy ${roomHeight}m\n` +
      `📊 *Hesaplanan Net Metraj:* ${netAreaM2} m² (+%10 fire ile ${netWithWasteM2} m²)\n` +
      `📦 *Gerekli Kutu:* ${boxCount} Kutu\n` +
      `🧱 *Gerekli Sarfiyat:* ${adhesiveBags} Çuval Kalekim Yapıştırıcı + ${groutKg}kg Derz Dolgusu\n` +
      `💰 *Tahmini Malzeme Tutarı:* ${totalEstMaterialCost.toLocaleString('tr-TR')} ₺\n\n` +
      `Müşteri: ${clientName || 'İsimsiz Müşteri'} (${clientPhone || 'Telefon belirtilmedi'})\n` +
      `Bu ürünün bayi stok durumu ve nakliye/teslimat teklifinizi rica ederim.`
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
      {/* Top Header Navigation Bar */}
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 20px',
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
        {/* Left: Brand / Product Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
              color: '#000',
              padding: '5px 10px',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: isMobile ? '0.75rem' : '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={14} />
              <span>Odamda Canlı Gör</span>
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '0.88rem' : '0.98rem',
                fontWeight: '800',
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '180px' : '340px'
              }}>
                {selectedProduct?.name || 'Lüks Seramik Kaplama'}
              </h3>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {selectedProduct?.width || 60}x{selectedProduct?.height || 120} cm • {surfaceType === 'WALL' ? 'Duvar Modu' : 'Zemin Modu'}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Kapat"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.06)',
          padding: '3px',
          borderRadius: '10px',
          gap: '4px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '480px'
        }}>
          <button
            onClick={() => setActiveTab('VISUALIZER')}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'VISUALIZER' ? '#d4af37' : 'transparent',
              color: activeTab === 'VISUALIZER' ? '#000' : '#cbd5e1',
              fontWeight: '900',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Eye size={14} />
            <span>Odamda Gör</span>
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
              fontWeight: '900',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Calculator size={14} />
            <span>Metraj ({netAreaM2}m²)</span>
          </button>
          <button
            onClick={() => setActiveTab('QUOTE')}
            style={{
              flex: 1.2,
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'QUOTE' ? '#25D366' : 'transparent',
              color: activeTab === 'QUOTE' ? '#000' : '#cbd5e1',
              fontWeight: '900',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <MapPin size={14} />
            <span>En Yakın Bayi Teklifi</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* ================================================================= */}
        {/* TAB 1: INSTANT ROOM VISUALIZER (ODAMDA CANLI GÖR)                 */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: activeTab === 'VISUALIZER' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Hidden HTML5 Video Stream */}
          <video ref={videoRef} playsInline muted autoPlay style={{ display: 'none' }} />

          {/* Hidden File Input for Native Photo Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleNativePhotoUpload}
            style={{ display: 'none' }}
          />

          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Top Floating Control Capsule */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: 'calc(100% - 24px)',
            maxWidth: '540px'
          }}>
            {/* Freeze Frame Button */}
            {!capturedSnapshot ? (
              <button
                onClick={handleTakeSnapshot}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontWeight: '900',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                }}
              >
                <Camera size={15} />
                <span>📸 Fotoğrafı Dondur & Odana Döşe</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCapturedSnapshot(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Canlı Kameraya Dön</span>
                </button>
                <a
                  href={capturedSnapshot}
                  download={`seramikbak-oda-${Date.now()}.png`}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '7px 14px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
                  }}
                >
                  <Download size={14} />
                  <span>İndir</span>
                </a>
              </div>
            )}

            {/* Upload Room Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(15, 23, 42, 0.88)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '7px 14px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Upload size={14} />
              <span>Galeriden Fotoğraf Yükle</span>
            </button>
          </div>

          {/* Camera Permission / Fallback Information Banner */}
          {cameraError && !userPhotoBg && (
            <div style={{
              position: 'absolute',
              top: '74px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              width: 'calc(100% - 24px)',
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
                  🖼️ Galeriden Fotoğraf Yükle
                </button>
              </div>
            </div>
          )}

          {/* Bottom Floating Visualizer Tool Bar (Styles & Surface) */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '12px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '18px',
            padding: isMobile ? '10px 14px' : '14px 20px',
            width: 'calc(100% - 24px)',
            maxWidth: '560px',
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            boxSizing: 'border-box'
          }}>
            {/* Top row: Surface Type & Laying Styles */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              {/* Surface Toggle */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => setSurfaceType('WALL')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    border: 'none',
                    background: surfaceType === 'WALL' ? '#d4af37' : 'transparent',
                    color: surfaceType === 'WALL' ? '#000' : '#cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  🧱 Duvar
                </button>
                <button
                  onClick={() => setSurfaceType('FLOOR')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    border: 'none',
                    background: surfaceType === 'FLOOR' ? '#d4af37' : 'transparent',
                    color: surfaceType === 'FLOOR' ? '#000' : '#cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  🔲 Zemin
                </button>
              </div>

              {/* Laying Style Pills */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'straight', label: 'Düz' },
                  { id: 'diagonal', label: 'Çapraz' },
                  { id: 'herringbone', label: 'Balıksırtı' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setLayStyle(s.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: layStyle === s.id ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.06)',
                      border: layStyle === s.id ? '1px solid #d4af37' : '1px solid transparent',
                      color: layStyle === s.id ? '#d4af37' : '#cbd5e1',
                      fontWeight: '800',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Grout Color & Direct Metraj / Quote CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              {/* Grout Color Palette */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '800' }}>Derz:</span>
                {[
                  { color: '#d4af37', label: 'Altın' },
                  { color: '#ffffff', label: 'Beyaz' },
                  { color: '#cbd5e1', label: 'Gri' },
                  { color: '#334155', label: 'Antrasit' },
                  { color: '#e2d9c8', label: 'Bej' }
                ].map((g) => (
                  <button
                    key={g.color}
                    onClick={() => setGroutColor(g.color)}
                    title={g.label}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: g.color,
                      border: groutColor === g.color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
                      boxShadow: groutColor === g.color ? '0 0 8px ' + g.color : 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  />
                ))}
              </div>

              {/* Next Step Button */}
              <button
                onClick={() => setActiveTab('CALCULATOR')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>Metrajı Gör</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 2: VATANDAŞ İÇİN BASİT METRAJ & MALZEME HESABI                */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          display: activeTab === 'CALCULATOR' ? 'flex' : 'none',
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '12px' : '24px',
          overflowY: 'auto',
          gap: isMobile ? '14px' : '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Left Column: Dimensions, Presets & Cutouts */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Quick Sizing Presets */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px' : '18px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                <span>Hızlı Oda / Alan Şablonları</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: '🚿 Küçük Banyo / WC', w: 1.8, h: 2.2, m2: '4.0 m²' },
                  { label: '🛁 Standart Banyo', w: 2.4, h: 2.6, m2: '6.2 m²' },
                  { label: '👑 Ebeveyn Banyosu', w: 3.2, h: 2.8, m2: '9.0 m²' },
                  { label: '🍳 Mutfak Tezgah Arası', w: 3.0, h: 0.6, m2: '1.8 m²' },
                  { label: '🌿 Balkon / Teras', w: 2.0, h: 4.0, m2: '8.0 m²' },
                  { label: '🏛️ Salon / Antre', w: 4.0, h: 5.0, m2: '20.0 m²' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyRoomPreset(preset.w, preset.h)}
                    style={{
                      background: roomWidth === preset.w && roomHeight === preset.h ? 'rgba(212, 175, 55, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                      border: roomWidth === preset.w && roomHeight === preset.h ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff' }}>{preset.label}</span>
                    <span style={{ fontSize: '0.68rem', color: '#d4af37' }}>{preset.m2}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom En x Boy Inputs */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px' : '18px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={16} color="#10b981" />
                <span>Oda Boyutlarınız (Manuel Giriş)</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                      fontWeight: '700',
                      boxSizing: 'border-box'
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
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                Brüt Yüzey Alanı: <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
              </div>
            </div>

            {/* Cutout Subtractions Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px' : '18px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} />
                    <span>Düşülecek Boşluklar (Kapı / Pencere)</span>
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Seramik döşenmeyecek alanları düşerek tasarruf edin</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => addCutout('Kapı')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🚪 Kapı
                  </button>
                  <button
                    onClick={() => addCutout('Pencere')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🪟 Pencere
                  </button>
                  <button
                    onClick={() => addCutout('Duşakabin')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🚿 Duşakabin
                  </button>
                </div>
              </div>

              {cutouts.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>
                  Henüz düşülen boşluk yok. Yukarıdaki butonlarla kapı veya pencere ekleyebilirsiniz.
                </p>
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
                            setCutouts(cutouts.map((c) => c.id === item.id ? { ...c, w: val } : c));
                          }}
                          style={{ width: '52px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.h}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map((c) => c.id === item.id ? { ...c, h: val } : c));
                          }}
                          style={{ width: '52px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m =</span>
                        <strong style={{ color: '#f87171', fontSize: '0.82rem' }}>{(item.w * item.h).toFixed(2)} m²</strong>
                      </div>
                      <button
                        onClick={() => removeCutout(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Citizen Material & Cost Summary */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid #d4af37',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '22px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#d4af37', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span>Net Malzeme ve Maliyet Dökümü</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Brüt Alan:</span>
                  <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#f87171' }}>Düşülen Boşluklar:</span>
                  <strong style={{ color: '#f87171' }}>- {cutoutAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>Net Kaplama Alanı:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{netAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Gerekli Seramik (+%10 Fire Dahil):</span>
                  <strong style={{ color: '#d4af37' }}>{netWithWasteM2} m² ({boxCount} Kutu)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Kalekim Yapıştırıcı (25kg Çuval):</span>
                  <strong style={{ color: '#fff' }}>{adhesiveBags} Çuval</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Derz Dolgusu:</span>
                  <strong style={{ color: '#fff' }}>{groutKg} kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Tahmini Usta İşçiliği (~350 TL/m²):</span>
                  <strong style={{ color: '#94a3b8' }}>~{estLaborCost.toLocaleString('tr-TR')} ₺</strong>
                </div>

                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Tahmini Toplam Malzeme</span>
                    <strong style={{ fontSize: '1.25rem', color: '#d4af37', fontWeight: '900' }}>
                      {totalEstMaterialCost.toLocaleString('tr-TR')} ₺
                    </strong>
                  </div>
                  <button
                    onClick={() => setActiveTab('QUOTE')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>Bayiden Teklif Al</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 3: EN YAKIN BAYİ & WHATSAPP TEKLİF AL                         */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          display: activeTab === 'QUOTE' ? 'flex' : 'none',
          padding: isMobile ? '14px' : '28px',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #10b981',
            borderRadius: '20px',
            padding: isMobile ? '18px' : '28px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            {!submitSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <Store size={28} style={{ color: '#10b981' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#fff', fontWeight: '900' }}>
                      En Yakın Yetkili Bayiden Teklif Alın
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Seçtiğiniz seramiği bulunduran en yakın yetkili bayi eşleştirildi
                    </span>
                  </div>
                </div>

                {/* Nearest Matched Dealer Card */}
                {assignedDealer && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    border: '1px solid #10b981',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        <span>EŞLEŞEN EN YAKIN BAYİ</span>
                      </span>
                      {assignedDealer.distanceKm && (
                        <span style={{ fontSize: '0.75rem', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                          📍 {assignedDealer.distanceKm} km mesafede
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#fff' }}>
                      {assignedDealer.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {assignedDealer.address || `${assignedDealer.district}, ${assignedDealer.city}`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: '700', marginTop: '2px' }}>
                      ✅ Bu seramik bu bayinin yetkili stoğunda / teşhirinde mevcuttur
                    </div>
                  </div>
                )}

                {/* Alternate Nearby Dealers Picker if available */}
                {nearbyDealers.length > 1 && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Farklı bir yetkili bayiden teklif almak isterseniz seçin:
                    </label>
                    <select
                      value={assignedDealer?.id || ''}
                      onChange={(e) => {
                        const d = nearbyDealers.find((item) => item.id === e.target.value);
                        if (d) setAssignedDealer(d);
                      }}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    >
                      {nearbyDealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.district}, {d.city} - {d.distanceKm} km)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scanned Material Summary Box */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  marginBottom: '14px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ color: '#10b981', fontWeight: '800', marginBottom: '4px' }}>Bayiye Gönderilecek Metraj Bilgisi:</div>
                  <div style={{ color: '#fff' }}>• Ürün: {selectedProduct?.name || 'Seramik Karo'}</div>
                  <div style={{ color: '#fff' }}>• Net Kaplama Alanı: {netAreaM2} m² (+%10 fire dahil {netWithWasteM2} m²)</div>
                  <div style={{ color: '#fff' }}>• Kutu Sayısı: {boxCount} Kutu | Yapıştırıcı: {adhesiveBags} Çuval | Derz: {groutKg} kg</div>
                  <div style={{ color: '#34d399', fontWeight: '800', marginTop: '2px' }}>• Tahmini Malzeme Tutarı: ~{totalEstMaterialCost.toLocaleString('tr-TR')} ₺</div>
                </div>

                {/* Client Contact Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Adınız Soyadınız *</label>
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Özel Notunuz / Adresiniz</label>
                    <textarea
                      rows="2"
                      placeholder="Örn: Dairem Kadıköy'de, usta montaj hizmeti de dahil fiyat almak istiyorum..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Direct Quote Action Buttons */}
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
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(37,211,102,0.4)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp ile {assignedDealer?.name || 'En Yakın Bayi'}ye Gönder</span>
                  </a>

                  <button
                    onClick={handleSaveLead}
                    disabled={isSubmitting}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      padding: '11px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Kaydediliyor...' : 'Teklifi Sisteme Kaydet & Bayiye İlet'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff' }}>Ölçüm Talebiniz Bayiye İletildi!</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
                  {netAreaM2} m² net kaplama alanınız ve malzeme listeniz <strong>{assignedDealer?.name}</strong> bayisine doğrudan ulaştırıldı. En kısa sürede sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    background: '#10b981',
                    color: '#fff',
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
