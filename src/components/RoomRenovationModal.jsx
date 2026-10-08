'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  RotateCcw, 
  Download, 
  Send, 
  X, 
  Check, 
  Eye, 
  Layers, 
  RefreshCw, 
  Paintbrush, 
  Eraser,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { resolveSafeTextureUrl } from '../utils/renovationUtils';

// Curated high-resolution architectural room presets with optimal lighting
const QUICK_ROOM_PRESETS = [
  {
    id: 'easy_bathroom',
    name: 'Modern Ferah Banyo',
    url: '/hero/easy_bathroom.jpg',
    category: 'Banyo'
  },
  {
    id: 'easy_kitchen',
    name: 'Modern Ada Mutfak',
    url: '/hero/easy_kitchen.jpg',
    category: 'Mutfak'
  },
  {
    id: 'modern_living',
    name: 'Çağdaş Ferah Salon',
    url: '/hero/modern_living.png',
    category: 'Salon'
  }
];

export default function RoomRenovationModal({ 
  isOpen, 
  onClose, 
  product, 
  relatedProducts = [], 
  onOpenQuote 
}) {
  // Active product details
  const [currentProduct, setCurrentProduct] = useState(product);

  // Workflow Step: 1 = Upload, 2 = Configure & Detect, 3 = Refine Mask, 4 = Result
  const [currentStep, setCurrentStep] = useState(1);

  // Room Image State
  const [selectedPreset, setSelectedPreset] = useState(QUICK_ROOM_PRESETS[0].id);
  const [roomUrl, setRoomUrl] = useState(QUICK_ROOM_PRESETS[0].url);
  const [roomFile, setRoomFile] = useState(null);
  const [roomImageEl, setRoomImageEl] = useState(null);

  // Tile Texture State
  const initialTexture = resolveSafeTextureUrl(
    product?.textureUrl || product?.imageUrl || '/textures/calacatta_gold.jpg'
  );
  const [tileUrl, setTileUrl] = useState(initialTexture);
  const [tileFile, setTileFile] = useState(null);

  // Surface & Pattern Options (Step 2)
  const [surface, setSurface] = useState('floor'); // 'floor' | 'wall' | 'both'
  const [pattern, setPattern] = useState('grid');   // 'grid' | 'brick'
  const [tileScale, setTileScale] = useState(1.0);

  // AI Segmentation & Mask Editor State (Step 3)
  const [maskB64Original, setMaskB64Original] = useState(null);
  const [brushMode, setBrushMode] = useState('paint'); // 'paint' | 'erase'
  const [brushSize, setBrushSize] = useState(25);

  // Render Result & Comparison (Step 4)
  const [resultUrl, setResultUrl] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('İşleniyor...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // DOM & Canvas Refs
  const roomInputRef = useRef(null);
  const tileInputRef = useRef(null);
  const editorCanvasRef = useRef(null);
  const compContainerRef = useRef(null);

  // Offscreen canvas layers for smooth mask brushing
  const offscreenLayersRef = useRef({
    maskCanvas: null,
    maskCtx: null,
    colorCanvas: null,
    colorCtx: null,
    maskImage: null,
    isDrawing: false,
    lastPos: null
  });

  // Check Python SegFormer microservice health on mount
  useEffect(() => {
    fetch('/api/ai/python-visualizer')
      .then(res => res.json())
      .then(data => {
        setIsBackendOnline(Boolean(data?.online));
      })
      .catch(() => setIsBackendOnline(false));
  }, []);

  // Sync when product prop changes
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
      const tex = resolveSafeTextureUrl(product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg');
      setTileUrl(tex);
      setTileFile(null);

      // Auto-adapt scale for grand format slabs vs small tiles
      const w = Number(product.width) || 60;
      const h = Number(product.height) || 120;
      if (w >= 120 || h >= 120) {
        setTileScale(1.4);
      } else if (w <= 30 && h <= 30) {
        setTileScale(0.7);
      } else {
        setTileScale(1.0);
      }
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Helper: Load HTMLImageElement
  const loadImageElement = useCallback((src) => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Window not available'));
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.src = src;
    });
  }, []);

  // Handle Preset Room Selection
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setRoomUrl(preset.url);
    setRoomFile(null);
    setMaskB64Original(null);
    setResultUrl(null);
    setCurrentStep(2);
  };

  // Handle Room Photo File Upload
  const handleRoomFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir görsel formatı (JPG, PNG, WebP) yükleyin.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setRoomFile(file);
    setRoomUrl(objectUrl);
    setSelectedPreset(null);
    setMaskB64Original(null);
    setResultUrl(null);
    setCurrentStep(2);
    setSuccessMessage('Mekân fotoğrafı başarıyla yüklendi.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Handle Custom Tile Texture Upload
  const handleTileFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir seramik doku görseli yükleyin.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setTileFile(file);
    setTileUrl(objectUrl);
    setSuccessMessage('Özel seramik dokusu seçildi.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Convert File / Blob to Base64
  const fileToBase64 = (fileOrBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });
  };

  // -------------------------------------------------------------------------
  // Step 2: Surface Detection via SegFormer AI
  // -------------------------------------------------------------------------
  const handleDetectSurface = async () => {
    if (!roomUrl) {
      setErrorMessage('Lütfen önce bir mekân görseli seçin veya yükleyin.');
      return;
    }

    setIsLoading(true);
    setLoadingText(
      surface === 'wall' ? 'AI ile duvar yüzeyleri tespit ediliyor...' :
      surface === 'both' ? 'AI ile zemin ve duvar yüzeyleri tespit ediliyor...' :
      'AI ile zemin yüzeyi tespit ediliyor...'
    );
    setErrorMessage(null);

    try {
      let roomPayload = roomUrl;
      if (roomFile) {
        roomPayload = await fileToBase64(roomFile);
      }

      const res = await fetch('/api/ai/python-visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'segment',
          room_image: roomPayload,
          surface: surface
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Segmentasyon işlemi gerçekleştirilemedi.');
      }

      setMaskB64Original(data.mask);
      setCurrentStep(3);

      // Initialize mask canvas editor
      await initMaskEditor(roomPayload, data.mask);
      setSuccessMessage('Yüzey sınırları yapay zekâ ile milimetrik tespit edildi!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('[RoomRenovationModal] Segmentation error:', err);
      setErrorMessage(err.message || 'Yüzey tespiti sırasında hata oluştu. Lütfen Python AI servisini kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step 3: Interactive Canvas Mask Editor Setup & Operations
  // -------------------------------------------------------------------------
  const initMaskEditor = async (roomSrc, maskB64) => {
    try {
      const roomImg = await loadImageElement(roomSrc);
      setRoomImageEl(roomImg);

      const canvas = editorCanvasRef.current;
      if (!canvas) return;

      const w = roomImg.naturalWidth || roomImg.width;
      const h = roomImg.naturalHeight || roomImg.height;

      canvas.width = w;
      canvas.height = h;

      // Offscreen Mask Layer
      let { maskCanvas, maskCtx, colorCanvas, colorCtx } = offscreenLayersRef.current;
      if (!maskCanvas) {
        maskCanvas = document.createElement('canvas');
        maskCtx = maskCanvas.getContext('2d');
      }
      maskCanvas.width = w;
      maskCanvas.height = h;

      // Offscreen Tint Layer
      if (!colorCanvas) {
        colorCanvas = document.createElement('canvas');
        colorCtx = colorCanvas.getContext('2d');
      }
      colorCanvas.width = w;
      colorCanvas.height = h;

      const maskImg = await loadImageElement('data:image/png;base64,' + maskB64);
      maskCtx.clearRect(0, 0, w, h);
      maskCtx.drawImage(maskImg, 0, 0, w, h);

      offscreenLayersRef.current = {
        maskCanvas,
        maskCtx,
        colorCanvas,
        colorCtx,
        maskImage: maskImg,
        isDrawing: false,
        lastPos: null
      };

      renderCompositeView(roomImg, canvas, maskCanvas, colorCanvas, colorCtx);
    } catch (e) {
      console.error('[RoomRenovationModal] Mask editor init error:', e);
    }
  };

  const renderCompositeView = (roomImg, canvas, maskCanvas, colorCanvas, colorCtx) => {
    if (!canvas || !roomImg || !maskCanvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw base room photograph
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(roomImg, 0, 0, w, h);

    // Colorize mask with radiant purple overlay
    colorCtx.clearRect(0, 0, w, h);
    colorCtx.drawImage(maskCanvas, 0, 0);
    colorCtx.globalCompositeOperation = 'source-in';
    colorCtx.fillStyle = 'rgba(168, 85, 247, 1)';
    colorCtx.fillRect(0, 0, w, h);
    colorCtx.globalCompositeOperation = 'source-over';

    // Blend mask over room image with semi-transparency
    ctx.globalAlpha = 0.42;
    ctx.drawImage(colorCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
  };

  // Canvas Coordinate Mapping
  const getCanvasCoords = (e) => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawBrushStroke = (x, y) => {
    const { maskCanvas, maskCtx } = offscreenLayersRef.current;
    const canvas = editorCanvasRef.current;
    if (!maskCanvas || !maskCtx || !canvas) return;

    const scale = canvas.width / canvas.getBoundingClientRect().width;
    const r = brushSize * scale;

    maskCtx.beginPath();
    maskCtx.arc(x, y, r, 0, Math.PI * 2);
    if (brushMode === 'paint') {
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fill();
    } else {
      maskCtx.save();
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fill();
      maskCtx.restore();
    }
  };

  const drawInterpolatedLine = (from, to) => {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawBrushStroke(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    offscreenLayersRef.current.isDrawing = true;
    const pos = getCanvasCoords(e);
    drawBrushStroke(pos.x, pos.y);
    offscreenLayersRef.current.lastPos = pos;
    const { maskCanvas, colorCanvas, colorCtx } = offscreenLayersRef.current;
    renderCompositeView(roomImageEl, editorCanvasRef.current, maskCanvas, colorCanvas, colorCtx);
  };

  const handlePointerMove = (e) => {
    if (!offscreenLayersRef.current.isDrawing) return;
    e.preventDefault();
    const pos = getCanvasCoords(e);
    drawInterpolatedLine(offscreenLayersRef.current.lastPos, pos);
    offscreenLayersRef.current.lastPos = pos;
    const { maskCanvas, colorCanvas, colorCtx } = offscreenLayersRef.current;
    renderCompositeView(roomImageEl, editorCanvasRef.current, maskCanvas, colorCanvas, colorCtx);
  };

  const handlePointerUp = () => {
    offscreenLayersRef.current.isDrawing = false;
    offscreenLayersRef.current.lastPos = null;
  };

  // Reset Mask to AI Original
  const handleResetMask = () => {
    const { maskCanvas, maskCtx, maskImage, colorCanvas, colorCtx } = offscreenLayersRef.current;
    if (!maskCanvas || !maskCtx || !maskImage) return;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);
    renderCompositeView(roomImageEl, editorCanvasRef.current, maskCanvas, colorCanvas, colorCtx);
    setSuccessMessage('Maske yapay zekâ orijinal haline sıfırlandı.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Binarize Mask for Server Transmission
  const getBinarizedMaskBase64 = () => {
    const { maskCanvas, maskCtx } = offscreenLayersRef.current;
    if (!maskCanvas || !maskCtx) return maskB64Original;

    const w = maskCanvas.width;
    const h = maskCanvas.height;
    const imgData = maskCtx.getImageData(0, 0, w, h);
    const px = imgData.data;

    const binCanvas = document.createElement('canvas');
    binCanvas.width = w;
    binCanvas.height = h;
    const binCtx = binCanvas.getContext('2d');
    const binData = binCtx.createImageData(w, h);
    const out = binData.data;

    for (let i = 0; i < px.length; i += 4) {
      const brightness = (px[i] + px[i + 1] + px[i + 2]) / 3;
      const val = (px[i + 3] > 50 && brightness > 50) ? 255 : 0;
      out[i] = val;
      out[i + 1] = val;
      out[i + 2] = val;
      out[i + 3] = 255;
    }

    binCtx.putImageData(binData, 0, 0);
    return binCanvas.toDataURL('image/png').split(',')[1];
  };

  // -------------------------------------------------------------------------
  // Step 3 → Step 4: Apply Tiles via Perspective & Lighting Engine
  // -------------------------------------------------------------------------
  const handleApplyTiles = async () => {
    if (!roomUrl || !tileUrl) {
      setErrorMessage('Mekân ve seramik dokusu eksik.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Seramik dokusu perspektif, homografi ve doğal ışık dengesiyle işleniyor...');
    setErrorMessage(null);

    try {
      let roomPayload = roomUrl;
      if (roomFile) {
        roomPayload = await fileToBase64(roomFile);
      }

      let tilePayload = tileUrl;
      if (tileFile) {
        tilePayload = await fileToBase64(tileFile);
      }

      const activeMask = getBinarizedMaskBase64();

      const res = await fetch('/api/ai/python-visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          room_image: roomPayload,
          tile_image: tilePayload,
          mask: activeMask,
          pattern: pattern,
          tile_scale: tileScale,
          surface: surface
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Seramik kaplama işlemi tamamlanamadı.');
      }

      setResultUrl(data.renderedImage);
      setCurrentStep(4);
      setSuccessMessage('Render tamamlandı! Karşılaştırma kaydırıcısıyla sonucu inceleyin.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('[RoomRenovationModal] Apply error:', err);
      setErrorMessage(err.message || 'Görselleştirme sırasında hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step 4: Before / After Comparison Slider Interaction
  // -------------------------------------------------------------------------
  const handleSliderMove = useCallback((clientX) => {
    const container = compContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerSliderDown = (e) => {
    setIsDraggingSlider(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleSliderMove(clientX);
  };

  useEffect(() => {
    if (!isDraggingSlider) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleSliderMove(clientX);
    };

    const onUp = () => setIsDraggingSlider(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Download High-Res Result
  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const safeName = (currentProduct?.name || 'seramikbak').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `seramikbak_${safeName}_mekan_render.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Request Quote Integration
  const handleRequestQuote = () => {
    if (onOpenQuote) {
      onOpenQuote(currentProduct, resultUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sb-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sb-modal-container" role="dialog" aria-modal="true">
        
        {/* ==================== HEADER ==================== */}
        <div className="sb-modal-header">
          <div className="sb-header-left">
            <div className="sb-brand-chip">
              <Sparkles size={14} className="sb-gold-icon" />
              <span>AI MEKÂNINDA GÖR & DENE</span>
              <span className="sb-version-pill">SegFormer B3</span>
            </div>
            <h2 className="sb-modal-heading">
              {currentProduct?.name || 'Mekânınızda Seramik Görselleştirme'}
            </h2>
            <p className="sb-modal-desc">
              Orijinal fotoğrafınızı koruyarak seramik dokusunu doğal derinlik, perspektif ve ışık uyumuyla uygulayın.
            </p>
          </div>

          <div className="sb-header-right">
            {/* Active Tile Mini Info Card */}
            {currentProduct && (
              <div className="sb-active-tile-card">
                <div className="sb-tile-thumb-wrap">
                  <img 
                    src={tileUrl} 
                    alt={currentProduct.name} 
                    className="sb-tile-thumb"
                  />
                </div>
                <div className="sb-tile-meta">
                  <span className="sb-tile-brand">{currentProduct.brand || 'SeramikBak'}</span>
                  <span className="sb-tile-name">{currentProduct.name}</span>
                  <span className="sb-tile-dimensions">
                    {currentProduct.width || 60} × {currentProduct.height || 120} cm
                    {currentProduct.finish && ` • ${currentProduct.finish}`}
                  </span>
                </div>
              </div>
            )}

            <button 
              className="sb-close-btn" 
              onClick={onClose} 
              aria-label="Kapat"
              title="Kapat (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ==================== STEP PROGRESS BAR ==================== */}
        <div className="sb-steps-bar">
          <button 
            className={`sb-step-tab ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="sb-step-num">1</span>
            <span className="sb-step-text">Görseller</span>
          </button>
          <div className="sb-step-line" />

          <button 
            className={`sb-step-tab ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}
            onClick={() => { if (roomUrl) setCurrentStep(2); }}
            disabled={!roomUrl}
          >
            <span className="sb-step-num">2</span>
            <span className="sb-step-text">Yüzey & Desen</span>
          </button>
          <div className="sb-step-line" />

          <button 
            className={`sb-step-tab ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}
            onClick={() => { if (maskB64Original) setCurrentStep(3); }}
            disabled={!maskB64Original}
          >
            <span className="sb-step-num">3</span>
            <span className="sb-step-text">Maske İnce Ayarı</span>
          </button>
          <div className="sb-step-line" />

          <button 
            className={`sb-step-tab ${currentStep >= 4 ? 'active' : ''} ${currentStep === 4 ? 'current' : ''}`}
            onClick={() => { if (resultUrl) setCurrentStep(4); }}
            disabled={!resultUrl}
          >
            <span className="sb-step-num">4</span>
            <span className="sb-step-text">Sonuç & Karşılaştır</span>
          </button>
        </div>

        {/* ==================== TOAST MESSAGES ==================== */}
        {errorMessage && (
          <div className="sb-alert sb-alert-error">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="sb-alert-close">×</button>
          </div>
        )}
        {successMessage && (
          <div className="sb-alert sb-alert-success">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ==================== MAIN WORKFLOW BODY ==================== */}
        <div className="sb-modal-body">

          {/* ---------------- STEP 1: UPLOAD & PRESETS ---------------- */}
          {currentStep === 1 && (
            <div className="sb-step-content fade-in">
              <div className="sb-step-header-row">
                <h3 className="sb-step-title">
                  <Camera size={18} className="sb-gold-icon" />
                  Mekân Fotoğrafınızı Seçin veya Yükleyin
                </h3>
                <span className="sb-step-desc">
                  Kendi banyo, mutfak veya salon fotoğrafınızı yükleyebilir veya mimari test şablonlarımızdan birini seçebilirsiniz.
                </span>
              </div>

              {/* Room Presets Grid */}
              <div className="sb-presets-grid">
                {QUICK_ROOM_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className={`sb-preset-card ${selectedPreset === preset.id ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div className="sb-preset-img-wrap">
                      <img src={preset.url} alt={preset.name} className="sb-preset-img" />
                      <span className="sb-preset-badge">{preset.category}</span>
                    </div>
                    <div className="sb-preset-info">
                      <span className="sb-preset-name">{preset.name}</span>
                      <span className="sb-preset-action">Seç ve İlerle →</span>
                    </div>
                  </div>
                ))}

                {/* Custom Photo Upload Card */}
                <div 
                  className={`sb-preset-card sb-upload-card ${roomFile ? 'active' : ''}`}
                  onClick={() => roomInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={roomInputRef} 
                    onChange={handleRoomFileUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div className="sb-upload-zone-inner">
                    <Upload size={32} className="sb-gold-icon" />
                    <span className="sb-upload-title">Kendi Mekânınızı Yükleyin</span>
                    <span className="sb-upload-sub">JPG, PNG veya WebP • Maks. 25MB</span>
                    <button type="button" className="sb-btn-upload">Fotoğraf Seç</button>
                  </div>
                </div>
              </div>

              {/* Tile Selection / Upload Section */}
              <div className="sb-tile-selector-bar">
                <div className="sb-tile-selector-left">
                  <span className="sb-tile-selector-title">Kullanılacak Seramik Dokusu:</span>
                  <div className="sb-selected-tile-pill">
                    <img src={tileUrl} alt="Seçili Seramik" className="sb-pill-thumb" />
                    <span>{currentProduct?.name || 'Seçili Seramik'}</span>
                  </div>
                </div>

                <div className="sb-tile-selector-right">
                  <input 
                    type="file" 
                    ref={tileInputRef} 
                    onChange={handleTileFileUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <button 
                    type="button" 
                    className="sb-btn-ghost"
                    onClick={() => tileInputRef.current?.click()}
                  >
                    Farklı Seramik Yükle
                  </button>

                  <button 
                    type="button" 
                    className="sb-btn-primary"
                    onClick={() => setCurrentStep(2)}
                  >
                    Devam Et (Yüzey Ayarları) →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- STEP 2: CONFIGURE & DETECT ---------------- */}
          {currentStep === 2 && (
            <div className="sb-step-content fade-in">
              <div className="sb-step-header-row">
                <h3 className="sb-step-title">
                  <Sliders size={18} className="sb-gold-icon" />
                  Yüzey ve Döşeme Parametrelerini Belirleyin
                </h3>
                <span className="sb-step-desc">
                  Seramiğin uygulanacağı yüzeyi (zemin / duvar), derz desenini ve plaka ölçeğini ayarlayın.
                </span>
              </div>

              <div className="sb-config-grid">
                {/* Preview Box */}
                <div className="sb-preview-box">
                  <div className="sb-preview-header">
                    <span>Mekân Önizleme</span>
                    {selectedPreset && <span className="sb-preset-tag">Hazır Şablon</span>}
                    {roomFile && <span className="sb-preset-tag">Yüklenen Fotoğraf</span>}
                  </div>
                  <div className="sb-preview-media">
                    <img src={roomUrl} alt="Mekân" className="sb-preview-img" />
                  </div>
                </div>

                {/* Configuration Controls */}
                <div className="sb-controls-panel">
                  {/* Target Surface */}
                  <div className="sb-control-group">
                    <label className="sb-label">Uygulanacak Yüzey</label>
                    <div className="sb-surface-btn-group">
                      <button 
                        type="button"
                        className={`sb-surface-btn ${surface === 'floor' ? 'active' : ''}`}
                        onClick={() => setSurface('floor')}
                      >
                        🏠 Zemin (Floor)
                      </button>
                      <button 
                        type="button"
                        className={`sb-surface-btn ${surface === 'wall' ? 'active' : ''}`}
                        onClick={() => setSurface('wall')}
                      >
                        🧱 Duvar (Wall)
                      </button>
                      <button 
                        type="button"
                        className={`sb-surface-btn ${surface === 'both' ? 'active' : ''}`}
                        onClick={() => setSurface('both')}
                      >
                        🔲 Her İkisi (Zemin + Duvar)
                      </button>
                    </div>
                  </div>

                  {/* Tile Pattern */}
                  <div className="sb-control-group">
                    <label className="sb-label">Döşeme Deseni</label>
                    <div className="sb-pattern-btn-group">
                      <button 
                        type="button"
                        className={`sb-pattern-btn ${pattern === 'grid' ? 'active' : ''}`}
                        onClick={() => setPattern('grid')}
                      >
                        Standart Izgara (Grid)
                      </button>
                      <button 
                        type="button"
                        className={`sb-pattern-btn ${pattern === 'brick' ? 'active' : ''}`}
                        onClick={() => setPattern('brick')}
                      >
                        Şaşırtmalı / Tuğla (Brick)
                      </button>
                    </div>
                  </div>

                  {/* Tile Scale */}
                  <div className="sb-control-group">
                    <div className="sb-label-row">
                      <label className="sb-label">Karo Ölçeği</label>
                      <span className="sb-val-badge">{tileScale.toFixed(1)}×</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.3" 
                      max="3.0" 
                      step="0.1" 
                      value={tileScale}
                      onChange={(e) => setTileScale(parseFloat(e.target.value))}
                      className="sb-range-slider"
                    />
                    <div className="sb-scale-hints">
                      <span>Daha Küçük Karolar</span>
                      <span>Büyük Plakalar</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="sb-action-box">
                    <button 
                      type="button"
                      className="sb-btn-primary sb-btn-large"
                      onClick={handleDetectSurface}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={18} className="sb-spin" />
                          <span>{loadingText}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          <span>
                            {surface === 'wall' ? 'Duvarı Algıla (AI)' :
                             surface === 'both' ? 'Zemin ve Duvarı Algıla (AI)' :
                             'Zemini Algıla (AI SegFormer)'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- STEP 3: MASK BRUSH EDITOR ---------------- */}
          {currentStep === 3 && (
            <div className="sb-step-content fade-in">
              <div className="sb-step-header-row">
                <h3 className="sb-step-title">
                  <Paintbrush size={18} className="sb-gold-icon" />
                  Yapay Zekâ Maskesini İnce Ayarlayın
                </h3>
                <span className="sb-step-desc">
                  Tespit edilen yüzey mor renkle vurgulanmıştır. Fırça ile istediğiniz alanları ekleyebilir veya mobilya, lavabo gibi alanları silebilirsiniz.
                </span>
              </div>

              {/* Editor Toolbar */}
              <div className="sb-editor-toolbar">
                <div className="sb-toolbar-left">
                  <button 
                    type="button"
                    className={`sb-tool-btn ${brushMode === 'paint' ? 'active' : ''}`}
                    onClick={() => setBrushMode('paint')}
                  >
                    <Paintbrush size={16} />
                    <span>Boya (Ekle)</span>
                  </button>

                  <button 
                    type="button"
                    className={`sb-tool-btn ${brushMode === 'erase' ? 'active' : ''}`}
                    onClick={() => setBrushMode('erase')}
                  >
                    <Eraser size={16} />
                    <span>Sil (Çıkar)</span>
                  </button>

                  <button 
                    type="button"
                    className="sb-tool-btn"
                    onClick={handleResetMask}
                    title="AI orijinal maskesine dön"
                  >
                    <RotateCcw size={16} />
                    <span>Sıfırla</span>
                  </button>
                </div>

                <div className="sb-toolbar-right">
                  <div className="sb-brush-slider-wrap">
                    <span className="sb-brush-label">Fırça Boyutu:</span>
                    <input 
                      type="range" 
                      min="5" 
                      max="80" 
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                      className="sb-range-slider sb-range-compact"
                    />
                    <span className="sb-val-badge">{brushSize}px</span>
                  </div>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="sb-canvas-viewport">
                <canvas 
                  ref={editorCanvasRef} 
                  className="sb-editor-canvas"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                />
              </div>

              {/* Apply Action Bar */}
              <div className="sb-editor-action-bar">
                <button 
                  type="button"
                  className="sb-btn-ghost"
                  onClick={() => setCurrentStep(2)}
                >
                  ← Ayarlara Dön
                </button>

                <button 
                  type="button"
                  className="sb-btn-success sb-btn-large"
                  onClick={handleApplyTiles}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="sb-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Seramiği Uygula & Gerçekçi Render Al →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ---------------- STEP 4: RESULT & COMPARISON ---------------- */}
          {currentStep === 4 && resultUrl && (
            <div className="sb-step-content fade-in">
              <div className="sb-step-header-row">
                <h3 className="sb-step-title">
                  <Eye size={18} className="sb-gold-icon" />
                  Mekânında Görselleştirme Sonucu
                </h3>
                <span className="sb-step-desc">
                  Ortadaki kaydırıcıyı sağa-sola sürükleyerek orijinal mekân ile yeni seramik döşenmiş halini karşılaştırın.
                </span>
              </div>

              {/* Before / After Split Slider Stage */}
              <div 
                className="sb-comparison-stage" 
                ref={compContainerRef}
                onMouseDown={handlePointerSliderDown}
                onTouchStart={handlePointerSliderDown}
              >
                {/* Badges */}
                <div className="sb-comp-badge sb-comp-badge-left">ORİJİNAL MEKÂN</div>
                <div className="sb-comp-badge sb-comp-badge-right">YENİ SERAMİK DÖŞEMESİ</div>

                {/* Layer 1: Rendered Tile Result (Full background) */}
                <img 
                  src={resultUrl} 
                  alt="Döşenmiş Sonuç" 
                  className="sb-comp-img sb-comp-result"
                />

                {/* Layer 2: Original Room (Clipped) */}
                <div 
                  className="sb-comp-clip-wrap"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img 
                    src={roomUrl} 
                    alt="Orijinal Mekân" 
                    className="sb-comp-img sb-comp-orig"
                  />
                </div>

                {/* Draggable Divider Handle */}
                <div 
                  className="sb-comp-divider"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="sb-divider-grip">
                    <span className="sb-grip-arrows">‹ ›</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sb-result-actions">
                <div className="sb-result-actions-left">
                  <button 
                    type="button" 
                    className="sb-btn-ghost"
                    onClick={() => setCurrentStep(3)}
                  >
                    ← Maskeyi Yeniden Düzenle
                  </button>
                  <button 
                    type="button" 
                    className="sb-btn-ghost"
                    onClick={() => setCurrentStep(1)}
                  >
                    Başka Mekân veya Seramik Dene
                  </button>
                </div>

                <div className="sb-result-actions-right">
                  <button 
                    type="button" 
                    className="sb-btn-primary"
                    onClick={handleDownload}
                  >
                    <Download size={16} />
                    <span>Yüksek Çözünürlüklü İndir</span>
                  </button>

                  <button 
                    type="button" 
                    className="sb-btn-gold"
                    onClick={handleRequestQuote}
                  >
                    <Send size={16} />
                    <span>Bu Seramik İçin Teklif Al</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="sb-modal-footer">
          <div className="sb-footer-info">
            <ShieldCheck size={14} className="sb-gold-icon" />
            <span>
              Piksel düzeyinde homografi, SegFormer AI segmentasyon ve doğal ışık dengesi kullanılarak üretilmiştir.
            </span>
          </div>

          <div className="sb-footer-actions">
            <button className="sb-btn-ghost sb-btn-compact" onClick={onClose}>
              Pencereyi Kapat
            </button>
          </div>
        </div>

      </div>

      {/* ==================== LUXURY STYLES ==================== */}
      <style jsx>{`
        .sb-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(4, 7, 12, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: sbFadeIn 0.25s ease-out;
        }

        .sb-modal-container {
          background: linear-gradient(160deg, #0e1422 0%, #080c16 100%);
          border: 1px solid rgba(212, 175, 55, 0.28);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.08);
          border-radius: 18px;
          width: 100%;
          max-width: 1200px;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #f1f5f9;
        }

        /* Header */
        .sb-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(14, 20, 34, 0.6);
        }

        .sb-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sb-brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #d4af37;
          text-transform: uppercase;
        }

        .sb-version-pill {
          background: rgba(212, 175, 55, 0.15);
          color: #f3d375;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 0.64rem;
          font-weight: 800;
        }

        .sb-modal-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .sb-modal-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
        }

        .sb-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .sb-active-tile-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 10px;
          padding: 6px 12px;
        }

        .sb-tile-thumb-wrap {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          overflow: hidden;
          background: #111;
          flex-shrink: 0;
        }

        .sb-tile-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sb-tile-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .sb-tile-brand {
          font-size: 0.65rem;
          color: #d4af37;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sb-tile-name {
          font-size: 0.82rem;
          color: #ffffff;
          font-weight: 700;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sb-tile-dimensions {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .sb-close-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sb-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
        }

        /* Step Progress */
        .sb-steps-bar {
          display: flex;
          align-items: center;
          padding: 10px 24px;
          background: rgba(7, 10, 18, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          gap: 12px;
          overflow-x: auto;
        }

        .sb-step-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .sb-step-tab.active {
          color: #cbd5e1;
        }

        .sb-step-tab.current {
          color: #f3d375;
          background: rgba(212, 175, 55, 0.12);
        }

        .sb-step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
        }

        .sb-step-tab.current .sb-step-num {
          background: #d4af37;
          color: #000000;
          font-weight: 800;
        }

        .sb-step-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          min-width: 16px;
        }

        /* Alert Toast */
        .sb-alert {
          padding: 10px 20px;
          margin: 12px 24px 0 24px;
          border-radius: 8px;
          font-size: 0.84rem;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: sbSlideDown 0.25s ease-out;
        }

        .sb-alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }

        .sb-alert-success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #86efac;
        }

        .sb-alert-close {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          font-size: 1.1rem;
          cursor: pointer;
        }

        /* Body */
        .sb-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .sb-step-header-row {
          margin-bottom: 20px;
        }

        .sb-step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-step-desc {
          font-size: 0.82rem;
          color: #94a3b8;
        }

        /* Step 1 Presets */
        .sb-presets-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .sb-preset-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          flex-direction: column;
        }

        .sb-preset-card:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .sb-preset-card.active {
          border-color: #d4af37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.25);
        }

        .sb-preset-img-wrap {
          height: 140px;
          position: relative;
          background: #000;
        }

        .sb-preset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sb-preset-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          color: #f3d375;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .sb-preset-info {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sb-preset-name {
          font-size: 0.84rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .sb-preset-action {
          font-size: 0.74rem;
          color: #d4af37;
          font-weight: 600;
        }

        .sb-upload-card {
          justify-content: center;
          align-items: center;
          border-style: dashed;
          background: rgba(212, 175, 55, 0.03);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .sb-upload-zone-inner {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
        }

        .sb-upload-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
        }

        .sb-upload-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .sb-btn-upload {
          background: rgba(212, 175, 55, 0.15);
          color: #f3d375;
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Tile Selector Bar */
        .sb-tile-selector-bar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .sb-tile-selector-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sb-tile-selector-title {
          font-size: 0.84rem;
          color: #94a3b8;
        }

        .sb-selected-tile-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #ffffff;
        }

        .sb-pill-thumb {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          object-fit: cover;
        }

        .sb-tile-selector-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Step 2 Config */
        .sb-config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .sb-preview-box {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .sb-preview-header {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.04);
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sb-preset-tag {
          color: #d4af37;
          font-size: 0.72rem;
        }

        .sb-preview-media {
          flex: 1;
          height: 340px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-controls-panel {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .sb-control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sb-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #cbd5e1;
        }

        .sb-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sb-val-badge {
          background: rgba(212, 175, 55, 0.15);
          color: #f3d375;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .sb-surface-btn-group,
        .sb-pattern-btn-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }

        .sb-surface-btn,
        .sb-pattern-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .sb-surface-btn.active,
        .sb-pattern-btn.active {
          background: rgba(212, 175, 55, 0.18);
          border-color: #d4af37;
          color: #f3d375;
          font-weight: 700;
        }

        .sb-range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 3px;
          outline: none;
        }

        .sb-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .sb-scale-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #64748b;
        }

        .sb-action-box {
          margin-top: auto;
          padding-top: 10px;
        }

        /* Step 3 Mask Editor */
        .sb-editor-toolbar {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sb-toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-tool-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sb-tool-btn.active {
          background: #d4af37;
          color: #000000;
          border-color: #d4af37;
          font-weight: 700;
        }

        .sb-toolbar-right {
          display: flex;
          align-items: center;
        }

        .sb-brush-slider-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sb-brush-label {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .sb-range-compact {
          width: 110px;
        }

        .sb-canvas-viewport {
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .sb-editor-canvas {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          cursor: crosshair;
        }

        .sb-editor-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
        }

        /* Step 4 Comparison */
        .sb-comparison-stage {
          position: relative;
          height: 480px;
          background: #000000;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 14px;
          overflow: hidden;
          user-select: none;
          cursor: ew-resize;
        }

        .sb-comp-badge {
          position: absolute;
          top: 14px;
          z-index: 10;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1px solid rgba(255, 255, 255, 0.15);
          pointer-events: none;
        }

        .sb-comp-badge-left {
          left: 14px;
          color: #94a3b8;
        }

        .sb-comp-badge-right {
          right: 14px;
          color: #f3d375;
          border-color: rgba(212, 175, 55, 0.4);
        }

        .sb-comp-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-comp-clip-wrap {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 5;
        }

        .sb-comp-orig {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-comp-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #d4af37;
          box-shadow: 0 0 14px rgba(212, 175, 55, 0.8);
          z-index: 8;
          transform: translateX(-50%);
        }

        .sb-divider-grip {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #d4af37;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        .sb-grip-arrows {
          font-size: 1.1rem;
          letter-spacing: -2px;
          font-weight: 900;
        }

        .sb-result-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 18px;
        }

        .sb-result-actions-left,
        .sb-result-actions-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Buttons & Utility */
        .sb-btn-primary {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #000000;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
          transition: all 0.2s;
        }

        .sb-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.45);
        }

        .sb-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sb-btn-gold {
          background: #f3d375;
          color: #000000;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(243, 211, 117, 0.35);
          transition: all 0.2s;
        }

        .sb-btn-gold:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .sb-btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
          transition: all 0.2s;
        }

        .sb-btn-ghost {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .sb-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .sb-btn-large {
          padding: 12px 24px;
          font-size: 0.9rem;
          width: 100%;
          justify-content: center;
        }

        .sb-btn-compact {
          padding: 6px 12px;
          font-size: 0.76rem;
        }

        .sb-gold-icon {
          color: #d4af37;
        }

        .sb-spin {
          animation: sbSpin 1s linear infinite;
        }

        /* Footer */
        .sb-modal-footer {
          padding: 14px 24px;
          background: rgba(7, 10, 18, 0.8);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: #64748b;
        }

        .sb-footer-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Animations */
        @keyframes sbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sbSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes sbSpin {
          to { transform: rotate(360deg); }
        }

        .fade-in {
          animation: sbFadeIn 0.25s ease-out;
        }

        /* Responsive Overrides (Mobile App Feel) */
        @media (max-width: 900px) {
          .sb-modal-container {
            max-height: 98vh;
            border-radius: 12px;
          }

          .sb-modal-header {
            padding: 14px 16px;
            flex-direction: column;
            align-items: flex-start;
          }

          .sb-header-right {
            width: 100%;
            justify-content: space-between;
          }

          .sb-presets-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .sb-config-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sb-preview-media {
            height: 220px;
          }

          .sb-canvas-viewport {
            height: 280px;
          }

          .sb-comparison-stage {
            height: 280px;
          }

          .sb-tile-selector-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .sb-tile-selector-right {
            width: 100%;
            justify-content: space-between;
          }

          .sb-result-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .sb-result-actions-left,
          .sb-result-actions-right {
            flex-direction: column;
            width: 100%;
          }

          .sb-result-actions-right button,
          .sb-result-actions-left button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

    </div>
  );
}
