'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Download, Sparkles, HelpCircle, Sliders, Upload, RefreshCw } from 'lucide-react';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

// Multi-Region Room Presets matching real bathroom zones (Mirror Wall + Shower Cabin + Floor)
const ROOM_PRESETS = [
  {
    id: 'banyo_tam_kaplama',
    name: 'Banyo Tüm Alanlar (Lavabo Arkası + Duş Kabini + Zemin)',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    regions: [
      // Region 1: Lavabo Arkası Duvar (Ayna Altı & Lavabo Arkası Pano - Tezgah ve Lavaboya Taşmaz)
      [ { x: 0.0, y: 0.46 }, { x: 0.48, y: 0.46 }, { x: 0.48, y: 0.76 }, { x: 0.0, y: 0.86 } ],
      // Region 2: Duş Kabini İç Duvarı (Cam Duş Kabini İç Tarafı)
      [ { x: 0.78, y: 0.18 }, { x: 0.98, y: 0.18 }, { x: 0.98, y: 0.84 }, { x: 0.78, y: 0.84 } ],
      // Region 3: Banyo Zemin Kaplama (Kapı Eşiği ve Zemin)
      [ { x: 0.45, y: 0.76 }, { x: 0.78, y: 0.76 }, { x: 0.78, y: 1.0 }, { x: 0.45, y: 1.0 } ]
    ]
  },
  {
    id: 'walls_only',
    name: 'Lavabo Arkası & Duş Kabini Duvarları',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    regions: [
      [ { x: 0.0, y: 0.46 }, { x: 0.48, y: 0.46 }, { x: 0.48, y: 0.76 }, { x: 0.0, y: 0.86 } ],
      [ { x: 0.78, y: 0.18 }, { x: 0.98, y: 0.18 }, { x: 0.98, y: 0.84 }, { x: 0.78, y: 0.84 } ]
    ]
  },
  {
    id: 'floor_only',
    name: 'Sadece Banyo Zemin Kaplama',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    regions: [
      [ { x: 0.45, y: 0.76 }, { x: 0.78, y: 0.76 }, { x: 0.78, y: 1.0 }, { x: 0.45, y: 1.0 } ]
    ]
  }
];

export default function PhotoVisualizer({ activeProduct }) {
  const [selectedPreset, setSelectedPreset] = useState(ROOM_PRESETS[0]);
  const [userUploadedImageUrl, setUserUploadedImageUrl] = useState(null);
  const [backgroundImageObj, setBackgroundImageObj] = useState(null);
  const [tileImageObj, setTileImageObj] = useState(null);
  const [activeRegions, setActiveRegions] = useState(ROOM_PRESETS[0].regions);

  // Before/After Split Slider
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Tiling Settings (Defaulted for large format luxury slabs with fine 1px grout)
  const [tileScale, setTileScale] = useState(1.2);
  const [tileRotation, setStudioTileRotation] = useState(0);
  const [studioLayPattern, setStudioLayPattern] = useState('flat'); // flat, diagonal
  const [studioGroutWidth, setStudioGroutWidth] = useState(1); // 1px subtle grout
  const [studioGroutColor, setStudioGroutColor] = useState('#e5e7eb'); // light grey grout

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Current active background photo URL
  const currentRoomPhotoUrl = userUploadedImageUrl || selectedPreset?.url;

  // Load Background Image
  useEffect(() => {
    if (!currentRoomPhotoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentRoomPhotoUrl;
    img.onload = () => {
      setBackgroundImageObj(img);
      if (selectedPreset) setActiveRegions(selectedPreset.regions);
    };
  }, [currentRoomPhotoUrl, selectedPreset]);

  // Load Active Ceramic Tile Image
  useEffect(() => {
    if (!activeProduct) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const textureUrl = activeProduct.textureUrl || activeProduct.imageUrl;
    // Proxy URL to prevent CORS canvas tainting in production
    img.src = textureUrl.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(textureUrl)}` : textureUrl;
    img.onload = () => {
      const cleaned = cropWhiteBorders(img);
      setTileImageObj(cleaned);
    };
  }, [activeProduct]);

  // Redraw Visualizer Canvas
  useEffect(() => {
    draw();
  }, [backgroundImageObj, tileImageObj, activeRegions, tileScale, tileRotation, studioLayPattern, studioGroutWidth, studioGroutColor, sliderPos]);

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
    if (!canvas || !backgroundImageObj) return;

    const ctx = canvas.getContext('2d');
    const width = containerRef.current?.clientWidth || 800;
    const height = Math.min(width * (backgroundImageObj.naturalHeight / backgroundImageObj.naturalWidth), 550);

    canvas.width = width;
    canvas.height = height;

    // -------------------------------------------------------------
    // STEP A: Render User's Raw Original Photo (Left Side)
    // -------------------------------------------------------------
    ctx.drawImage(backgroundImageObj, 0, 0, width, height);

    // -------------------------------------------------------------
    // STEP B: Render Transformed Photo (User's Photo WITH Tile Applied)
    // -------------------------------------------------------------
    const tiledCanvas = document.createElement('canvas');
    tiledCanvas.width = width;
    tiledCanvas.height = height;
    const tCtx = tiledCanvas.getContext('2d');

    // 1. Draw base photo
    tCtx.drawImage(backgroundImageObj, 0, 0, width, height);

    // 2. Tile selected ceramic pattern onto room regions
    if (tileImageObj && activeRegions) {
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
          oCtx.drawImage(tileImageObj, x, y, tileW, tileH);
        }
      }
      oCtx.restore();

      // Warp tile pattern onto each room zone
      activeRegions.forEach((pins) => {
        const p0 = { x: pins[0].x * width, y: pins[0].y * height };
        const p1 = { x: pins[1].x * width, y: pins[1].y * height };
        const p2 = { x: pins[2].x * width, y: pins[2].y * height };
        const p3 = { x: pins[3].x * width, y: pins[3].y * height };

        drawTriangleTexture(tCtx, offscreen, p0.x, p0.y, p1.x, p1.y, p3.x, p3.y, 0, 1800, 0, 0, 0, 1800);
        drawTriangleTexture(tCtx, offscreen, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, 1800, 1800, 0, 0, 1800, 1800);

        // Light ambient shadow pass for photorealistic realistic finish
        tCtx.save();
        tCtx.beginPath();
        tCtx.moveTo(p0.x, p0.y);
        tCtx.lineTo(p1.x, p1.y);
        tCtx.lineTo(p2.x, p2.y);
        tCtx.lineTo(p3.x, p3.y);
        tCtx.closePath();
        tCtx.clip();
        tCtx.globalCompositeOperation = 'multiply';
        tCtx.globalAlpha = 0.22;
        tCtx.drawImage(backgroundImageObj, 0, 0, width, height);

        tCtx.globalCompositeOperation = 'overlay';
        tCtx.globalAlpha = 0.15;
        tCtx.drawImage(backgroundImageObj, 0, 0, width, height);
        tCtx.restore();
      });
    }

    // -------------------------------------------------------------
    // STEP C: Render Before / After Split View Over Canvas
    // -------------------------------------------------------------
    const splitX = (sliderPos / 100) * width;

    // Draw Transformed Photo on Right Half of Split
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, width - splitX, height);
    ctx.clip();
    ctx.drawImage(tiledCanvas, 0, 0, width, height);
    ctx.restore();

    // Vertical Split Line
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Split Handle Knob
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
  };

  // Split Slider Drag Interaction
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const splitX = (sliderPos / 100) * canvas.width;

    if (Math.abs(mouseX - splitX) < 40) {
      setIsDraggingSlider(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingSlider) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newPos = Math.max(5, Math.min(95, (mouseX / canvas.width) * 100));
    setSliderPos(newPos);
  };

  const handleMouseUp = () => setIsDraggingSlider(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserUploadedImageUrl(event.target.result);
      setSelectedPreset(null);
      // Segment boundaries excluding vanity basin, mirror, door and radiator
      setActiveRegions([
        [ { x: 0.0, y: 0.46 }, { x: 0.48, y: 0.46 }, { x: 0.48, y: 0.76 }, { x: 0.0, y: 0.86 } ],
        [ { x: 0.78, y: 0.18 }, { x: 0.98, y: 0.18 }, { x: 0.98, y: 0.84 }, { x: 0.78, y: 0.84 } ],
        [ { x: 0.45, y: 0.76 }, { x: 0.78, y: 0.76 }, { x: 0.78, y: 1.0 }, { x: 0.45, y: 1.0 } ]
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `seramikbak_dosenmis_banyo_${activeProduct?.code || 'tasarim'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportInstagramStory = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImageObj) return;

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
    sCtx.fillText('Fotoğraftan Gerçekçi Seramik Döşeme', 540, 190);

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
    sCtx.fillText('Kendi Banyonu Canlı Dönüştür ➔ seramikbak.com', targetX + 40, badgeY + 180);

    const dataUrl = storyCanvas.toDataURL('image/jpeg', 0.92);
    const link = document.createElement('a');
    link.download = `seramikbak_instagram_story_${activeProduct?.code || 'banyo'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Step Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Step 1: Upload Photo */}
        <div style={{
          padding: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', fontWeight: '900', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</div>
            <strong style={{ fontSize: '0.9rem', color: '#fff' }}>1. Banyo Fotoğrafınızı Yükleyin</strong>
          </div>
          
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
              padding: '12px',
              borderRadius: '10px',
              border: '1px dashed var(--accent-gold, #d4af37)',
              background: 'rgba(212, 175, 55, 0.1)',
              color: 'var(--accent-gold, #d4af37)',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Upload size={16} />
            <span>{userUploadedImageUrl ? '📸 Yüklenen Fotoğrafı Değiştir' : '📸 Kendi Banyo Fotoğrafını Yükle'}</span>
          </button>

          {/* Presets Bar */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', width: '100%' }}>Veya Örnek Odalar:</span>
            {ROOM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => { setSelectedPreset(preset); setUserUploadedImageUrl(null); }}
                style={{
                  fontSize: '0.68rem',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: selectedPreset?.id === preset.id && !userUploadedImageUrl ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: selectedPreset?.id === preset.id && !userUploadedImageUrl ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.02)',
                  color: selectedPreset?.id === preset.id && !userUploadedImageUrl ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Selected Ceramic */}
        <div style={{
          padding: '18px',
          background: 'rgba(197, 160, 89, 0.06)',
          border: '1px solid rgba(197, 160, 89, 0.25)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', fontWeight: '900', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</div>
            <strong style={{ fontSize: '0.9rem', color: '#fff' }}>2. Döşenecek Seramik Modeli</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fff', display: 'block' }}>{activeProduct?.name || 'Calacatta Gold Luxury'}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold, #d4af37)', fontWeight: '700', display: 'block', marginTop: '2px' }}>
              {activeProduct?.width || 60}x{activeProduct?.height || 120} cm • {activeProduct?.finish || 'Parlak'} • {activeProduct?.style || 'Mermer'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            *Katalogdan başka seramik seçtiğinizde burası anında güncellenir.
          </span>
        </div>
      </div>

      {/* Main Canvas & Split Comparison */}
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
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => e.touches.length === 1 && handleMouseDown({ clientX: e.touches[0].clientX })}
            onTouchMove={(e) => e.touches.length === 1 && handleMouseMove({ clientX: e.touches[0].clientX })}
            onTouchEnd={handleMouseUp}
            style={{
              display: 'block',
              maxWidth: '100%',
              cursor: 'col-resize'
            }}
          />

          {/* Badges */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none'
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-gold, #d4af37)' }} />
            <span>Sol: Orijinal Banyo | Sağ: {activeProduct?.name || 'Seçili Seramik'} Döşenmiş Hal</span>
          </div>

          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}>
            <Sliders size={12} style={{ color: 'var(--accent-gold, #d4af37)' }} />
            <span>Sürgüyü sağa-sola kaydırarak Before/After karşılaştırın</span>
          </div>
        </div>

        {/* Controls Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
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
              <span>Instagram Story (9:16)</span>
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
