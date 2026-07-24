'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCw, ZoomIn, Download, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

// Room Presets with empty floors/walls and default perspective coordinates
const ROOM_PRESETS = [
  {
    id: 'bathroom',
    name: 'Modern Boş Banyo',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { x: 0.02, y: 0.76 }, // Top-Left (Zemin başlangıcı)
      { x: 0.98, y: 0.76 }, // Top-Right
      { x: 0.98, y: 0.98 }, // Bottom-Right
      { x: 0.02, y: 0.98 }  // Bottom-Left
    ]
  },
  {
    id: 'livingroom',
    name: 'Geniş Boş Salon zemin',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { x: 0.10, y: 0.60 },
      { x: 0.90, y: 0.60 },
      { x: 0.98, y: 0.98 },
      { x: 0.02, y: 0.98 }
    ]
  },
  {
    id: 'kitchen',
    name: 'Minimal Mutfak Tezgahi',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { x: 0.02, y: 0.50 },
      { x: 0.98, y: 0.50 },
      { x: 0.98, y: 0.82 },
      { x: 0.02, y: 0.82 }
    ]
  }
];

export default function PhotoVisualizer({ activeProduct }) {
  const [selectedPreset, setSelectedPreset] = useState(ROOM_PRESETS[0]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [tileImage, setTileImage] = useState(null);
  const [pins, setPins] = useState(ROOM_PRESETS[0].pins);
  const [draggingPinIndex, setDraggingPinIndex] = useState(null);

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
      setPins(selectedPreset.pins);
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
      setTileImage(img);
    };
  }, [activeProduct]);

  // Redraw Visualizer Canvas
  useEffect(() => {
    draw();
  }, [backgroundImage, tileImage, pins, tileScale, tileRotation, studioLayPattern, studioGroutWidth, studioGroutColor]);

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
    const width = containerRef.current.clientWidth || 800;
    const height = Math.min(width * (backgroundImage.naturalHeight / backgroundImage.naturalWidth), 550);

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background Room Image
    ctx.drawImage(backgroundImage, 0, 0, width, height);

    // 2. Generate repeating tile pattern on offscreen canvas
    if (tileImage) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 1800;
      offscreen.height = 1800;
      const oCtx = offscreen.getContext('2d');

      // Grout Color
      oCtx.fillStyle = studioGroutColor;
      oCtx.fillRect(0, 0, offscreen.width, offscreen.height);

      // Tile Dimensions (scaled according to scale factor and product specs)
      const baseW = (activeProduct?.width || 60) * 1.5;
      const baseH = (activeProduct?.height || 120) * 1.5;
      const tileW = baseW * tileScale;
      const tileH = baseH * tileScale;

      oCtx.save();
      // Apply rotation / layout pattern
      oCtx.translate(offscreen.width / 2, offscreen.height / 2);
      let rotationAngle = (tileRotation * Math.PI) / 180;
      if (studioLayPattern === 'diagonal') {
        rotationAngle += Math.PI / 4;
      }
      oCtx.rotate(rotationAngle);
      oCtx.translate(-offscreen.width / 2, -offscreen.height / 2);

      const stepX = tileW + parseInt(studioGroutWidth, 10);
      const stepY = tileH + parseInt(studioGroutWidth, 10);

      // Draw repeating grids
      for (let x = -tileW * 2; x < offscreen.width + tileW * 2; x += stepX) {
        for (let y = -tileH * 2; y < offscreen.height + tileH * 2; y += stepY) {
          oCtx.drawImage(tileImage, x, y, tileW, tileH);
        }
      }
      oCtx.restore();

      // 3. Warp offscreen tiling onto perspective quad
      const p0 = { x: pins[0].x * width, y: pins[0].y * height };
      const p1 = { x: pins[1].x * width, y: pins[1].y * height };
      const p2 = { x: pins[2].x * width, y: pins[2].y * height };
      const p3 = { x: pins[3].x * width, y: pins[3].y * height };

      // Triangle 1: Source (0,0)-(1800,0)-(0,1800) -> Target p0-p1-p3
      drawTriangleTexture(ctx, offscreen, p0.x, p0.y, p1.x, p1.y, p3.x, p3.y, 0, 1800, 0, 0, 0, 1800);
      // Triangle 2: Source (1800,0)-(1800,1800)-(0,1800) -> Target p1-p2-p3
      drawTriangleTexture(ctx, offscreen, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, 1800, 1800, 0, 0, 1800, 1800);

      // 3.1 Overlay original shadows and lighting using multiply blend operation
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.7; // Sweet spot for shadow blending
      ctx.drawImage(backgroundImage, 0, 0, width, height);
      ctx.restore();
    }

    // 4. Draw Helper Polygon Border and Draggable Anchor Pins
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pins[0].x * width, pins[0].y * height);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(pins[i].x * width, pins[i].y * height);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw handles
    pins.forEach((pin, index) => {
      const px = pin.x * width;
      const py = pin.y * height;

      // Circle Handle
      ctx.fillStyle = index === draggingPinIndex ? '#ffffff' : 'var(--accent-gold)';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Canvas Interactions: Dragging pins
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    // Find if clicked near any pin (15px radius threshold)
    const clickedIndex = pins.findIndex(pin => {
      const px = pin.x * width;
      const py = pin.y * height;
      const dist = Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2);
      return dist < 16;
    });

    if (clickedIndex !== -1) {
      setDraggingPinIndex(clickedIndex);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingPinIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    // Normalize coordinates back to ratios (0 to 1) and clamp within boundaries
    const newX = Math.max(0, Math.min(1, mouseX / width));
    const newY = Math.max(0, Math.min(1, mouseY / height));

    const updatedPins = [...pins];
    updatedPins[draggingPinIndex] = { x: newX, y: newY };
    setPins(updatedPins);
  };

  const handleMouseUp = () => {
    setDraggingPinIndex(null);
  };

  // Support for mobile touch drag events
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  // Custom User Image Upload Handler
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
        // Reset pins to default center quad
        setPins([
          { x: 0.25, y: 0.45 },
          { x: 0.75, y: 0.45 },
          { x: 0.85, y: 0.85 },
          { x: 0.15, y: 0.85 }
        ]);
      };
    };
    reader.readAsDataURL(file);
  };

  // Reset visualizer coordinates
  const handleReset = () => {
    if (selectedPreset) {
      setPins(selectedPreset.pins);
    } else {
      setPins([
        { x: 0.25, y: 0.45 },
        { x: 0.75, y: 0.45 },
        { x: 0.85, y: 0.85 },
        { x: 0.15, y: 0.85 }
      ]);
    }
  };

  // Download resulting layout composition
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw a clean final canvas without anchor points for download
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    const cleanCtx = cleanCanvas.getContext('2d');

    // Draw background
    cleanCtx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw warped tiles
    if (tileImage) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 1800;
      offscreen.height = 1800;
      const oCtx = offscreen.getContext('2d');

      oCtx.fillStyle = studioGroutColor;
      oCtx.fillRect(0, 0, 1800, 1800);

      const baseW = (activeProduct?.width || 60) * 1.5;
      const baseH = (activeProduct?.height || 120) * 1.5;
      const tileW = baseW * tileScale;
      const tileH = baseH * tileScale;

      oCtx.save();
      oCtx.translate(900, 900);
      let rotationAngle = (tileRotation * Math.PI) / 180;
      if (studioLayPattern === 'diagonal') rotationAngle += Math.PI / 4;
      oCtx.rotate(rotationAngle);
      oCtx.translate(-900, -900);

      const stepX = tileW + parseInt(studioGroutWidth, 10);
      const stepY = tileH + parseInt(studioGroutWidth, 10);

      for (let x = -tileW * 2; x < 1800 + tileW * 2; x += stepX) {
        for (let y = -tileH * 2; y < 1800 + tileH * 2; y += stepY) {
          oCtx.drawImage(tileImage, x, y, tileW, tileH);
        }
      }
      oCtx.restore();

      const p0 = { x: pins[0].x * canvas.width, y: pins[0].y * canvas.height };
      const p1 = { x: pins[1].x * canvas.width, y: pins[1].y * canvas.height };
      const p2 = { x: pins[2].x * canvas.width, y: pins[2].y * canvas.height };
      const p3 = { x: pins[3].x * canvas.width, y: pins[3].y * canvas.height };

      drawTriangleTexture(cleanCtx, offscreen, p0.x, p0.y, p1.x, p1.y, p3.x, p3.y, 0, 1800, 0, 0, 0, 1800);
      drawTriangleTexture(cleanCtx, offscreen, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, 1800, 1800, 0, 0, 1800, 1800);

      // Overlay original shadows and lighting for clean download
      cleanCtx.save();
      cleanCtx.beginPath();
      cleanCtx.moveTo(p0.x, p0.y);
      cleanCtx.lineTo(p1.x, p1.y);
      cleanCtx.lineTo(p2.x, p2.y);
      cleanCtx.lineTo(p3.x, p3.y);
      cleanCtx.closePath();
      cleanCtx.clip();
      cleanCtx.globalCompositeOperation = 'multiply';
      cleanCtx.globalAlpha = 0.7;
      cleanCtx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      cleanCtx.restore();
    }

    const dataUrl = cleanCanvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `seramikbak_${activeProduct?.code || 'tasarim'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Control Panel */}
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
        {/* Preset Rooms Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>Hazır Odalar:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {ROOM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                style={{
                  fontSize: '0.72rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: selectedPreset?.id === preset.id ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedPreset?.id === preset.id ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: selectedPreset?.id === preset.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Image Upload Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
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
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'var(--accent-gold)',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: '800',
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

      {/* Editor Main Section Split */}
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{
              display: 'block',
              cursor: draggingPinIndex !== null ? 'grabbing' : 'default',
              maxWidth: '100%'
            }}
          />

          {/* Interactive Help Box */}
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
            <HelpCircle size={12} style={{ color: 'var(--accent-gold)' }} />
            <span>Köşelerdeki altın pinleri sürükleyerek döşeme alanını belirleyin.</span>
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
            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--accent-gold)', display: 'block', textTransform: 'uppercase' }}>Seçili Karolar</span>
            <strong style={{ fontSize: '0.78rem', color: '#fff', display: 'block', margin: '2px 0' }}>{activeProduct?.name || 'Seramik'}</strong>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{activeProduct?.width}x{activeProduct?.height} cm • {activeProduct?.finish}</span>
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
              style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
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
                  border: tileRotation === 0 ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                  background: tileRotation === 0 ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: tileRotation === 0 ? 'var(--accent-gold)' : '#94a3b8',
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
                  border: tileRotation === 90 ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                  background: tileRotation === 90 ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: tileRotation === 90 ? 'var(--accent-gold)' : '#94a3b8',
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
                  border: studioLayPattern === 'flat' ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                  background: studioLayPattern === 'flat' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: studioLayPattern === 'flat' ? 'var(--accent-gold)' : '#94a3b8',
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
                  border: studioLayPattern === 'diagonal' ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                  background: studioLayPattern === 'diagonal' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: studioLayPattern === 'diagonal' ? 'var(--accent-gold)' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Çapraz (45°)
              </button>
            </div>
          </div>

          {/* Grout Width */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Derz Kalınlığı</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {['1', '2', '3', '5'].map(w => (
                <button
                  key={w}
                  onClick={() => setStudioGroutWidth(parseInt(w, 10))}
                  style={{
                    fontSize: '0.65rem',
                    padding: '4px',
                    borderRadius: '4px',
                    border: studioGroutWidth === parseInt(w, 10) ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.06)',
                    background: studioGroutWidth === parseInt(w, 10) ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: studioGroutWidth === parseInt(w, 10) ? 'var(--accent-gold)' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  {w}mm
                </button>
              ))}
            </div>
          </div>

          {/* Grout Color */}
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Derz Rengi</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'Beyaz', color: '#ffffff' },
                { name: 'Açık Gri', color: '#c0c0c0' },
                { name: 'Koyu Gri', color: '#555555' },
                { name: 'Krem', color: '#e8dcba' },
                { name: 'Siyah', color: '#111111' }
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setStudioGroutColor(c.color)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: c.color,
                    border: studioGroutColor === c.color ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={c.name}
                />
              ))}
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
                border: 'none',
                background: 'rgba(197, 160, 89, 0.15)',
                color: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
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
              onClick={handleReset}
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
              <span>Köşeleri Sıfırla</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
