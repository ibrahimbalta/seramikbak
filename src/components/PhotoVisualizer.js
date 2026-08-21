'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCw, ZoomIn, Download, RefreshCw, Sparkles, HelpCircle, Loader2, Sliders, Eye, EyeOff, Check } from 'lucide-react';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

// Multi-Region Room Presets matching real bathroom zones (Mirror Wall + Shower Cabin + Floor)
const ROOM_PRESETS = [
  {
    id: 'full_bathroom_transform',
    name: 'Banyo Tüm Alanlar (Lavabo Arkası + Duş Kabini + Zemin)',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    regions: [
      // Region 1: Lavabo Arkası Duvar (Mirror Wall)
      [ { x: 0.0, y: 0.30 }, { x: 0.64, y: 0.30 }, { x: 0.64, y: 0.76 }, { x: 0.0, y: 0.88 } ],
      // Region 2: Duş Kabini İç Duvarı (Shower Cabin Interior)
      [ { x: 0.64, y: 0.12 }, { x: 1.0, y: 0.12 }, { x: 1.0, y: 0.74 }, { x: 0.64, y: 0.76 } ],
      // Region 3: Banyo Zemin Kaplama (Bathroom Floor)
      [ { x: 0.0, y: 0.76 }, { x: 1.0, y: 0.74 }, { x: 1.0, y: 1.0 }, { x: 0.0, y: 1.0 } ]
    ]
  },
  {
    id: 'walls_only',
    name: 'Lavabo Arkası & Duş Kabini Duvarları',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    regions: [
      [ { x: 0.0, y: 0.30 }, { x: 0.64, y: 0.30 }, { x: 0.64, y: 0.76 }, { x: 0.0, y: 0.88 } ],
      [ { x: 0.64, y: 0.12 }, { x: 1.0, y: 0.12 }, { x: 1.0, y: 0.74 }, { x: 0.64, y: 0.76 } ]
    ]
  },
  {
    id: 'floor_only',
    name: 'Sadece Banyo Zemin Kaplama',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    regions: [
      [ { x: 0.0, y: 0.58 }, { x: 1.0, y: 0.58 }, { x: 1.0, y: 1.0 }, { x: 0.0, y: 1.0 } ]
    ]
  }
];

export default function PhotoVisualizer({ activeProduct }) {
  const [selectedPreset, setSelectedPreset] = useState(ROOM_PRESETS[0]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [tileImage, setTileImage] = useState(null);
  const [activeRegions, setActiveRegions] = useState(ROOM_PRESETS[0].regions);
  const [showPins, setShowPins] = useState(false); // Pin handles hidden by default for photorealistic visual

  // Generative AI States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResultImgObj, setAiResultImgObj] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%

  // Tiling Settings
  const [tileScale, setTileScale] = useState(0.8);
  const [tileRotation, setStudioTileRotation] = useState(0);
  const [studioLayPattern, setStudioLayPattern] = useState('flat'); // flat, diagonal
  const [studioGroutWidth, setStudioGroutWidth] = useState(2); // in px
  const [studioGroutColor, setStudioGroutColor] = useState('#888888');

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load Background Image
  useEffect(() => {
    if (!selectedPreset) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedPreset.url;
    img.onload = () => {
      setBackgroundImage(img);
      setActiveRegions(selectedPreset.regions);
      setAiResultImgObj(null);
    };
  }, [selectedPreset]);

  // Load Active Tile Image
  useEffect(() => {
    if (!activeProduct) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const textureUrl = activeProduct.textureUrl || activeProduct.imageUrl;
    // Proxy URL to prevent CORS canvas tainting in production
    img.src = textureUrl.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(textureUrl)}` : textureUrl;
    img.onload = () => {
      const cleaned = cropWhiteBorders(img);
      setTileImage(cleaned);
    };
  }, [activeProduct]);

  // Redraw Visualizer Canvas
  useEffect(() => {
    draw();
  }, [backgroundImage, tileImage, activeRegions, tileScale, tileRotation, studioLayPattern, studioGroutWidth, studioGroutColor, aiResultImgObj, isCompareMode, sliderPos, showPins]);

  // Generative AI API Call Handler
  const handleGenerateAiReTile = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/ai/re-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: activeProduct?.name || 'Calacatta Gold',
          productCode: activeProduct?.code || 'CLM-60120',
          style: activeProduct?.style || 'Mermer',
          color: activeProduct?.color || 'Beyaz',
          finish: activeProduct?.finish || 'Parlak',
          width: activeProduct?.width || 60,
          height: activeProduct?.height || 120
        })
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const img = new Image();
        img.src = data.imageUrl;
        img.onload = () => {
          setAiResultImgObj(img);
          setIsCompareMode(true);
          setAiGenerating(false);
        };
      } else {
        throw new Error(data.error || 'AI yanıtı alınamadı.');
      }
    } catch (err) {
      console.error('AI error:', err);
      setAiGenerating(false);
      alert('Yapay zeka banyo görseli oluşturulamadı. Yerel perspektif kaplama görüntülenecektir.');
    }
  };

  // Homography Affine Triangle Warping Engine
  const drawTriangleTexture = (ctx, texture, x0, y0, x1, y1, x2, y2, u0, u1, u2, v0, v1, v2) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.clip();

    const den = u0 * (v1 - v2) - v0 * (u1 - u2) + (u1 * v2 - u2 * v1);
    if (Math.abs(den) < 0.0001) {
      ctx.restore();
      return;
    }

    const a = (x0 * (v1 - v2) - v0 * (x1 - x2) + (x1 * v2 - x2 * v1)) / den;
    const b = (u0 * (x1 - x2) - x0 * (u1 - u2) + (u1 * x2 - u2 * x1)) / den;
    const c = (u0 * (v1 * x2 - v2 * x1) - v0 * (u1 * x2 - u2 * x1) + x0 * (u1 * v2 - u2 * v1)) / den;

    const d = (y0 * (v1 - v2) - v0 * (y1 - y2) + (y1 * v2 - y2 * v1)) / den;
    const e = (u0 * (y1 - y2) - y0 * (u1 - u2) + (u1 * y2 - u2 * y1)) / den;
    const f = (u0 * (v1 * y2 - v2 * y1) - v0 * (u1 * y2 - u2 * y1) + y0 * (u1 * v2 - u2 * v1)) / den;

    ctx.transform(a, d, b, e, c, f);
    ctx.drawImage(texture, 0, 0);
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    const width = containerRef.current?.clientWidth || 800;
    const height = Math.min(width * (backgroundImage.naturalHeight / backgroundImage.naturalWidth), 550);

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Original Room Background Image
    ctx.drawImage(backgroundImage, 0, 0, width, height);

    // 2. Render Re-Tiled Layers For All Active Room Regions (Mirror Wall + Shower Cabin + Floor)
    if (tileImage && activeRegions) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 1800;
      offscreen.height = 1800;
      const oCtx = offscreen.getContext('2d');

      oCtx.fillStyle = studioGroutColor;
      oCtx.fillRect(0, 0, offscreen.width, offscreen.height);

      const baseW = (activeProduct?.width || 60) * 1.5;
      const baseH = (activeProduct?.height || 120) * 1.5;
      const tileW = baseW * tileScale;
      const tileH = baseH * tileScale;

      oCtx.save();
      oCtx.translate(offscreen.width / 2, offscreen.height / 2);
      let rotationAngle = (tileRotation * Math.PI) / 180;
      if (studioLayPattern === 'diagonal') rotationAngle += Math.PI / 4;
      oCtx.rotate(rotationAngle);
      oCtx.translate(-offscreen.width / 2, -offscreen.height / 2);

      const stepX = tileW + parseInt(studioGroutWidth, 10);
      const stepY = tileH + parseInt(studioGroutWidth, 10);

      for (let x = -tileW * 2; x < offscreen.width + tileW * 2; x += stepX) {
        for (let y = -tileH * 2; y < offscreen.height + tileH * 2; y += stepY) {
          oCtx.drawImage(tileImage, x, y, tileW, tileH);
        }
      }
      oCtx.restore();

      // Render Each Room Zone (Lavabo Arkası + Duş İçi + Zemin)
      activeRegions.forEach((pins) => {
        const p0 = { x: pins[0].x * width, y: pins[0].y * height };
        const p1 = { x: pins[1].x * width, y: pins[1].y * height };
        const p2 = { x: pins[2].x * width, y: pins[2].y * height };
        const p3 = { x: pins[3].x * width, y: pins[3].y * height };

        // Perspective Warping Triangles
        drawTriangleTexture(ctx, offscreen, p0.x, p0.y, p1.x, p1.y, p3.x, p3.y, 0, 1800, 0, 0, 0, 1800);
        drawTriangleTexture(ctx, offscreen, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, 1800, 1800, 0, 0, 1800, 1800);

        // Photorealistic Ambient Multiply & Soft-Light Blend
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.clip();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.72;
        ctx.drawImage(backgroundImage, 0, 0, width, height);

        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.35;
        ctx.drawImage(backgroundImage, 0, 0, width, height);
        ctx.restore();
      });
    }

    // 3. Render AI Result Image Over Right Split (If AI Image Available or Compare Mode)
    const splitX = (sliderPos / 100) * width;
    if (isCompareMode) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();

      if (aiResultImgObj) {
        ctx.drawImage(aiResultImgObj, 0, 0, width, height);
      } else {
        ctx.drawImage(backgroundImage, 0, 0, width, height);
      }
      ctx.restore();

      // Draw Vertical Split Line & Slider Knob
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Circular Slider Knob
      ctx.fillStyle = '#d4af37';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(splitX, height / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↔', splitX, height / 2 + 4);
    }

    // 4. Draw Anchor Pins ONLY IF showPins is enabled
    if (showPins && !isCompareMode && activeRegions) {
      activeRegions.forEach((pins) => {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pins[0].x * width, pins[0].y * height);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(pins[i].x * width, pins[i].y * height);
        }
        ctx.closePath();
        ctx.stroke();

        pins.forEach((pin) => {
          const px = pin.x * width;
          const py = pin.y * height;

          ctx.fillStyle = '#d4af37';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        setSelectedPreset(null);
        setBackgroundImage(img);
        setAiResultImgObj(null);
        // Custom upload multi-surface bounds
        setActiveRegions([
          [ { x: 0.0, y: 0.0 }, { x: 1.0, y: 0.0 }, { x: 1.0, y: 0.75 }, { x: 0.0, y: 0.88 } ],
          [ { x: 0.0, y: 0.75 }, { x: 1.0, y: 0.75 }, { x: 1.0, y: 1.0 }, { x: 0.0, y: 1.0 } ]
        ]);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `seramikbak_${activeProduct?.code || 'tasarim'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportInstagramStory = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const storyCanvas = document.createElement('canvas');
    storyCanvas.width = 1080;
    storyCanvas.height = 1920;
    const sCtx = storyCanvas.getContext('2d');

    const bgGradient = sCtx.createLinearGradient(0, 0, 0, 1920);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    sCtx.fillStyle = bgGradient;
    sCtx.fillRect(0, 0, 1080, 1920);

    sCtx.fillStyle = '#d4af37';
    sCtx.font = '900 48px "Outfit", sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('SERAMİKBAK AI STÜDYO', 540, 140);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('Fotoğraftan 3D Seramik Kaplama Dönüşümü', 540, 190);

    const targetW = 960;
    const targetH = Math.min(1100, Math.round(targetW * (canvas.height / canvas.width)));
    const targetX = (1080 - targetW) / 2;
    const targetY = 260;

    sCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    sCtx.lineWidth = 4;
    sCtx.strokeRect(targetX - 4, targetY - 4, targetW + 8, targetH + 8);
    sCtx.drawImage(canvas, targetX, targetY, targetW, targetH);

    const badgeY = targetY + targetH + 60;
    sCtx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    sCtx.lineWidth = 2;
    sCtx.beginPath();
    sCtx.roundRect(targetX, badgeY, targetW, 280, 24);
    sCtx.fill();
    sCtx.stroke();

    sCtx.fillStyle = '#ffffff';
    sCtx.font = '800 36px "Outfit", sans-serif';
    sCtx.textAlign = 'left';
    sCtx.fillText(activeProduct?.name || 'Özel Tasarım Seramik', targetX + 40, badgeY + 70);

    sCtx.fillStyle = '#d4af37';
    sCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText(`${activeProduct?.width || 60}x${activeProduct?.height || 120} cm • ${activeProduct?.finish || 'Parlak'} • ${activeProduct?.style || 'Mermer'}`, targetX + 40, badgeY + 120);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('Sen de Kendi Banyonu Canlı Dönüştür ➔ seramikbak.com', targetX + 40, badgeY + 180);

    const dataUrl = storyCanvas.toDataURL('image/jpeg', 0.92);
    const link = document.createElement('a');
    link.download = `seramikbak_instagram_story_${activeProduct?.code || 'banyo'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '14px 20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold, #d4af37)' }}>Kaplama Alanı:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ROOM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => { setSelectedPreset(preset); setIsCompareMode(false); }}
                style={{
                  fontSize: '0.72rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: selectedPreset?.id === preset.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedPreset?.id === preset.id ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: selectedPreset?.id === preset.id ? 'var(--accent-gold, #d4af37)' : 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: Generative AI, Compare & Pin Toggle */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleGenerateAiReTile}
            disabled={aiGenerating}
            style={{
              fontSize: '0.75rem',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-gold, #d4af37), #b8860b)',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
            }}
          >
            {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{aiGenerating ? 'AI Banyonuzu Üretiyor...' : '✨ Yapay Zeka ile Baştan Oluştur'}</span>
          </button>

          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            style={{
              fontSize: '0.72rem',
              padding: '6px 14px',
              borderRadius: '8px',
              border: isCompareMode ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.15)',
              background: isCompareMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
              color: isCompareMode ? 'var(--accent-gold, #d4af37)' : '#ffffff',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sliders size={14} />
            <span>{isCompareMode ? 'Kaplama Moduna Dön' : 'Öncesi / Sonrası Sürgüsü'}</span>
          </button>

          <button
            onClick={() => setShowPins(!showPins)}
            style={{
              fontSize: '0.72rem',
              padding: '6px 12px',
              borderRadius: '8px',
              border: showPins ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.15)',
              background: showPins ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
              color: showPins ? 'var(--accent-gold, #d4af37)' : '#ffffff',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showPins ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPins ? 'Alan Sınırlarını Gizle' : 'Alan Sınırlarını Göster'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: '0.72rem',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={14} />
            <span>Kendi Odanı Yükle</span>
          </button>
        </div>
      </div>

      {/* Editor Grid Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 260px',
        gap: '20px',
        alignItems: 'start'
      }} className="photo-visualizer-split-grid">
        
        {/* Canvas Area */}
        <div 
          ref={containerRef} 
          style={{
            position: 'relative',
            background: '#020617',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              maxWidth: '100%'
            }}
          />

          {/* Interactive Tooltips */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.62rem',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}>
            <HelpCircle size={12} style={{ color: 'var(--accent-gold, #d4af37)' }} />
            <span>
              {isCompareMode ? 'Sürgüyü sağa-sola kaydırarak Öncesi/Sonrası kıyaslamasını inceleyin.' : 'Üst menüden Kaplama Alanı seçin veya ✨ AI ile Baştan Oluştur butonuna basın.'}
            </span>
          </div>
        </div>

        {/* Local Control Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Active Product Preview */}
          <div style={{
            padding: '10px',
            background: 'rgba(197, 160, 89, 0.08)',
            border: '1px solid rgba(197, 160, 89, 0.2)',
            borderRadius: '10px'
          }}>
            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--accent-gold, #d4af37)', display: 'block', textTransform: 'uppercase' }}>Seçili Karo</span>
            <strong style={{ fontSize: '0.78rem', color: '#fff', display: 'block', margin: '2px 0' }}>{activeProduct?.name || 'Calacatta Gold'}</strong>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{activeProduct?.width || 60}x{activeProduct?.height || 120} cm • {activeProduct?.finish || 'Parlak'}</span>
          </div>

          {/* Scale Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span>Seramik Ölçeği (Ebatı)</span>
              <strong style={{ color: '#fff' }}>%{Math.round(tileScale * 100)}</strong>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.05"
              value={tileScale}
              onChange={(e) => setTileScale(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-gold, #d4af37)' }}
            />
          </div>

          {/* Rotation Toggle */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Döşeme Yönü</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                onClick={() => setStudioTileRotation(0)}
                style={{
                  fontSize: '0.68rem',
                  padding: '6px',
                  borderRadius: '6px',
                  border: tileRotation === 0 ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: tileRotation === 0 ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: tileRotation === 0 ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Dikey (0°)
              </button>
              <button
                onClick={() => setStudioTileRotation(90)}
                style={{
                  fontSize: '0.68rem',
                  padding: '6px',
                  borderRadius: '6px',
                  border: tileRotation === 90 ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: tileRotation === 90 ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: tileRotation === 90 ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Yatay (90°)
              </button>
            </div>
          </div>

          {/* Lay Pattern */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Döşeme Şekli</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                onClick={() => setStudioLayPattern('flat')}
                style={{
                  fontSize: '0.68rem',
                  padding: '6px',
                  borderRadius: '6px',
                  border: studioLayPattern === 'flat' ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: studioLayPattern === 'flat' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: studioLayPattern === 'flat' ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Düz Izgara
              </button>
              <button
                onClick={() => setStudioLayPattern('diagonal')}
                style={{
                  fontSize: '0.68rem',
                  padding: '6px',
                  borderRadius: '6px',
                  border: studioLayPattern === 'diagonal' ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: studioLayPattern === 'diagonal' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: studioLayPattern === 'diagonal' ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Çapraz (45°)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={handleDownload}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(197, 160, 89, 0.15)',
                color: 'var(--accent-gold, #d4af37)',
                border: '1px solid var(--accent-gold, #d4af37)',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Görseli İndir</span>
            </button>

            <button
              onClick={handleExportInstagramStory}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(225, 48, 108, 0.2), rgba(225, 48, 108, 0.05))',
                color: '#f472b6',
                border: '1px solid rgba(225, 48, 108, 0.4)',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              <span>Instagram Story İndir (9:16)</span>
            </button>

            <button
              onClick={() => {
                if (selectedPreset) setActiveRegions(selectedPreset.regions);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              <span>Görünümü Sıfırla</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
