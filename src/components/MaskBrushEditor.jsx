'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Paintbrush, 
  Eraser, 
  RotateCcw, 
  Check, 
  X, 
  Eye, 
  Layers,
  Sparkles,
  ShieldCheck,
  Undo2
} from 'lucide-react';

/**
 * MaskBrushEditor.jsx
 * ===================
 * Interactive surface boundary & fixture protection mask editor.
 * Allows users to inspect and refine tile regions, with dedicated tools
 * to protect bathtubs, sinks, toilets, vanities, and baseboards from tile overlap.
 * 
 * Generates solid binary alpha masks (Alpha 1.0 on tiles, Alpha 0.0 on protected fixtures)
 * so TilePerspectiveEngine keeps original photo pixels 100% pristine.
 */
export default function MaskBrushEditor({ 
  backgroundImage, 
  initialMask, 
  onSaveMask, 
  onCancel 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastPosRef = useRef(null);

  const [tool, setTool] = useState('erase'); // Default to 'erase' to encourage protecting bathtub/fixtures
  const [brushSize, setBrushSize] = useState(28);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [imgDim, setImgDim] = useState({ w: 900, h: 600 });

  // Initialize canvas with background image and initial polygon mask
  useEffect(() => {
    if (!backgroundImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxW = 1100;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }

      setImgDim({ w, h });
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);

      // If initialMask is already a drawn HTML5 Canvas from previous brush session
      if (typeof HTMLCanvasElement !== 'undefined' && initialMask instanceof HTMLCanvasElement) {
        ctx.drawImage(initialMask, 0, 0, w, h);
      } else {
        // Draw floor polygon with solid #38bdf8 (Alpha 1.0)
        if (initialMask?.floor?.polygon && initialMask.floor.polygon.length >= 3) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          const poly = initialMask.floor.polygon;
          ctx.moveTo((poly[0][0] / 100) * w, (poly[0][1] / 100) * h);
          for (let i = 1; i < poly.length; i++) {
            ctx.lineTo((poly[i][0] / 100) * w, (poly[i][1] / 100) * h);
          }
          ctx.closePath();
          ctx.fill();

          // Exclusions (punch holes)
          if (initialMask.floor.exclude && initialMask.floor.exclude.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            initialMask.floor.exclude.forEach((exc) => {
              if (exc && exc.length >= 3) {
                ctx.beginPath();
                ctx.moveTo((exc[0][0] / 100) * w, (exc[0][1] / 100) * h);
                for (let k = 1; k < exc.length; k++) {
                  ctx.lineTo((exc[k][0] / 100) * w, (exc[k][1] / 100) * h);
                }
                ctx.closePath();
                ctx.fill();
              }
            });
            ctx.restore();
          }
        }

        // Draw wall polygons if present
        const walls = Array.isArray(initialMask?.walls) ? initialMask.walls : (initialMask?.walls ? [initialMask.walls] : []);
        walls.forEach((wall) => {
          if (wall?.polygon && wall.polygon.length >= 3) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            const poly = wall.polygon;
            ctx.moveTo((poly[0][0] / 100) * w, (poly[0][1] / 100) * h);
            for (let i = 1; i < poly.length; i++) {
              ctx.lineTo((poly[i][0] / 100) * w, (poly[i][1] / 100) * h);
            }
            ctx.closePath();
            ctx.fill();
          }
        });
      }

      // Save initial state to undo stack
      saveHistory();
    };

    img.src = backgroundImage;
  }, [backgroundImage, initialMask]);

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-12), dataUrl]);
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prevState;
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  // Restore floor polygon
  const handleRestorePolygon = () => {
    if (!canvasRef.current || !initialMask?.floor?.polygon) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    const poly = initialMask.floor.polygon;
    ctx.moveTo((poly[0][0] / 100) * w, (poly[0][1] / 100) * h);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo((poly[i][0] / 100) * w, (poly[i][1] / 100) * h);
    }
    ctx.closePath();
    ctx.fill();
    saveHistory();
  };

  // Quick preset: Protect left bathtub/fixture
  const handleProtectLeftBathtub = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Erase left 35% of floor depth
    ctx.rect(0, h * 0.40, w * 0.35, h * 0.60);
    ctx.fill();
    ctx.restore();
    saveHistory();
  };

  // Quick preset: Protect right bathtub/fixture
  const handleProtectRightBathtub = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Erase right 35% of floor depth
    ctx.rect(w * 0.65, h * 0.40, w * 0.35, h * 0.60);
    ctx.fill();
    ctx.restore();
    saveHistory();
  };

  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return [0, 0];
    const canvas = canvasRef.current;
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

    return [
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    ];
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const [x, y] = getCanvasCoords(e);
    lastPosRef.current = { x, y };
    paintStroke(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPosRef.current = null;
      saveHistory();
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const [x, y] = getCanvasCoords(e);
    paintStroke(x, y);
  };

  const paintStroke = (x, y) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    if (tool === 'add') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#38bdf8';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize * 2;

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    lastPosRef.current = { x, y };
  };

  // Convert painted display canvas to solid binary alpha mask on export
  const handleApply = () => {
    if (!canvasRef.current) return;
    const srcCanvas = canvasRef.current;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = srcCanvas.width;
    exportCanvas.height = srcCanvas.height;
    const eCtx = exportCanvas.getContext('2d');

    const srcCtx = srcCanvas.getContext('2d');
    const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const data = imgData.data;

    // Binary solid mask: painted areas become 100% solid white, erased areas become 0% transparent
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 20) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255; // Solid 1.0 alpha
      } else {
        data[i + 3] = 0; // Pure transparent
      }
    }
    eCtx.putImageData(imgData, 0, 0);

    onSaveMask({
      maskCanvas: exportCanvas,
      maskDataUrl: exportCanvas.toDataURL()
    });
  };

  return (
    <div style={{
      background: 'rgba(8, 12, 22, 0.98)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      borderRadius: '16px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '960px',
      width: '100%',
      maxHeight: '94vh',
      overflowY: 'auto',
      margin: '0 auto',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
    }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#38bdf8' }} />
            <span>Küvet, Lavabo ve Zemin Sınırları Maskesi</span>
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            <strong style={{ color: '#38bdf8' }}>Mavi parlak alanlar</strong> seramik döşenecek zemin bölgesidir. Küvet, klozet, lavabo veya mobilyaları silerek seramikten koruyun.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleRestorePolygon}
            title="Dört köşe poligonunu yeniden doldur"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#f3d375',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🏠 Tüm Poligon
          </button>

          <button
            type="button"
            onClick={handleProtectLeftBathtub}
            title="Sol taraftaki küvet veya duşakabini seramikten koru"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🛁 Sol Küveti Koru
          </button>

          <button
            type="button"
            onClick={handleProtectRightBathtub}
            title="Sağ taraftaki küvet veya mobilyayı seramikten koru"
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🛁 Sağ Küveti Koru
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🧹 Sıfırla
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: history.length <= 1 ? '#64748b' : '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: history.length <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <Undo2 size={13} />
            <span>Geri Al</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: showOverlay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: showOverlay ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
              color: showOverlay ? '#38bdf8' : '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Eye size={13} />
            <span>{showOverlay ? 'Maskeyi Gizle' : 'Maskeyi Göster'}</span>
          </button>
        </div>
      </div>

      {/* Tool Selector & Brush Control Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: 'rgba(255, 255, 255, 0.04)', 
        padding: '10px 16px', 
        borderRadius: '12px', 
        flexWrap: 'wrap', 
        gap: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setTool('erase')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: tool === 'erase' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: tool === 'erase' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: tool === 'erase' ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <Eraser size={15} />
            <span>Küvet / Eşya Silgisi (-)</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('add')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: tool === 'add' ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.06)',
              color: tool === 'add' ? '#090d16' : '#ffffff',
              border: tool === 'add' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: tool === 'add' ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <Paintbrush size={15} />
            <span>Zemin Alanı Ekle (+)</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: '600' }}>Fırça / Silgi Çapı:</span>
          <input
            type="range"
            min="10"
            max="80"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '130px', accentColor: tool === 'erase' ? '#ef4444' : '#38bdf8' }}
          />
          <span style={{ 
            fontSize: '0.78rem', 
            color: '#ffffff', 
            fontWeight: '800', 
            minWidth: '36px',
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {brushSize * 2}px
          </span>
        </div>
      </div>

      {/* Interactive Painting Canvas Stage (Exact Aspect Ratio - Zero Letterbox) */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${imgDim.w} / ${imgDim.h}`,
          maxHeight: '480px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#020617',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          touchAction: 'none',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}
      >
        {/* Underlay Room Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt="Room for masking"
          style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', pointerEvents: 'none' }}
        />

        {/* Overlay Mask Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: tool === 'erase' ? 'cell' : 'crosshair',
            opacity: showOverlay ? 0.55 : 0,
            transition: 'opacity 0.2s ease',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Info Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '10px',
        padding: '8px 14px',
        fontSize: '0.78rem',
        color: '#bae6fd'
      }}>
        <ShieldCheck size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
        <span>
          Silgiyle temizlediğiniz küvet, klozet ve dolap pikselleri orijinal fotoğraftan <strong>%100 korunur</strong> ve seramik dokusu yalnızca mavi alanlara uygulanır.
        </span>
      </div>

      {/* Bottom Action Confirm Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '2px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          İptal
        </button>

        <button
          type="button"
          onClick={handleApply}
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            border: 'none',
            color: '#090d16',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)'
          }}
        >
          <Check size={16} />
          <span>Maskeyi Uygula & Mekânı Yenile</span>
        </button>
      </div>
    </div>
  );
}
