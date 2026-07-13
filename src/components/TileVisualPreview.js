import { useState } from 'react';

// ----------------------------------------------------------------------
// PROCEDURAL TILE VISUAL PREVIEW COMPONENT
// Renders beautiful CSS + SVG tile representations so the page is highly 
// visual and clearly screams "ceramics" without broken image paths.
// If a real image is provided (imageUrl), it loads the image instead.
// ----------------------------------------------------------------------
export default function TileVisualPreview({ style, color, finish, width, height, imageUrl }) {
  const [imageError, setImageError] = useState(false);
  const isDark = color.toLowerCase().includes('antrasit') || color.toLowerCase().includes('siyah') || color.toLowerCase().includes('füme');
  const isBeige = color.toLowerCase().includes('bej') || color.toLowerCase().includes('krem');
  const isBrown = color.toLowerCase().includes('kahve') || color.toLowerCase().includes('ahşap');
  
  // Base background color determination
  let bgColor = '#e5e7eb'; // Default light grey
  if (style === 'Mermer') {
    bgColor = isDark ? '#1f242e' : '#f4f5f8';
  } else if (style === 'Ahşap') {
    bgColor = '#8a5a36'; // Wood brown
  } else if (style === 'Beton') {
    bgColor = isBeige ? '#e3d6c3' : '#a0a4ab'; // Beige/Grey concrete
  }

  // If a real image path exists and has loaded successfully, render it!
  if (imageUrl && !imageError) {
    return (
      <div className="tile-preview-container" style={{ backgroundColor: bgColor }}>
        <img 
          src={imageUrl} 
          alt={`${color} ${style} Seramik`} 
          onError={() => setImageError(true)} 
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {finish === 'Parlak' && <div className="tile-gloss-reflection" />}
        {finish === 'Lapatto' && <div className="tile-lapatto-reflection" />}
        <div className="tile-grout-border" />
        <div className="tile-dimension-tag">{width}x{height} cm</div>

        <style jsx>{`
          .tile-preview-container {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            transition: transform 0.6s ease;
          }
          .tile-gloss-reflection {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
            pointer-events: none;
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
          }
          .tile-lapatto-reflection {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 65%);
            pointer-events: none;
          }
          .tile-grout-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
            pointer-events: none;
          }
          .tile-dimension-tag {
            position: absolute;
            bottom: 6px;
            right: 8px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 0.55rem;
            font-family: var(--font-title);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
            letter-spacing: 0.02em;
            z-index: 2;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tile-preview-container" style={{ backgroundColor: bgColor }}>
      
      {/* 1. MARBLE PATTERN (SVG Veins) */}
      {style === 'Mermer' && (
        <svg className="tile-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          {isDark ? (
            <>
              {/* White/grey veins for dark marble */}
              <path d="M 10,0 Q 40,30 20,60 T 80,100" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" />
              <path d="M 90,0 Q 50,40 70,70 T 30,100" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
              <path d="M 0,30 Q 30,50 10,80 T 50,100" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.4" />
            </>
          ) : (
            <>
              {/* Grey and Gold veins for Calacatta white marble */}
              <path d="M 20,0 Q 50,45 30,70 T 90,100" fill="none" stroke="rgba(160, 165, 175, 0.3)" strokeWidth="1" />
              <path d="M 25,0 Q 55,45 35,70 T 95,100" fill="none" stroke="rgba(197, 160, 89, 0.25)" strokeWidth="0.6" /> {/* Gold vein */}
              <path d="M 80,0 Q 40,30 60,65 T 10,100" fill="none" stroke="rgba(160, 165, 175, 0.2)" strokeWidth="0.5" />
            </>
          )}
        </svg>
      )}

      {/* 2. WOOD PLANK SEAMS */}
      {style === 'Ahşap' && (
        <div className="tile-wood-grain">
          <div className="wood-seam" style={{ left: '25%' }} />
          <div className="wood-seam" style={{ left: '50%' }} />
          <div className="wood-seam" style={{ left: '75%' }} />
          {/* Subtle horizontal grain lines */}
          <div className="wood-grain-line" style={{ top: '20%', opacity: 0.15 }} />
          <div className="wood-grain-line" style={{ top: '45%', opacity: 0.1 }} />
          <div className="wood-grain-line" style={{ top: '75%', opacity: 0.2 }} />
        </div>
      )}

      {/* 3. CONCRETE TEXTURE NOISE */}
      {style === 'Beton' && (
        <div className="tile-concrete-specks">
          <div className="concrete-cloud" style={{ background: 'rgba(255, 255, 255, 0.12)', top: '10%', left: '15%', width: '60px', height: '40px' }} />
          <div className="concrete-cloud" style={{ background: 'rgba(0, 0, 0, 0.05)', top: '50%', left: '40%', width: '80px', height: '50px' }} />
          <div className="concrete-fine-noise" />
        </div>
      )}

      {/* Gloss reflection overlay based on finish */}
      {finish === 'Parlak' && <div className="tile-gloss-reflection" />}
      {finish === 'Lapatto' && <div className="tile-lapatto-reflection" />}

      {/* Joint grout lines around the tile */}
      <div className="tile-grout-border" />
      
      {/* Physical dimensions overlay marker */}
      <div className="tile-dimension-tag">{width}x{height} cm</div>

      <style jsx>{`
        .tile-preview-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          transition: transform 0.6s ease;
        }
        .tile-svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .tile-wood-grain {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .wood-seam {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 1px 0 0 rgba(255, 255, 255, 0.08);
        }
        .wood-grain-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(0, 0, 0, 0.2);
          filter: blur(0.5px);
        }
        .tile-concrete-specks {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .concrete-cloud {
          position: absolute;
          border-radius: 50%;
          filter: blur(12px);
        }
        .concrete-fine-noise {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 0);
          background-size: 4px 4px;
          opacity: 0.25;
        }
        .tile-gloss-reflection {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
        }
        .tile-lapatto-reflection {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 65%);
          pointer-events: none;
        }
        .tile-grout-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
          pointer-events: none;
        }
        .tile-dimension-tag {
          position: absolute;
          bottom: 6px;
          right: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 0.55rem;
          font-family: var(--font-title);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
