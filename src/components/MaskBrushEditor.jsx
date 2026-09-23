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
  Sliders
} from 'lucide-react';

/**
 * MaskBrushEditor.jsx
 * ===================
 * Interactive manual mask editor for SeramikBak AI room remodel.
 * Allows users to inspect AI-detected surfaces, add custom tile zones (+ Alan Ekle),
 * or erase / protect fixtures (- Alan Çıkar).
 */
export default function MaskBrushEditor({ 
  backgroundImage, 
  initialMask, 
  onSaveMask, 
  onCancel 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('add'); // 'add' (brush) | 'erase' (eraser)
  const [brushSize, setBrushSize] = useState(25);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showOverlay, setShowOverlay] = useState(true);

  // Initialize canvas with background image and initial polygon mask
  useEffect(() => {
    if (!backgroundImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxW = 900;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }

      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);

      // If initialMask is already a drawn HTML5 Canvas from previous brush session
      if (typeof HTMLCanvasElement !== 'undefined' && initialMask instanceof HTMLCanvasElement) {
        ctx.drawImage(initialMask, 0, 0, w, h);
      } else {
        // Draw floor polygon if present
        if (initialMask?.floor?.polygon && initialMask.floor.polygon.length >= 3) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)'; // Sky blue tile mask
          ctx.beginPath();
          const poly = initialMask.floor.polygon;
          ctx.moveTo((poly[0][0] / 100) * w, (poly[0][1] / 100) * h);
          for (let i = 1; i < poly.length; i++) {
            ctx.lineTo((poly[i][0] / 100) * w, (poly[i][1] / 100) * h);
          }
          ctx.closePath();
          ctx.fill();

          // Exclusions
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
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
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

      // Save initial state to history
      saveHistory();
    };

    img.src = backgroundImage;
  }, [backgroundImage, initialMask]);

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-10), dataUrl]);
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

  const handleFillFloor = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);
    saveHistory();
  };

  const handleFillWall = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.80);
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
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const [x, y] = getCanvasCoords(e);

    ctx.save();
    if (tool === 'add') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    onSaveMask({
      maskCanvas: canvas,
      maskDataUrl: canvas.toDataURL()
    });
  };

  return (
    <div style={{
      background: 'rgba(10, 15, 26, 0.98)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '920px',
      margin: '0 auto'
    }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#38bdf8' }} />
            <span>Akıllı Yüzey & Maske Düzeltme</span>
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Mavi alanlar seramik döşenecek bölgelerdir. Fırça ile boyayabilir, silgi ile lavabo ve mobilyaları temizleyebilirsiniz.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🧹 Sıfırla
          </button>

          <button
            type="button"
            onClick={handleFillFloor}
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🏠 Tabanı Seç
          </button>

          <button
            type="button"
            onClick={handleFillWall}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🧱 Duvarı Seç
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: history.length <= 1 ? '#64748b' : '#ffffff',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: history.length <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Geri Al</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showOverlay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: showOverlay ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
              color: showOverlay ? '#38bdf8' : '#cbd5e1',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Eye size={14} />
            <span>{showOverlay ? 'Maskeyi Gizle' : 'Maskeyi Göster'}</span>
          </button>
        </div>
      </div>

      {/* Tool Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 16px', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setTool('add')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: tool === 'add' ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
              color: tool === 'add' ? '#090d16' : '#ffffff',
              border: tool === 'add' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Paintbrush size={14} />
            <span>+ Alan Ekle</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('erase')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: tool === 'erase' ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: tool === 'erase' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Eraser size={14} />
            <span>- Alan Çıkar (Silgi)</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Fırça Boyutu:</span>
          <input
            type="range"
            min="8"
            max="60"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '120px', accentColor: '#38bdf8' }}
          />
          <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', width: '28px' }}>
            {brushSize}px
          </span>
        </div>
      </div>

      {/* Interactive Painting Canvas Stage */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#000000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          touchAction: 'none'
        }}
      >
        {/* Underlay Room Photo */}
        <img
          src={backgroundImage}
          alt="Room for masking"
          style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
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
            cursor: tool === 'add' ? 'crosshair' : 'cell',
            opacity: showOverlay ? 0.85 : 0,
            transition: 'opacity 0.2s ease'
          }}
        />
      </div>

      {/* Bottom Action Confirm Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
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
            padding: '10px 22px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
          }}
        >
          <Check size={16} />
          <span>Maskeyi Onayla & Render'a Geç</span>
        </button>
      </div>
    </div>
  );
}
