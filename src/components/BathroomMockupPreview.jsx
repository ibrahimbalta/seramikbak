'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, Sparkles, Layers, Maximize2 } from 'lucide-react';

export default function BathroomMockupPreview({ product, onOpenStudio }) {
  const [viewMode, setViewMode] = useState('full'); // 'full' | 'wall' | 'floor'
  const [isLoaded, setIsLoaded] = useState(false);
  const [textureImg, setTextureImg] = useState(null);
  const canvasRef = useRef(null);

  const style = product?.style || 'Mermer';
  const color = product?.color || 'Beyaz';
  const finish = product?.finish || 'Parlak';
  const width = product?.width || 60;
  const height = product?.height || 120;
  const tileImgUrl = product?.imageUrl || product?.textureUrl || '/textures/calacatta_gold.jpg';

  // Load Tile Texture
  useEffect(() => {
    if (!tileImgUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const proxyUrl = tileImgUrl.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(tileImgUrl)}` : tileImgUrl;
    img.src = proxyUrl;

    img.onload = () => {
      setTextureImg(img);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setTextureImg(null);
      setIsLoaded(true);
    };
  }, [tileImgUrl]);

  // Draw Dynamic Realistic Bathroom Scene on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    const isWood = style.toLowerCase().includes('ahşap') || style.toLowerCase().includes('parke');
    const isDark = color.toLowerCase().includes('antrasit') || color.toLowerCase().includes('siyah') || color.toLowerCase().includes('füme');
    const isBeige = color.toLowerCase().includes('bej') || color.toLowerCase().includes('krem');
    const isElongated = (width / height >= 2.5) || (height / width >= 2.5);

    // -------------------------------------------------------------
    // 1. GENERATE HIGH-REALISM TILE PATTERN
    // -------------------------------------------------------------
    let pattern;
    if (textureImg) {
      const pCanvas = document.createElement('canvas');
      const pCtx = pCanvas.getContext('2d');

      if (isWood || isElongated) {
        // Wood Plank Staggered Layout (Plank / Parke Dizilimi)
        const plankW = 120;
        const plankH = Math.max(24, Math.round(120 / (height / width || 4)));
        pCanvas.width = plankW * 2;
        pCanvas.height = plankH * 2;

        // Row 1
        pCtx.drawImage(textureImg, 0, 0, plankW, plankH);
        pCtx.drawImage(textureImg, plankW, 0, plankW, plankH);
        // Row 2 (Staggered offset by 50%)
        pCtx.drawImage(textureImg, -plankW / 2, plankH, plankW, plankH);
        pCtx.drawImage(textureImg, plankW / 2, plankH, plankW, plankH);
        pCtx.drawImage(textureImg, (plankW * 3) / 2, plankH, plankW, plankH);

        // Subtle realistic tile joints (grout lines)
        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        pCtx.lineWidth = 1.5;
        pCtx.strokeRect(0, 0, plankW, plankH);
        pCtx.strokeRect(plankW, 0, plankW, plankH);
        pCtx.strokeRect(-plankW / 2, plankH, plankW, plankH);
        pCtx.strokeRect(plankW / 2, plankH, plankW, plankH);
      } else {
        // Standard Grid Layout (Mermer / Beton / Seramik Karo)
        const tileW = Math.max(50, Math.min(140, Math.round((width / 60) * 80)));
        const tileH = Math.max(40, Math.min(140, Math.round(tileW / (width / height))));
        pCanvas.width = tileW;
        pCanvas.height = tileH;

        pCtx.drawImage(textureImg, 0, 0, tileW, tileH);
        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
        pCtx.lineWidth = 1.5;
        pCtx.strokeRect(0, 0, tileW, tileH);
      }

      pattern = ctx.createPattern(pCanvas, 'repeat');
    } else {
      // High-Quality Procedural Texture Generator (Fallback)
      const pCanvas = document.createElement('canvas');
      const tileW = isWood ? 140 : 80;
      const tileH = isWood ? 32 : 120;
      pCanvas.width = tileW;
      pCanvas.height = tileH;
      const pCtx = pCanvas.getContext('2d');

      let baseHex = '#e2e8f0';
      if (style === 'Mermer') baseHex = isDark ? '#1a1f29' : (isBeige ? '#f5eee6' : '#f8fafc');
      else if (isWood) baseHex = isDark ? '#3d2b1f' : (isBeige ? '#cfa672' : '#8c5a34');
      else if (style === 'Beton') baseHex = isBeige ? '#d6c7b2' : '#8d94a0';

      pCtx.fillStyle = baseHex;
      pCtx.fillRect(0, 0, tileW, tileH);

      // Veins & Organic Details
      if (style === 'Mermer') {
        pCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(160,140,110,0.22)';
        pCtx.lineWidth = 1.5;
        pCtx.beginPath();
        pCtx.moveTo(10, 5);
        pCtx.bezierCurveTo(25, 30, 45, 60, 70, 115);
        pCtx.stroke();
      } else if (isWood) {
        pCtx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let i = 0; i < tileH; i += 4) {
          pCtx.fillRect(0, i, tileW, 1.5);
        }
      }

      pCtx.strokeStyle = 'rgba(0,0,0,0.15)';
      pCtx.lineWidth = 1.5;
      pCtx.strokeRect(0, 0, tileW, tileH);
      pattern = ctx.createPattern(pCanvas, 'repeat');
    }

    // -------------------------------------------------------------
    // 2. RENDER WALL & FLOOR LAYERS
    // -------------------------------------------------------------
    const horizonY = ch * 0.64; // 64% Wall, 36% Floor

    // WALL LAYER
    ctx.save();
    if (viewMode === 'wall' || viewMode === 'full') {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, cw, horizonY);
    } else {
      const darkWall = ctx.createLinearGradient(0, 0, 0, horizonY);
      darkWall.addColorStop(0, '#1a1e27');
      darkWall.addColorStop(1, '#0e1117');
      ctx.fillStyle = darkWall;
      ctx.fillRect(0, 0, cw, horizonY);
    }
    ctx.restore();

    // FLOOR LAYER (Perspective Projection)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(cw, horizonY);
    ctx.lineTo(cw * 1.25, ch);
    ctx.lineTo(-cw * 0.25, ch);
    ctx.closePath();
    ctx.clip();

    if (viewMode === 'floor' || viewMode === 'full') {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);

      // Floor Depth Shadow (Darker towards back wall)
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, ch);
      floorGrad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
      floorGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.12)');
      floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);
    } else {
      const darkFloor = ctx.createLinearGradient(0, horizonY, 0, ch);
      darkFloor.addColorStop(0, '#0f131a');
      darkFloor.addColorStop(1, '#07090d');
      ctx.fillStyle = darkFloor;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);
    }
    ctx.restore();

    // Wall-Floor Baseboard Trim Line
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(cw, horizonY);
    ctx.stroke();

    // Ambient Lighting & Specular Reflection (Gloss Sheen)
    if (finish === 'Parlak' || finish === 'Lapatto') {
      const glossGrad = ctx.createLinearGradient(0, 0, cw, horizonY);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      glossGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.04)');
      glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(0, 0, cw, horizonY);
    }

    // Top-Right Soft Spotlight
    const spotlight = ctx.createRadialGradient(cw * 0.8, 40, 10, cw * 0.8, 40, cw * 0.7);
    spotlight.addColorStop(0, 'rgba(255, 240, 200, 0.22)');
    spotlight.addColorStop(0.6, 'rgba(255, 240, 200, 0.04)');
    spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, cw, ch);

    // Side Wall Depth Corner Vignette
    const leftShadow = ctx.createLinearGradient(0, 0, 60, 0);
    leftShadow.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    leftShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(0, 0, 60, ch);

    const rightShadow = ctx.createLinearGradient(cw, 0, cw - 60, 0);
    rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rightShadow;
    ctx.fillRect(cw - 60, 0, 60, ch);

    // -------------------------------------------------------------
    // 3. ELEGANT MODERN BATHROOM FURNITURE (KARE AYNA & SLEEK DOLAP)
    // -------------------------------------------------------------

    // --- A) SQUARE / RECTANGULAR LED MIRROR CABINET (KARE AYNALI DOLAP) ---
    const mirrorW = cw * 0.24; // Compact elegant square/rectangle
    const mirrorH = ch * 0.30;
    const mirrorX = (cw - mirrorW) / 2;
    const mirrorY = ch * 0.16;

    // LED Backlight Halo Glow (Warm soft glow behind mirror)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 235, 190, 0.6)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255, 245, 220, 0.9)';
    ctx.fillRect(mirrorX - 2, mirrorY - 2, mirrorW + 4, mirrorH + 4);
    ctx.restore();

    // Mirror Cabinet Outer Frame (Brushed Champagne Gold)
    ctx.fillStyle = '#222834';
    ctx.fillRect(mirrorX, mirrorY, mirrorW, mirrorH);
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH);

    // Mirror Glass Surface Gradient
    const glassGrad = ctx.createLinearGradient(mirrorX, mirrorY, mirrorX + mirrorW, mirrorY + mirrorH);
    glassGrad.addColorStop(0, 'rgba(235, 244, 255, 0.42)');
    glassGrad.addColorStop(0.5, 'rgba(200, 225, 250, 0.18)');
    glassGrad.addColorStop(1, 'rgba(160, 190, 225, 0.3)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(mirrorX + 2, mirrorY + 2, mirrorW - 4, mirrorH - 4);

    // Dual Mirror Cabinet Door Split Line (Kare Aynalı Dolap Çift Kapak Çizgisi)
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mirrorX + mirrorW / 2, mirrorY + 2);
    ctx.lineTo(mirrorX + mirrorW / 2, mirrorY + mirrorH - 2);
    ctx.stroke();

    // Diagonal Glass Reflection Highlight Streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.moveTo(mirrorX + 6, mirrorY + 4);
    ctx.lineTo(mirrorX + mirrorW * 0.45, mirrorY + 4);
    ctx.lineTo(mirrorX + mirrorW * 0.15, mirrorY + mirrorH - 4);
    ctx.lineTo(mirrorX + 6, mirrorY + mirrorH - 4);
    ctx.closePath();
    ctx.fill();

    // Subtle LED Touch Sensor Icon on Mirror
    ctx.fillStyle = '#c5a059';
    ctx.beginPath();
    ctx.arc(mirrorX + mirrorW / 2, mirrorY + mirrorH - 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // --- B) COMPACT ELEGANT FLOATING VANITY CABINET (ZARİF BANYO DOLABI) ---
    const vanityW = cw * 0.30; // Compact & proportional (not bulky!)
    const vanityH = ch * 0.10;
    const vanityX = (cw - vanityW) / 2;
    const vanityY = horizonY - vanityH - 8; // Floating just above horizon line

    // Wall & Floor Drop Shadow under Vanity
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(vanityX - 8, vanityY + vanityH, vanityW + 16, 16);

    // Floating Wooden/Slate Cabinet Body
    const cabinetGrad = ctx.createLinearGradient(vanityX, vanityY, vanityX, vanityY + vanityH);
    cabinetGrad.addColorStop(0, '#272d38');
    cabinetGrad.addColorStop(1, '#151922');
    ctx.fillStyle = cabinetGrad;
    
    // Rounded cabinet body
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(vanityX + r, vanityY);
    ctx.lineTo(vanityX + vanityW - r, vanityY);
    ctx.quadraticCurveTo(vanityX + vanityW, vanityY, vanityX + vanityW, vanityY + r);
    ctx.lineTo(vanityX + vanityW, vanityY + vanityH - r);
    ctx.quadraticCurveTo(vanityX + vanityW, vanityY + vanityH, vanityX + vanityW - r, vanityY + vanityH);
    ctx.lineTo(vanityX + r, vanityY + vanityH);
    ctx.quadraticCurveTo(vanityX, vanityY + vanityH, vanityX, vanityY + vanityH - r);
    ctx.lineTo(vanityX, vanityY + r);
    ctx.quadraticCurveTo(vanityX, vanityY, vanityX + r, vanityY);
    ctx.closePath();
    ctx.fill();

    // Metallic Brass Trim Rim on Cabinet
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Drawer Seam Line & Minimalist Handle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vanityX + 8, vanityY + vanityH / 2);
    ctx.lineTo(vanityX + vanityW - 8, vanityY + vanityH / 2);
    ctx.stroke();

    // Sleek Brass Drawer Handles
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(vanityX + vanityW * 0.35, vanityY + 6, vanityW * 0.30, 2.5);
    ctx.fillRect(vanityX + vanityW * 0.35, vanityY + vanityH / 2 + 6, vanityW * 0.30, 2.5);

    // --- C) COUNTERTOP CERAMIC VESSEL BASIN (TEZGAH ÜSTÜ ÇANAK LAVABO) ---
    const basinW = vanityW * 0.52;
    const basinH = 14;
    const basinX = (cw - basinW) / 2;
    const basinY = vanityY - 12;

    // Basin Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(basinX + basinW / 2, basinY + basinH / 2 + 3, basinW / 2 + 2, basinH / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Porcelain Sink Bowl
    const sinkGrad = ctx.createLinearGradient(basinX, basinY, basinX, basinY + basinH);
    sinkGrad.addColorStop(0, '#ffffff');
    sinkGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = sinkGrad;
    ctx.beginPath();
    ctx.ellipse(basinX + basinW / 2, basinY + basinH / 2, basinW / 2, basinH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // High Spout Gold Mixer Faucet (Pirinç Lüks Batarya)
    const faucetX = basinX + basinW / 2;
    const faucetY = basinY - 22;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(faucetX, basinY + 1);
    ctx.lineTo(faucetX, faucetY);
    ctx.lineTo(faucetX - 10, faucetY + 5);
    ctx.stroke();

    // --- D) SLEEK GLASS SHOWER SCREEN (SOL CAM DUŞ PANELİ) ---
    const glassW = cw * 0.15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, glassW, horizonY + 20);
    
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(glassW, 0);
    ctx.lineTo(glassW, horizonY + 20);
    ctx.stroke();

    const glassSheen = ctx.createLinearGradient(0, 0, glassW, horizonY);
    glassSheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    glassSheen.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = glassSheen;
    ctx.fillRect(0, 0, glassW, horizonY + 20);

  }, [viewMode, textureImg, isLoaded, style, color, finish, width, height]);

  return (
    <div className="bathroom-mockup-box">
      <div className="mockup-header-row">
        <div className="mockup-title-group">
          <div className="mockup-badge-live">
            <Sparkles size={14} className="sparkle-anim" />
            <span>3D Banyo Döşeme Simülasyonu</span>
          </div>
          <p className="mockup-subtitle">Bu seramiğin modern banyo ortamındaki gerçekçi döşenmiş görünümü</p>
        </div>

        {/* View Angle Switcher */}
        <div className="mockup-mode-tabs">
          <button 
            className={`mockup-tab-btn ${viewMode === 'full' ? 'active' : ''}`}
            onClick={() => setViewMode('full')}
            title="Duvar & Zemin Tam Banyo"
          >
            <Layers size={13} />
            <span>Tam Banyo</span>
          </button>
          <button 
            className={`mockup-tab-btn ${viewMode === 'wall' ? 'active' : ''}`}
            onClick={() => setViewMode('wall')}
            title="Banyo Duvarı Kaplama"
          >
            <span>Duvar</span>
          </button>
          <button 
            className={`mockup-tab-btn ${viewMode === 'floor' ? 'active' : ''}`}
            onClick={() => setViewMode('floor')}
            title="Banyo Zemin Kaplama"
          >
            <span>Zemin</span>
          </button>
        </div>
      </div>

      {/* Larger High-Definition Render Canvas */}
      <div className="mockup-canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={560} 
          className="mockup-canvas-element"
        />

        {/* Floating Product Badge */}
        <div className="mockup-floating-info">
          <span className="info-dot"></span>
          <span>{product?.brand?.name || 'Seramik'} — {product?.name} ({width}x{height} cm {finish})</span>
        </div>

        {/* Fullscreen Studio Launcher */}
        {onOpenStudio && (
          <button onClick={onOpenStudio} className="mockup-studio-launch-btn">
            <Maximize2 size={13} />
            <span>3D Stüdyoda Tam Ekran İncele</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .bathroom-mockup-box {
          background: rgba(15, 19, 27, 0.85);
          border: 1px solid rgba(197, 160, 89, 0.3);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }

        .bathroom-mockup-box:hover {
          border-color: rgba(197, 160, 89, 0.55);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
        }

        .mockup-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .mockup-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mockup-badge-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.02em;
        }

        .sparkle-anim {
          animation: pulseGlow 2s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 8px #d4af37); }
        }

        .mockup-subtitle {
          font-size: 0.68rem;
          color: #94a3b8;
          margin: 0;
        }

        .mockup-mode-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.45);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mockup-tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
        }

        .mockup-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .mockup-tab-btn.active {
          background: rgba(197, 160, 89, 0.25);
          color: #d4af37;
          border: 1px solid rgba(197, 160, 89, 0.4);
        }

        .mockup-canvas-wrapper {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #090c10;
          border: 1px solid rgba(255, 255, 255, 0.12);
          aspect-ratio: 16 / 11;
          min-height: 340px;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
        }

        .mockup-canvas-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mockup-floating-info {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(9, 12, 16, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
          z-index: 2;
        }

        .info-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }

        .mockup-studio-launch-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(197, 160, 89, 0.92);
          color: #090c10;
          border: none;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          transition: all 0.25s ease;
          z-index: 2;
        }

        .mockup-studio-launch-btn:hover {
          background: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(212, 175, 55, 0.45);
        }
      `}</style>
    </div>
  );
}
