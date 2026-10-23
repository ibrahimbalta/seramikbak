import { useState } from 'react';

// ----------------------------------------------------------------------
// PROCEDURAL TILE VISUAL PREVIEW COMPONENT
// Renders beautiful CSS + SVG tile representations so the page is highly 
// visual and clearly screams "ceramics" without broken image paths.
// If a real image is provided (imageUrl), it loads the image directly
// from fast high-speed CDNs with lazy decoding and intelligent fallbacks.
// ----------------------------------------------------------------------
export default function TileVisualPreview({ style, color, finish, width, height, imageUrl, productName, brandName, altText, priority = false }) {
  const [imageError, setImageError] = useState(false);
  const [useFallbackTexture, setUseFallbackTexture] = useState(false);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  const isDark = (color || '').toLowerCase().includes('antrasit') || (color || '').toLowerCase().includes('siyah') || (color || '').toLowerCase().includes('füme');
  const isBeige = (color || '').toLowerCase().includes('bej') || (color || '').toLowerCase().includes('krem');
  const isBrown = (color || '').toLowerCase().includes('kahve') || (color || '').toLowerCase().includes('ahşap');
  
  const seoAltString = altText || `${brandName ? brandName + ' ' : ''}${productName ? productName + ' - ' : ''}${color || ''} ${style || ''} ${finish || ''} Seramik Fayans Karo (${width}x${height} cm) | Ceramic Porcelain Tile Fliesen سيراميك`;

  // Determine intelligent realistic fallback texture with deterministic hash variation
  const getMatchingFallbackTexture = () => {
    const s = (style || '').toLowerCase();
    const c = (color || '').toLowerCase();
    const n = (productName || '').toLowerCase();
    const full = `${s} ${c} ${n}`;

    // Simple deterministic hash based on name to provide diverse realistic textures
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = (hash * 31 + n.charCodeAt(i)) & 0xffffffff;
    }
    const absHash = Math.abs(hash);

    // 1. AHŞAP / WOOD
    if (s.includes('ahşap') || s.includes('wood') || n.includes('wood') || n.includes('oak') || n.includes('sedir') || n.includes('ceviz')) {
      if (c.includes('gri') || n.includes('gri')) return '/textures/sedir_gri.jpg';
      if (c.includes('koyu') || n.includes('dark') || n.includes('teak') || c.includes('ceviz')) return '/textures/teak_ahsap.jpg';
      if (n.includes('çam') || n.includes('akçaağaç') || n.includes('blonde')) return '/textures/sedir_akcaagac.jpg';
      const woodPool = ['/textures/natural_oak.jpg', '/textures/teak_ahsap.jpg', '/textures/sedir_akcaagac.jpg'];
      return woodPool[absHash % woodPool.length];
    }

    // 2. SPECIFIC NOTABLE COLLECTIONS
    if (n.includes('vista')) {
      return (isDark || c.includes('antrasit')) ? '/textures/vista_antrasit.jpg' : '/textures/vista_bej.jpg';
    }
    if (n.includes('portland')) {
      return (isDark || c.includes('fume') || c.includes('antrasit')) ? '/textures/portland_fume.jpg' : '/textures/vintage_gri.jpg';
    }
    if (n.includes('swan')) {
      return isDark ? '/textures/albatros_antrasit.jpg' : '/textures/swan_bone.jpg';
    }
    if (n.includes('pulpis')) {
      return '/textures/pulpis_gri.jpg';
    }
    if (n.includes('trax') || n.includes('oxido') || n.includes('corten')) {
      return '/textures/trax_oxido.jpg';
    }
    if (n.includes('calacatta') || n.includes('carrara') || n.includes('statuario')) {
      return isDark ? '/textures/borneo_antrasit.jpg' : '/textures/calacatta_gold.jpg';
    }

    // 3. COLOR & MATERIAL POOLS
    // Dark / Anthracite / Black / Füme
    if (isDark || c.includes('antrasit') || c.includes('siyah') || c.includes('dark') || c.includes('nero') || n.includes('antrasit') || n.includes('siyah')) {
      if (s.includes('mermer') || n.includes('marble')) return '/textures/borneo_antrasit.jpg';
      if (s.includes('beton') || n.includes('loft') || n.includes('cement')) return '/textures/loft_beton.jpg';
      const darkPool = ['/textures/magma_antrasit.jpg', '/textures/albatros_antrasit.jpg', '/textures/borneo_antrasit.jpg', '/textures/vista_antrasit.jpg', '/textures/loft_beton.jpg'];
      return darkPool[absHash % darkPool.length];
    }

    // Brown / Kahverengi
    if (isBrown || c.includes('kahve') || c.includes('brown')) {
      const brownPool = ['/textures/vista_bej.jpg', '/textures/teak_ahsap.jpg', '/textures/keops_bej.jpg'];
      return brownPool[absHash % brownPool.length];
    }

    // Beige / Cream / Bone / Fildişi / Almond
    if (isBeige || c.includes('bej') || c.includes('krem') || c.includes('fildişi') || c.includes('almond') || c.includes('kemik') || c.includes('bone') || c.includes('ivory')) {
      if (s.includes('mermer')) return '/textures/swan_bone.jpg';
      const beigePool = ['/textures/vista_bej.jpg', '/textures/keops_bej.jpg', '/textures/swan_bone.jpg', '/textures/travertino_classico.jpg'];
      return beigePool[absHash % beigePool.length];
    }

    // Grey / Gri
    if (c.includes('gri') || c.includes('grey') || c.includes('silver') || n.includes('grey') || n.includes('gri')) {
      if (s.includes('mermer')) return '/textures/pulpis_gri.jpg';
      if (s.includes('beton')) return '/textures/concrete_light_grey.jpg';
      const greyPool = ['/textures/thor_gri.jpg', '/textures/vintage_gri.jpg', '/textures/pulpis_gri.jpg', '/textures/concrete_light_grey.jpg'];
      return greyPool[absHash % greyPool.length];
    }

    // White / Beyaz
    if (c.includes('beyaz') || c.includes('white') || n.includes('beyaz') || n.includes('white')) {
      const whitePool = ['/textures/senzo_beyaz.jpg', '/textures/calacatta_gold.jpg'];
      return whitePool[absHash % whitePool.length];
    }

    // 4. STYLE FALLBACKS
    if (s.includes('mermer') || s.includes('marble')) {
      const marblePool = ['/textures/calacatta_gold.jpg', '/textures/senzo_beyaz.jpg', '/textures/swan_bone.jpg', '/textures/borneo_antrasit.jpg'];
      return marblePool[absHash % marblePool.length];
    }
    if (s.includes('beton') || s.includes('concrete')) {
      const betonPool = ['/textures/concrete_light_grey.jpg', '/textures/loft_beton.jpg', '/textures/vintage_gri.jpg'];
      return betonPool[absHash % betonPool.length];
    }
    if (s.includes('taş') || s.includes('stone')) {
      const stonePool = ['/textures/thor_gri.jpg', '/textures/travertino_classico.jpg', '/textures/vintage_gri.jpg', '/textures/magma_antrasit.jpg', '/textures/keops_bej.jpg'];
      return stonePool[absHash % stonePool.length];
    }

    const defaultPool = ['/textures/thor_gri.jpg', '/textures/calacatta_gold.jpg', '/textures/vista_bej.jpg', '/textures/senzo_beyaz.jpg'];
    return defaultPool[absHash % defaultPool.length];
  };

  const fallbackTexture = getMatchingFallbackTexture();

  // Base background color determination
  let bgColor = '#e5e7eb'; // Default light grey
  if (style === 'Mermer') {
    bgColor = isDark ? '#1f242e' : '#f4f5f8';
  } else if (style === 'Ahşap') {
    bgColor = '#8a5a36'; // Wood brown
  } else if (style === 'Beton') {
    bgColor = isBeige ? '#e3d6c3' : '#a0a4ab'; // Beige/Grey concrete
  }

  const handleImageError = () => {
    // If direct CDN load failed for an external URL and proxy hasn't been tried yet, try proxy once
    if (!useFallbackTexture && !useProxyFallback && imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      setUseProxyFallback(true);
    } else if (!useFallbackTexture && fallbackTexture) {
      setUseFallbackTexture(true);
    } else {
      setImageError(true);
    }
  };

  // If a real image path exists or fallback texture is active, render it!
  const effectiveUrl = useFallbackTexture ? fallbackTexture : (imageUrl || fallbackTexture);

  if (effectiveUrl && !imageError) {
    // Use direct URL for maximum CDN speed; only route through proxy if direct load failed
    const displaySrc = (!useFallbackTexture && useProxyFallback && (effectiveUrl.startsWith('http://') || effectiveUrl.startsWith('https://')))
      ? `/api/proxy?url=${encodeURIComponent(effectiveUrl)}`
      : effectiveUrl;

    return (
      <div className="tile-preview-container" style={{ backgroundColor: bgColor }} title={seoAltString} aria-label={seoAltString}>
        <img 
          src={displaySrc} 
          alt={seoAltString}
          title={seoAltString}
          referrerPolicy="no-referrer"
          onError={handleImageError} 
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
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
            bottom: 34px;
            right: 6px;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: #fff;
            font-size: 0.55rem;
            font-family: var(--font-title);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            letter-spacing: 0.02em;
            z-index: 5;
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
          bottom: 34px;
          right: 6px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          color: #fff;
          font-size: 0.55rem;
          font-family: var(--font-title);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.02em;
          z-index: 5;
        }
      `}</style>
    </div>
  );
}
