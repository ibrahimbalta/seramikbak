'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Scissors, 
  RotateCcw, 
  Download, 
  Send, 
  Check, 
  Sliders, 
  ChevronRight, 
  Eye, 
  Layers, 
  RefreshCw, 
  ArrowLeft,
  X,
  Paintbrush,
  Maximize2
} from 'lucide-react';

const QUICK_ROOM_PRESETS = [
  { id: 'bath', name: 'Modern Ferah Banyo', url: '/hero/easy_bathroom.jpg' },
  { id: 'kitchen', name: 'Modern Ada Mutfak', url: '/hero/easy_kitchen.jpg' },
  { id: 'living', name: 'Çağdaş Ferah Salon', url: '/hero/modern_living.png' }
];

export default function VisualizerStudio({ initialProduct = null }) {
  // --- State ---
  const [product, setProduct] = useState(initialProduct);

  // Images
  const [roomFile, setRoomFile] = useState(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const [roomImageEl, setRoomImageEl] = useState(null);

  const [tileFile, setTileFile] = useState(null);
  const [tileUrl, setTileUrl] = useState(null);

  // Configuration (Step 2)
  const [surface, setSurface] = useState('floor'); // 'floor' | 'wall' | 'both'
  const [pattern, setPattern] = useState('grid');   // 'grid' | 'brick'
  const [tileScale, setTileScale] = useState(1.0);

  // AI Segmentation (Step 3)
  const [maskB64Original, setMaskB64Original] = useState(null);
  const [maskImgEl, setMaskImgEl] = useState(null);
  const [brushMode, setBrushMode] = useState('paint'); // 'paint' | 'erase'
  const [brushSize, setBrushSize] = useState(28);

  // Result & Comparison (Step 4)
  const [resultUrl, setResultUrl] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Status & Feedback
  const [loadingMsg, setLoadingMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);

  // Refs
  const roomInputRef = useRef(null);
  const tileInputRef = useRef(null);
  const editorCanvasRef = useRef(null);
  const compContainerRef = useRef(null);

  // Offscreen canvas layers for interactive mask editing
  const offscreenRef = useRef({
    maskCanvas: null,
    maskCtx: null,
    colorCanvas: null,
    colorCtx: null,
    isDrawing: false,
    lastPos: null
  });

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/ai/python-visualizer')
      .then(res => res.json())
      .then(data => {
        setServerOnline(Boolean(data?.online));
      })
      .catch(() => setServerOnline(false));
  }, []);

  // Pre-load initial product texture if provided
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      const texture = initialProduct.textureUrl || initialProduct.imageUrl || '/textures/calacatta_gold.jpg';
      setTileUrl(texture);

      // Adapt scale based on product dimensions
      const w = Number(initialProduct.width) || 60;
      if (w <= 30) setTileScale(0.6);
      else if (w >= 120) setTileScale(1.4);
      else setTileScale(1.0);
    }
  }, [initialProduct]);

  // Set default room if none chosen
  useEffect(() => {
    if (!roomUrl) {
      setRoomUrl(QUICK_ROOM_PRESETS[0].url);
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setRoomImageEl(img);
      img.src = QUICK_ROOM_PRESETS[0].url;
    }
  }, [roomUrl]);

  // Helper toast notification
  const showToast = (msg, isSuccess = false) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  // -------------------------------------------------------------------------
  // Handlers: Room Image
  // -------------------------------------------------------------------------
  const handleRoomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen geçerli bir görsel dosyası seçin (JPG, PNG).');
      return;
    }

    setRoomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setRoomUrl(objectUrl);
    setMaskB64Original(null);
    setResultUrl(null);

    const img = new window.Image();
    img.onload = () => setRoomImageEl(img);
    img.src = objectUrl;
    e.target.value = '';
  };

  const handleSelectPresetRoom = (preset) => {
    setRoomFile(null);
    setRoomUrl(preset.url);
    setMaskB64Original(null);
    setResultUrl(null);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setRoomImageEl(img);
    img.src = preset.url;
  };

  // -------------------------------------------------------------------------
  // Handlers: Tile Texture
  // -------------------------------------------------------------------------
  const handleTileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen geçerli bir seramik görseli seçin.');
      return;
    }

    setTileFile(file);
    setTileUrl(URL.createObjectURL(file));
    setResultUrl(null);
    e.target.value = '';
  };

  // -------------------------------------------------------------------------
  // Step 2 -> Step 3: Run AI Detection (SegFormer)
  // -------------------------------------------------------------------------
  const handleDetectSurface = async () => {
    if (!roomUrl) {
      showToast('Lütfen önce bir mekân görseli seçin veya yükleyin.');
      return;
    }

    setLoadingMsg('SegFormer AI zemin ve duvar yüzeyini piksel seviyesinde analiz ediyor...');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/python-visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'segment',
          room_image: roomUrl,
          surface
        })
      });

      const data = await res.json();
      if (!data?.success || !data?.mask) {
        throw new Error(data?.error || 'Yüzey segmentasyonu oluşturulamadı.');
      }

      setMaskB64Original(data.mask);
      setupMaskEditor(data.mask);
      showToast('Yüzey başarıyla tespit edildi! Maskeyi ince ayarlayabilirsiniz.', true);
    } catch (err) {
      console.error('Detection error:', err);
      showToast(err.message || 'AI yüzey tespiti sırasında hata oluştu.');
    } finally {
      setLoadingMsg(null);
    }
  };

  // -------------------------------------------------------------------------
  // Step 3: Setup & Render Mask Editor Canvas
  // -------------------------------------------------------------------------
  const setupMaskEditor = (b64Mask) => {
    if (!roomImageEl) return;
    const canvas = editorCanvasRef.current;
    if (!canvas) return;

    const w = roomImageEl.naturalWidth || roomImageEl.width || 1024;
    const h = roomImageEl.naturalHeight || roomImageEl.height || 768;

    canvas.width = w;
    canvas.height = h;

    // Initialize offscreen mask canvas
    let { maskCanvas, maskCtx, colorCanvas, colorCtx } = offscreenRef.current;
    if (!maskCanvas) {
      maskCanvas = document.createElement('canvas');
      maskCtx = maskCanvas.getContext('2d');
      colorCanvas = document.createElement('canvas');
      colorCtx = colorCanvas.getContext('2d');
      offscreenRef.current = { ...offscreenRef.current, maskCanvas, maskCtx, colorCanvas, colorCtx };
    }

    maskCanvas.width = w;
    maskCanvas.height = h;
    colorCanvas.width = w;
    colorCanvas.height = h;

    // Load AI mask image
    const maskImg = new window.Image();
    maskImg.onload = () => {
      setMaskImgEl(maskImg);
      maskCtx.clearRect(0, 0, w, h);
      maskCtx.drawImage(maskImg, 0, 0, w, h);
      renderComposite();
    };
    maskImg.src = `data:image/png;base64,${b64Mask}`;
  };

  const renderComposite = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !roomImageEl) return;
    const ctx = canvas.getContext('2d');
    const { maskCanvas, colorCanvas, colorCtx } = offscreenRef.current;
    if (!maskCanvas || !colorCanvas) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw original room photo
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(roomImageEl, 0, 0, w, h);

    // 2. Tint mask layer with glowing gold/cyan overlay
    colorCtx.clearRect(0, 0, w, h);
    colorCtx.drawImage(maskCanvas, 0, 0);
    colorCtx.globalCompositeOperation = 'source-in';
    colorCtx.fillStyle = 'rgba(212, 175, 55, 1)';
    colorCtx.fillRect(0, 0, w, h);
    colorCtx.globalCompositeOperation = 'source-over';

    // 3. Composite tinted mask on top
    ctx.globalAlpha = 0.45;
    ctx.drawImage(colorCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
  };

  // Interactive brush drawing
  const getCanvasCoords = (e) => {
    const canvas = editorCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawBrush = (x, y) => {
    const canvas = editorCanvasRef.current;
    const { maskCtx } = offscreenRef.current;
    if (!canvas || !maskCtx) return;

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

  const drawLine = (from, to) => {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawBrush(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    offscreenRef.current.isDrawing = true;
    const pos = getCanvasCoords(e);
    drawBrush(pos.x, pos.y);
    offscreenRef.current.lastPos = pos;
    renderComposite();
  };

  const handlePointerMove = (e) => {
    if (!offscreenRef.current.isDrawing) return;
    e.preventDefault();
    const pos = getCanvasCoords(e);
    drawLine(offscreenRef.current.lastPos, pos);
    offscreenRef.current.lastPos = pos;
    renderComposite();
  };

  const handlePointerUp = () => {
    offscreenRef.current.isDrawing = false;
    offscreenRef.current.lastPos = null;
  };

  const handleResetMask = () => {
    if (!maskImgEl) return;
    const { maskCanvas, maskCtx } = offscreenRef.current;
    if (!maskCanvas || !maskCtx) return;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.drawImage(maskImgEl, 0, 0, maskCanvas.width, maskCanvas.height);
    renderComposite();
  };

  // -------------------------------------------------------------------------
  // Step 3 -> Step 4: Apply Tile (SegFormer Neural Perspective Pipeline)
  // -------------------------------------------------------------------------
  const getBinarizedMaskBase64 = () => {
    const { maskCanvas, maskCtx } = offscreenRef.current;
    if (!maskCanvas || !maskCtx) return maskB64Original;

    const w = maskCanvas.width;
    const h = maskCanvas.height;
    const px = maskCtx.getImageData(0, 0, w, h).data;

    const binCanvas = document.createElement('canvas');
    binCanvas.width = w;
    binCanvas.height = h;
    const binCtx = binCanvas.getContext('2d');
    const binData = binCtx.createImageData(w, h);
    const out = binData.data;

    for (let i = 0; i < px.length; i += 4) {
      const brightness = (px[i] + px[i + 1] + px[i + 2]) / 3;
      const isSet = px[i + 3] > 40 && brightness > 40;
      out[i] = isSet ? 255 : 0;
      out[i + 1] = isSet ? 255 : 0;
      out[i + 2] = isSet ? 255 : 0;
      out[i + 3] = 255;
    }

    binCtx.putImageData(binData, 0, 0);
    return binCanvas.toDataURL('image/png').split(',')[1];
  };

  const handleApplyTile = async () => {
    if (!roomUrl || !tileUrl) {
      showToast('Lütfen hem oda hem de seramik görselini sağlayın.');
      return;
    }

    setLoadingMsg('Seramik dokusu perspektif homografisi, ışık ve temas gölgeleri ile odaya giydiriliyor...');
    setErrorMsg(null);

    try {
      const refinedMaskB64 = getBinarizedMaskBase64();

      const res = await fetch('/api/ai/python-visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          room_image: roomUrl,
          tile_image: tileUrl,
          mask: refinedMaskB64,
          pattern,
          tile_scale: tileScale,
          surface
        })
      });

      const data = await res.json();
      if (!data?.success || !data?.renderedImage) {
        throw new Error(data?.error || 'Seramik uygulama işlemi tamamlanamadı.');
      }

      setResultUrl(data.renderedImage);
      setSliderPos(50);
      showToast('Seramik başarıyla odaya giydirildi!', true);

      // Scroll smoothly to result
      setTimeout(() => {
        const el = document.getElementById('step-result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Apply tile error:', err);
      showToast(err.message || 'Görselleştirme sırasında hata oluştu.');
    } finally {
      setLoadingMsg(null);
    }
  };

  // -------------------------------------------------------------------------
  // Step 4: Comparison Slider Dragging
  // -------------------------------------------------------------------------
  const handleSliderMove = (clientX) => {
    if (!compContainerRef.current) return;
    const rect = compContainerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    setSliderPos(pct);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `seramikbak_${product?.code || 'mekan'}_tasarim.png`;
    a.click();
  };

  return (
    <div className="vs-page-wrapper">
      {/* Top Breadcrumb & Status Bar */}
      <div className="vs-topbar">
        <div className="vs-container vs-topbar-inner">
          <div className="vs-breadcrumb">
            <Link href="/" className="vs-bc-link">Anasayfa</Link>
            <ChevronRight size={13} className="vs-bc-sep" />
            {product ? (
              <>
                <Link href={`/urun/${product.slug}`} className="vs-bc-link">{product.name}</Link>
                <ChevronRight size={13} className="vs-bc-sep" />
              </>
            ) : null}
            <span className="vs-bc-current">Mekânımda Gör & Dene</span>
          </div>

          <div className="vs-status-pill">
            <span className={`vs-status-dot ${serverOnline ? 'online' : 'offline'}`} />
            <span>{serverOnline ? 'SegFormer-B3 AI Hazır' : 'AI Sunucusu Çevrimdışı'}</span>
          </div>
        </div>
      </div>

      <div className="vs-container vs-main-content">
        {/* Page Hero Header */}
        <header className="vs-header">
          <div className="vs-badge">
            <Sparkles size={14} style={{ color: '#d4af37' }} />
            <span>NVIDIA SegFormer-B3 • Derin Öğrenme Motoru</span>
          </div>
          <h1 className="vs-title">Mekânında Gör & Dene Stüdyosu</h1>
          <p className="vs-subtitle">
            Kendi banyonuzun, mutfağınızın veya salonunuzun fotoğrafını yükleyin; yapay zekâ zemin ve duvarları tanıyıp seçtiğiniz seramiği orijinal ışık ve temas gölgeleriyle giydirsin.
          </p>

          {/* Product Mini Info Bar (When coming from product page) */}
          {product && (
            <div className="vs-product-strip">
              <div className="vs-product-strip-thumb">
                <img 
                  src={product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg'} 
                  alt={product.name} 
                />
              </div>
              <div className="vs-product-strip-info">
                <div className="vs-product-brand">{product.brand?.name || 'Seramik'}</div>
                <div className="vs-product-name">{product.name}</div>
                <div className="vs-product-meta">
                  {product.width}×{product.height} cm • {product.finish || 'Full Lappato'}
                </div>
              </div>
              <div className="vs-product-strip-action">
                <Link href={`/teklif-al?urun=${product.slug}`} className="vs-btn-strip-quote">
                  <Send size={14} />
                  <span>Teklif Talebi Al</span>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ===================================================================
            STEP 1: Upload Images
        =================================================================== */}
        <section className="vs-step-card">
          <div className="vs-step-header">
            <span className="vs-step-number">1</span>
            <div>
              <h2 className="vs-step-title">Görselleri Belirleyin</h2>
              <p className="vs-step-desc">Mekânınızın fotoğrafını yükleyin ve uygulanacak seramik dokusunu seçin.</p>
            </div>
          </div>

          <div className="vs-upload-grid">
            {/* Room Image Upload Zone */}
            <div 
              className={`vs-dropzone ${roomUrl ? 'has-image' : ''}`}
              onClick={() => roomInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={roomInputRef} 
                onChange={handleRoomUpload} 
                accept="image/jpeg,image/png,image/webp" 
                style={{ display: 'none' }} 
              />

              {roomUrl ? (
                <div className="vs-preview-container">
                  <img src={roomUrl} alt="Mekân Önizleme" className="vs-preview-img" />
                  <div className="vs-dropzone-badge">Mekân Yüklendi ✓</div>
                  <button 
                    type="button" 
                    className="vs-btn-change-img"
                    onClick={(e) => {
                      e.stopPropagation();
                      roomInputRef.current?.click();
                    }}
                  >
                    Fotoğrafı Değiştir
                  </button>
                </div>
              ) : (
                <div className="vs-dropzone-empty">
                  <div className="vs-dropzone-icon">
                    <Camera size={28} />
                  </div>
                  <div className="vs-dropzone-title">Oda / Mekân Görseli</div>
                  <div className="vs-dropzone-hint">Sürükleyip bırakın veya seçmek için tıklayın (JPG, PNG)</div>
                </div>
              )}
            </div>

            {/* Tile Texture Upload Zone */}
            <div 
              className={`vs-dropzone ${tileUrl ? 'has-image' : ''}`}
              onClick={() => tileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={tileInputRef} 
                onChange={handleTileUpload} 
                accept="image/jpeg,image/png,image/webp" 
                style={{ display: 'none' }} 
              />

              {tileUrl ? (
                <div className="vs-preview-container">
                  <img src={tileUrl} alt="Seramik Dokusu" className="vs-preview-img" />
                  <div className="vs-dropzone-badge">
                    {product ? `${product.name} Dokusu Aktif ✓` : 'Seramik Dokusu Yüklendi ✓'}
                  </div>
                  <button 
                    type="button" 
                    className="vs-btn-change-img"
                    onClick={(e) => {
                      e.stopPropagation();
                      tileInputRef.current?.click();
                    }}
                  >
                    Dokuyu Değiştir
                  </button>
                </div>
              ) : (
                <div className="vs-dropzone-empty">
                  <div className="vs-dropzone-icon">
                    <Layers size={28} />
                  </div>
                  <div className="vs-dropzone-title">Seramik / Mermer Dokusu</div>
                  <div className="vs-dropzone-hint">Sürükleyip bırakın veya ürün dokusu yükleyin</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="vs-presets-row">
            <span className="vs-presets-label">Örnek Mekânlar:</span>
            <div className="vs-presets-buttons">
              {QUICK_ROOM_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPresetRoom(p)}
                  className={`vs-btn-preset ${roomUrl === p.url && !roomFile ? 'active' : ''}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            STEP 2: Configure & Detect Surface
        =================================================================== */}
        <section className="vs-step-card">
          <div className="vs-step-header">
            <span className="vs-step-number">2</span>
            <div>
              <h2 className="vs-step-title">Yüzey Seçimi ve AI Tespiti</h2>
              <p className="vs-step-desc">Hangi yüzeylerin seramik kaplanacağını ve karo ölçeğini belirleyin.</p>
            </div>
          </div>

          <div className="vs-config-grid">
            {/* Target Surface */}
            <div className="vs-config-col">
              <label className="vs-config-label">Uygulama Alanı (Target Surface):</label>
              <div className="vs-surface-btn-group">
                <button
                  type="button"
                  onClick={() => setSurface('floor')}
                  className={`vs-surface-opt ${surface === 'floor' ? 'active' : ''}`}
                >
                  🏠 Zemin (Floor)
                </button>
                <button
                  type="button"
                  onClick={() => setSurface('wall')}
                  className={`vs-surface-opt ${surface === 'wall' ? 'active' : ''}`}
                >
                  🧱 Duvar (Wall)
                </button>
                <button
                  type="button"
                  onClick={() => setSurface('both')}
                  className={`vs-surface-opt ${surface === 'both' ? 'active' : ''}`}
                >
                  🔲 Zemin + Duvar (Both)
                </button>
              </div>
            </div>

            {/* Tile Pattern */}
            <div className="vs-config-col">
              <label className="vs-config-label">Döşeme Deseni:</label>
              <select 
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)}
                className="vs-select"
              >
                <option value="grid">Düz Rektifiye Izgara (Grid)</option>
                <option value="brick">1/2 Şaşırtmalı (Brick / Offset)</option>
              </select>
            </div>

            {/* Tile Scale */}
            <div className="vs-config-col">
              <div className="vs-scale-label-row">
                <label className="vs-config-label">Karo Ölçeği:</label>
                <span className="vs-scale-val">{tileScale.toFixed(1)}×</span>
              </div>
              <input 
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={tileScale}
                onChange={(e) => setTileScale(parseFloat(e.target.value))}
                className="vs-range"
              />
            </div>
          </div>

          <div className="vs-detect-action-row">
            <button
              type="button"
              onClick={handleDetectSurface}
              disabled={!roomUrl || !tileUrl}
              className="vs-btn-detect"
            >
              <Eye size={16} />
              <span>
                {surface === 'wall' 
                  ? 'Duvar Yüzeyini Tespit Et' 
                  : surface === 'both' 
                  ? 'Zemin ve Duvarları Tespit Et' 
                  : 'Zemin Yüzeyini Tespit Et'}
              </span>
            </button>
          </div>
        </section>

        {/* ===================================================================
            STEP 3: Refine Mask Editor
        =================================================================== */}
        {maskB64Original && (
          <section className="vs-step-card" id="step-mask-section">
            <div className="vs-step-header">
              <span className="vs-step-number">3</span>
              <div>
                <h2 className="vs-step-title">Yapay Zekâ Maskesini İnce Ayarlayın</h2>
                <p className="vs-step-desc">
                  Altın sarısı ile işaretlenen alanlar seramik kaplanacaktır. Küvet, lavabo ve mobilyaları korumak için <strong>Silgi</strong> ile temizleyebilir veya yeni alanlar <strong>Boyayabilirsiniz</strong>.
                </p>
              </div>
            </div>

            <div className="vs-editor-toolbar">
              <div className="vs-tool-btn-group">
                <button
                  type="button"
                  onClick={() => setBrushMode('paint')}
                  className={`vs-tool-btn ${brushMode === 'paint' ? 'active-paint' : ''}`}
                >
                  <Paintbrush size={15} />
                  <span>Boya (Ekle)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBrushMode('erase')}
                  className={`vs-tool-btn ${brushMode === 'erase' ? 'active-erase' : ''}`}
                >
                  <Scissors size={15} />
                  <span>Silgi (Koru)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetMask}
                  className="vs-tool-btn"
                  title="Orijinal AI maskesine dön"
                >
                  <RotateCcw size={15} />
                  <span>Sıfırla</span>
                </button>
              </div>

              <div className="vs-brush-slider-group">
                <label className="vs-brush-label">Fırça Boyutu: <strong>{brushSize}px</strong></label>
                <input 
                  type="range"
                  min="6"
                  max="80"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                  className="vs-range vs-brush-range"
                />
              </div>
            </div>

            <div className="vs-canvas-wrapper">
              <canvas 
                ref={editorCanvasRef} 
                className="vs-editor-canvas"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            </div>

            <div className="vs-apply-action-row">
              <button
                type="button"
                onClick={handleApplyTile}
                className="vs-btn-apply"
              >
                <Sparkles size={16} />
                <span>Seramiği Odaya Giydir (Uygula)</span>
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================
            STEP 4: Result & Comparison Slider
        =================================================================== */}
        {resultUrl && (
          <section className="vs-step-card vs-result-card" id="step-result-section">
            <div className="vs-step-header">
              <span className="vs-step-number">4</span>
              <div>
                <h2 className="vs-step-title">Görselleştirme Sonucu</h2>
                <p className="vs-step-desc">
                  Kaydırıcıyı sağa-sola hareket ettirerek odanızın önceki ve sonraki hâlini karşılaştırın.
                </p>
              </div>
            </div>

            {/* Split Comparison Stage */}
            <div 
              ref={compContainerRef} 
              className="vs-comparison-stage"
              onPointerMove={isDraggingSlider ? (e) => handleSliderMove(e.clientX) : undefined}
              onPointerUp={() => setIsDraggingSlider(false)}
              onPointerLeave={() => setIsDraggingSlider(false)}
            >
              {/* After: Rendered with new tile (Behind layer) */}
              <img src={resultUrl} alt="Yenilenmiş Mekân" className="vs-comp-img vs-comp-after" />

              {/* Before: Original room (Clipped layer on top) */}
              <div 
                className="vs-comp-before-wrap"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img src={roomUrl} alt="Orijinal Mekân" className="vs-comp-img vs-comp-before" />
              </div>

              {/* Draggable Divider Handle */}
              <div 
                className="vs-comp-handle"
                style={{ left: `${sliderPos}%` }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsDraggingSlider(true);
                }}
              >
                <div className="vs-comp-handle-line" />
                <div className="vs-comp-handle-knob">
                  <span>↔</span>
                </div>
              </div>

              {/* Badges */}
              <div className="vs-comp-label-left">Orijinal Mekân</div>
              <div className="vs-comp-label-right">
                <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
                {product?.name || 'Seçili Seramik'}
              </div>
            </div>

            {/* Quick Slider Positions */}
            <div className="vs-quick-pos-row">
              <button 
                type="button" 
                onClick={() => setSliderPos(100)}
                className={`vs-btn-quick ${sliderPos === 100 ? 'active' : ''}`}
              >
                %100 Orijinal
              </button>
              <button 
                type="button" 
                onClick={() => setSliderPos(50)}
                className={`vs-btn-quick ${sliderPos === 50 ? 'active' : ''}`}
              >
                50 / 50 Karşılaştır
              </button>
              <button 
                type="button" 
                onClick={() => setSliderPos(0)}
                className={`vs-btn-quick ${sliderPos === 0 ? 'active' : ''}`}
              >
                %100 Yenilenmiş
              </button>
            </div>

            {/* Final Conversion & Download Actions */}
            <div className="vs-result-actions">
              <button
                type="button"
                onClick={handleDownload}
                className="vs-btn-download"
              >
                <Download size={16} />
                <span>Yüksek Çözünürlüklü İndir</span>
              </button>

              {product && (
                <Link
                  href={`/teklif-al?urun=${product.slug}`}
                  className="vs-btn-quote"
                >
                  <Send size={16} />
                  <span>Bu Seramik İçin Metraj & Teklif Al</span>
                </Link>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Loading Overlay */}
      {loadingMsg && (
        <div className="vs-loading-overlay">
          <div className="vs-loading-card">
            <RefreshCw size={30} className="vs-spin-icon" />
            <div className="vs-loading-title">Yapay Zekâ İşliyor...</div>
            <div className="vs-loading-desc">{loadingMsg}</div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {errorMsg && (
        <div className="vs-toast error">
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="vs-toast success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* ===================================================================
          SCOPED LUXURY STYLING (SERAMİKBAK OBSIDIAN & GOLD THEME)
      =================================================================== */}
      <style jsx>{`
        .vs-page-wrapper {
          min-height: 100vh;
          background: #080c16;
          color: #f8fafc;
          padding-bottom: 80px;
          font-family: inherit;
        }

        .vs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Topbar */
        .vs-topbar {
          background: rgba(11, 17, 32, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 0;
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .vs-topbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .vs-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        :global(.vs-bc-link) {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.15s;
        }

        :global(.vs-bc-link:hover) {
          color: #f3d375;
        }

        .vs-bc-current {
          color: #f3d375;
          font-weight: 700;
        }

        .vs-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.74rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .vs-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .vs-status-dot.online {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .vs-status-dot.offline {
          background: #ef4444;
        }

        /* Header */
        .vs-header {
          padding: 40px 0 24px;
          text-align: center;
        }

        .vs-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #f3d375;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.28);
          padding: 4px 14px;
          border-radius: 9999px;
          margin-bottom: 14px;
        }

        .vs-title {
          font-size: 2.1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }

        .vs-subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Product Strip */
        .vs-product-strip {
          margin: 28px auto 0;
          max-width: 680px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 14px;
          padding: 10px 18px;
          backdrop-filter: blur(10px);
          text-align: left;
        }

        .vs-product-strip-thumb {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          overflow: hidden;
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        .vs-product-strip-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vs-product-strip-info {
          flex: 1;
        }

        .vs-product-brand {
          font-size: 0.72rem;
          font-weight: 700;
          color: #d4af37;
          text-transform: uppercase;
        }

        .vs-product-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .vs-product-meta {
          font-size: 0.76rem;
          color: #94a3b8;
        }

        :global(.vs-btn-strip-quote) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #d4af37 0%, #b89327 100%);
          color: #0b1120;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
          transition: transform 0.15s;
        }

        :global(.vs-btn-strip-quote:hover) {
          transform: translateY(-2px);
        }

        /* Step Cards */
        .vs-step-card {
          background: #0b1120;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .vs-result-card {
          border-color: rgba(212, 175, 55, 0.35);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.1);
        }

        .vs-step-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 20px;
        }

        .vs-step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d4af37 0%, #b89327 100%);
          color: #0b1120;
          font-weight: 850;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vs-step-title {
          font-size: 1.18rem;
          font-weight: 750;
          color: #f8fafc;
          margin: 0 0 2px;
        }

        .vs-step-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0;
        }

        /* Step 1: Upload Grid */
        .vs-upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .vs-upload-grid {
            grid-template-columns: 1fr;
          }
        }

        .vs-dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          background: rgba(15, 23, 42, 0.5);
          border-radius: 14px;
          padding: 24px;
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .vs-dropzone:hover {
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.04);
        }

        .vs-dropzone.has-image {
          border-style: solid;
          border-color: rgba(212, 175, 55, 0.4);
          padding: 0;
        }

        .vs-dropzone-empty {
          text-align: center;
        }

        .vs-dropzone-icon {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          background: rgba(212, 175, 55, 0.12);
          color: #f3d375;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .vs-dropzone-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 4px;
        }

        .vs-dropzone-hint {
          font-size: 0.74rem;
          color: #64748b;
        }

        .vs-preview-container {
          position: relative;
          width: 100%;
          height: 220px;
        }

        .vs-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vs-dropzone-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 9999px;
          backdrop-filter: blur(6px);
        }

        .vs-btn-change-img {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(6px);
        }

        /* Presets Row */
        .vs-presets-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
        }

        .vs-presets-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .vs-presets-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .vs-btn-preset {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .vs-btn-preset:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .vs-btn-preset.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: #d4af37;
          color: #f3d375;
        }

        /* Step 2: Config Grid */
        .vs-config-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 20px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 18px;
        }

        @media (max-width: 860px) {
          .vs-config-grid {
            grid-template-columns: 1fr;
          }
        }

        .vs-config-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vs-config-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .vs-surface-btn-group {
          display: flex;
          gap: 6px;
        }

        .vs-surface-opt {
          flex: 1;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 8px 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .vs-surface-opt.active {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #0b1120;
          border-color: #d4af37;
        }

        .vs-select {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .vs-scale-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .vs-scale-val {
          font-size: 0.8rem;
          font-weight: 800;
          color: #f3d375;
        }

        .vs-range {
          accent-color: #d4af37;
          cursor: pointer;
        }

        .vs-detect-action-row {
          display: flex;
          justify-content: flex-end;
        }

        .vs-btn-detect {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
          transition: transform 0.15s;
        }

        .vs-btn-detect:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .vs-btn-detect:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Step 3: Mask Editor */
        .vs-editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 16px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .vs-tool-btn-group {
          display: flex;
          gap: 8px;
        }

        .vs-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .vs-tool-btn.active-paint {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          color: #34d399;
        }

        .vs-tool-btn.active-erase {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #fca5a5;
        }

        .vs-brush-slider-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vs-brush-label {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .vs-brush-range {
          width: 110px;
        }

        .vs-canvas-wrapper {
          position: relative;
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 16px;
        }

        .vs-editor-canvas {
          width: 100%;
          height: auto;
          max-height: 540px;
          object-fit: contain;
          display: block;
          cursor: crosshair;
        }

        .vs-apply-action-row {
          display: flex;
          justify-content: flex-end;
        }

        .vs-btn-apply {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #d4af37 0%, #b89327 100%);
          color: #0b1120;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(212, 175, 55, 0.4);
          transition: transform 0.15s;
        }

        .vs-btn-apply:hover {
          transform: translateY(-2px);
        }

        /* Step 4: Comparison Stage */
        .vs-comparison-stage {
          position: relative;
          width: 100%;
          height: 520px;
          border-radius: 14px;
          overflow: hidden;
          background: #020617;
          border: 1px solid rgba(212, 175, 55, 0.3);
          margin-bottom: 16px;
          user-select: none;
        }

        @media (max-width: 768px) {
          .vs-comparison-stage {
            height: 340px;
          }
        }

        .vs-comp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .vs-comp-after {
          position: absolute;
          inset: 0;
        }

        .vs-comp-before-wrap {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .vs-comp-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4px;
          transform: translateX(-50%);
          cursor: ew-resize;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vs-comp-handle-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
        }

        .vs-comp-handle-knob {
          width: 36px;
          height: 36px;
          background: #d4af37;
          border: 3px solid #0b1120;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0b1120;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
          z-index: 31;
        }

        .vs-comp-label-left {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.8);
          color: #cbd5e1;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          backdrop-filter: blur(6px);
          z-index: 10;
        }

        .vs-comp-label-right {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(212, 175, 55, 0.9);
          color: #0b1120;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 6px;
          backdrop-filter: blur(6px);
          z-index: 10;
        }

        /* Quick Slider Positions */
        .vs-quick-pos-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .vs-btn-quick {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        .vs-btn-quick.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: #d4af37;
          color: #f3d375;
        }

        /* Result Action Buttons */
        .vs-result-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .vs-btn-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .vs-btn-download:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        :global(.vs-btn-quote) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #d4af37 0%, #b89327 100%);
          color: #0b1120;
          padding: 11px 24px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 850;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
          transition: transform 0.15s;
        }

        :global(.vs-btn-quote:hover) {
          transform: translateY(-2px);
        }

        /* Loading Overlay */
        .vs-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(4, 8, 16, 0.85);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .vs-loading-card {
          background: #0b1120;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 18px;
          padding: 32px 28px;
          max-width: 440px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        :global(.vs-spin-icon) {
          color: #d4af37;
          animation: spin 1.5s linear infinite;
          margin: 0 auto 16px;
        }

        .vs-loading-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .vs-loading-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Toast */
        .vs-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 0.84rem;
          font-weight: 700;
          z-index: 10000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideUp 0.25s ease;
        }

        .vs-toast.error {
          background: #ef4444;
          color: #ffffff;
        }

        .vs-toast.success {
          background: #10b981;
          color: #ffffff;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
