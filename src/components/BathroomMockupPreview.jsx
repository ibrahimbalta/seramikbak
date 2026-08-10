'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, Sparkles, Layers, RefreshCw, ZoomIn, Check } from 'lucide-react';

export default function BathroomMockupPreview({ product, onOpenStudio }) {
  const [viewMode, setViewMode] = useState('wall'); // 'wall' | 'floor' | 'full'
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
      // Fallback: Create procedural texture on canvas if image load fails
      setTextureImg(null);
      setIsLoaded(true);
    };
  }, [tileImgUrl]);

  // Draw Dynamic Bathroom Scene on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    // 1. Create Tile Pattern (From loaded image or procedural generator)
    let pattern;
    if (textureImg) {
      // Scale tile image based on tile dimensions (60x120 vs 120x240)
      const pCanvas = document.createElement('canvas');
      const pAspect = width / height;
      const tilePixelW = Math.max(30, Math.min(120, (width / 60) * 45));
      const tilePixelH = tilePixelW / pAspect;
      pCanvas.width = tilePixelW;
      pCanvas.height = tilePixelH;
      const pCtx = pCanvas.getContext('2d');
      pCtx.drawImage(textureImg, 0, 0, tilePixelW, tilePixelH);

      // Add subtle grout line
      pCtx.strokeStyle = 'rgba(0,0,0,0.12)';
      pCtx.lineWidth = 1;
      pCtx.strokeRect(0, 0, tilePixelW, tilePixelH);

      pattern = ctx.createPattern(pCanvas, 'repeat');
    } else {
      // Procedural texture generation for missing images
      const pCanvas = document.createElement('canvas');
      const tilePixelW = 50;
      const tilePixelH = 90;
      pCanvas.width = tilePixelW;
      pCanvas.height = tilePixelH;
      const pCtx = pCanvas.getContext('2d');

      const isDark = color.toLowerCase().includes('antrasit') || color.toLowerCase().includes('siyah') || color.toLowerCase().includes('füme');
      const isBeige = color.toLowerCase().includes('bej') || color.toLowerCase().includes('krem');
      
      let baseHex = '#e5e7eb';
      if (style === 'Mermer') baseHex = isDark ? '#1e232a' : (isBeige ? '#f3eee7' : '#f8fafc');
      else if (style === 'Ahşap') baseHex = '#8b5e3c';
      else if (style === 'Beton') baseHex = isBeige ? '#d8cbb9' : '#94a3b8';

      pCtx.fillStyle = baseHex;
      pCtx.fillRect(0, 0, tilePixelW, tilePixelH);

      // Veins or texture noise
      if (style === 'Mermer') {
        pCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(150,130,100,0.25)';
        pCtx.lineWidth = 1.5;
        pCtx.beginPath();
        pCtx.moveTo(5, 5);
        pCtx.bezierCurveTo(15, 20, 30, 40, 45, 85);
        pCtx.stroke();
      }

      pCtx.strokeStyle = 'rgba(0,0,0,0.1)';
      pCtx.lineWidth = 1;
      pCtx.strokeRect(0, 0, tilePixelW, tilePixelH);
      pattern = ctx.createPattern(pCanvas, 'repeat');
    }

    // 2. Render Wall / Floor Layers based on View Mode
    // Wall Background
    ctx.save();
    if (viewMode === 'wall' || viewMode === 'full') {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, cw, ch * 0.72);
    } else {
      // Neutral smooth wall painted background when viewing floor only
      const wallGrad = ctx.createLinearGradient(0, 0, 0, ch * 0.72);
      wallGrad.addColorStop(0, '#1e2430');
      wallGrad.addColorStop(1, '#0f1319');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, cw, ch * 0.72);
    }
    ctx.restore();

    // Perspective Floor Layer
    ctx.save();
    const horizonY = ch * 0.72;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(cw, horizonY);
    ctx.lineTo(cw * 1.2, ch);
    ctx.lineTo(-cw * 0.2, ch);
    ctx.closePath();
    ctx.clip();

    if (viewMode === 'floor' || viewMode === 'full') {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);

      // Perspective floor shadow gradient
      const floorShadow = ctx.createLinearGradient(0, horizonY, 0, ch);
      floorShadow.addColorStop(0, 'rgba(0,0,0,0.5)');
      floorShadow.addColorStop(0.3, 'rgba(0,0,0,0.15)');
      floorShadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = floorShadow;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);
    } else {
      // Dark slate floor when wall-only mode
      const darkFloorGrad = ctx.createLinearGradient(0, horizonY, 0, ch);
      darkFloorGrad.addColorStop(0, '#11151c');
      darkFloorGrad.addColorStop(1, '#080a0e');
      ctx.fillStyle = darkFloorGrad;
      ctx.fillRect(0, horizonY, cw, ch - horizonY);
    }
    ctx.restore();

    // 3. Render Architectural Lighting & Gloss Reflection
    if (finish === 'Parlak' || finish === 'Lapatto') {
      const glossGrad = ctx.createLinearGradient(0, 0, cw, ch * 0.72);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      glossGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
      glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(0, 0, cw, ch * 0.72);
    }

    // Wall Baseboard Line
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(cw, horizonY);
    ctx.stroke();

    // Ambient Lighting Glow (Top Right Light Source)
    const lightGlow = ctx.createRadialGradient(cw * 0.85, 30, 10, cw * 0.85, 30, cw * 0.75);
    lightGlow.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
    lightGlow.addColorStop(0.5, 'rgba(255, 235, 180, 0.08)');
    lightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lightGlow;
    ctx.fillRect(0, 0, cw, ch);

    // 4. Render Architectural Bathroom Sanitary Overlay (Mirror, Vanity, Glass Partition, Faucet)
    // LED Backlit Circular Vanity Mirror
    const mirrorX = cw * 0.5;
    const mirrorY = ch * 0.32;
    const mirrorR = cw * 0.18;

    // LED Mirror Halo Glow
    const mirrorHalo = ctx.createRadialGradient(mirrorX, mirrorY, mirrorR * 0.9, mirrorX, mirrorY, mirrorR * 1.35);
    mirrorHalo.addColorStop(0, 'rgba(255, 245, 220, 0.45)');
    mirrorHalo.addColorStop(1, 'rgba(255, 245, 220, 0)');
    ctx.fillStyle = mirrorHalo;
    ctx.beginPath();
    ctx.arc(mirrorX, mirrorY, mirrorR * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Mirror Glass Surface
    ctx.save();
    ctx.beginPath();
    ctx.arc(mirrorX, mirrorY, mirrorR, 0, Math.PI * 2);
    ctx.clip();
    const mirrorGlassGrad = ctx.createLinearGradient(mirrorX - mirrorR, mirrorY - mirrorR, mirrorX + mirrorR, mirrorY + mirrorR);
    mirrorGlassGrad.addColorStop(0, 'rgba(230, 240, 255, 0.35)');
    mirrorGlassGrad.addColorStop(0.5, 'rgba(200, 225, 255, 0.15)');
    mirrorGlassGrad.addColorStop(1, 'rgba(150, 180, 220, 0.25)');
    ctx.fillStyle = mirrorGlassGrad;
    ctx.fill();

    // Reflection Streak on Mirror
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(mirrorX - mirrorR * 0.6, mirrorY - mirrorR);
    ctx.lineTo(mirrorX - mirrorR * 0.2, mirrorY - mirrorR);
    ctx.lineTo(mirrorX + mirrorR * 0.4, mirrorY + mirrorR);
    ctx.lineTo(mirrorX, mirrorY + mirrorR);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Mirror Brass Rim
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mirrorX, mirrorY, mirrorR, 0, Math.PI * 2);
    ctx.stroke();

    // Modern Floating Oak/Dark Vanity Counter Unit
    const vanityW = cw * 0.42;
    const vanityH = ch * 0.12;
    const vanityX = (cw - vanityW) / 2;
    const vanityY = ch * 0.58;

    // Vanity Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(vanityX - 6, vanityY + vanityH, vanityW + 12, 14);

    // Floating Vanity Unit
    const vanityGrad = ctx.createLinearGradient(vanityX, vanityY, vanityX, vanityY + vanityH);
    vanityGrad.addColorStop(0, '#2a2421');
    vanityGrad.addColorStop(1, '#161311');
    ctx.fillStyle = vanityGrad;
    ctx.roundRect ? ctx.roundRect(vanityX, vanityY, vanityW, vanityH, 6) : ctx.fillRect(vanityX, vanityY, vanityW, vanityH);
    ctx.fill();

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Countertop Vessel Basin (Bowl)
    const basinW = vanityW * 0.6;
    const basinH = 18;
    const basinX = (cw - basinW) / 2;
    const basinY = vanityY - 14;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(basinX + basinW / 2, basinY + basinH / 2, basinW / 2, basinH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Gold/Brass Tall Basin Faucet
    const faucetX = basinX + basinW / 2;
    const faucetY = basinY - 26;
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(faucetX, basinY + 2);
    ctx.lineTo(faucetX, faucetY);
    ctx.lineTo(faucetX - 12, faucetY + 6);
    ctx.stroke();

    // Glass Shower Panel on Left Edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, cw * 0.18, ch * 0.85);
    ctx.strokeRect(0, 0, cw * 0.18, ch * 0.85);

    // Glass Highlight Reflection
    const glassGrad = ctx.createLinearGradient(0, 0, cw * 0.18, ch * 0.85);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, 0, cw * 0.18, ch * 0.85);

  }, [viewMode, textureImg, isLoaded, style, color, finish, width, height]);

  return (
    <div className="bathroom-mockup-box">
      <div className="mockup-header-row">
        <div className="mockup-title-group">
          <div className="mockup-badge-live">
            <Sparkles size={13} className="sparkle-anim" />
            <span>3D Banyo Döşeme Görseli</span>
          </div>
          <p className="mockup-subtitle">Bu seramik modelinin banyo ortamındaki gerçekçi döşenmiş simülasyonu</p>
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

      {/* Interactive Render Canvas */}
      <div className="mockup-canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={480} 
          height={320} 
          className="mockup-canvas-element"
        />

        {/* Top Floating Info Tag */}
        <div className="mockup-floating-info">
          <span className="info-dot"></span>
          <span>{product?.brand?.name || 'Seramik'} — {product?.name} ({width}x{height} cm {finish})</span>
        </div>

        {/* Action Overlay Button */}
        {onOpenStudio && (
          <button onClick={onOpenStudio} className="mockup-studio-launch-btn">
            <Eye size={14} />
            <span>3D Sanal Stüdyoda 360° İncele</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .bathroom-mockup-box {
          background: rgba(18, 22, 31, 0.7);
          border: 1px solid rgba(197, 160, 89, 0.25);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .bathroom-mockup-box:hover {
          border-color: rgba(197, 160, 89, 0.45);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
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
          font-size: 0.78rem;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.02em;
        }

        .sparkle-anim {
          animation: pulseGlow 2s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 6px #d4af37); }
        }

        .mockup-subtitle {
          font-size: 0.65rem;
          color: #94a3b8;
          margin: 0;
        }

        .mockup-mode-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.4);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mockup-tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .mockup-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
        }

        .mockup-tab-btn.active {
          background: rgba(197, 160, 89, 0.2);
          color: #d4af37;
          border: 1px solid rgba(197, 160, 89, 0.35);
        }

        .mockup-canvas-wrapper {
          position: relative;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.1);
          aspect-ratio: 3 / 2;
        }

        .mockup-canvas-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mockup-floating-info {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(13, 17, 23, 0.85);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
          font-size: 0.62rem;
          font-weight: 600;
          padding: 3px 8px;
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
          bottom: 8px;
          right: 8px;
          background: rgba(197, 160, 89, 0.9);
          color: #0b0f17;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          transition: all 0.25s ease;
          z-index: 2;
        }

        .mockup-studio-launch-btn:hover {
          background: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </div>
  );
}
