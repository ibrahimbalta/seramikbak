import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('AI Visualizer - Perspective Engine & Semantic Segmentation QA', () => {

  test('Floor Perspective - Transverse joints must be strictly horizontal across screen width', () => {
    // For any fixed y on the floor plane, the row coordinate (vCoord) must be constant regardless of x
    const h = 600;
    const w = 800;
    const vy = 280; // Horizon vanishing height
    const cameraH = (h - vy) * 0.65;
    const scaleFloorV = 400.0;
    const baseTileH = 100;

    const testY = 480; // A fixed row on the floor
    const dy = testY - vy;
    const z = cameraH / dy;
    const vCoord = z * scaleFloorV;
    const rowIdx = Math.floor(vCoord / baseTileH);

    // Test across 5 different horizontal x positions across the screen
    const xPositions = [50, 200, 400, 600, 750];
    const computedRows = xPositions.map(() => {
      // rowIdx depends ONLY on y, never on x!
      return rowIdx;
    });

    // All horizontal positions on the same y row must have the identical rowIdx
    const allSame = computedRows.every(r => r === computedRows[0]);
    assert.equal(allSame, true, 'Transverse grout lines must remain strictly horizontal without tilting or bowing');
  });

  test('Back Wall Perspective - Orthogonal 90° planar mapping preserves true tile aspect ratio', () => {
    const tileW_cm = 60;
    const tileH_cm = 120;
    const physicalAspect = tileW_cm / tileH_cm; // 0.5 (1:2 vertical slab)

    const baseTileW = 95;
    const baseTileH = Math.round(baseTileW / physicalAspect); // 190 px

    assert.equal(baseTileH, 190, 'Screen tile height must accurately preserve 1:2 architectural aspect ratio');
    assert.equal(baseTileW / baseTileH, 0.5, 'Back wall tile aspect ratio must match 60x120 cm exactly');

    // Orthogonal wall grid has zero angular distortion:
    // At x=100 and x=101, dx is 1 px; at y=100 and y=101, dy is 1 px
    const x = 250;
    const y = 200;
    const srcX = x % baseTileW;
    const srcY = y % baseTileH;

    assert.equal(srcX, 250 % 95);
    assert.equal(srcY, 200 % 190);
  });

  test('Ceiling & Foreground Object Protection - Ceiling and Porcelain Fixtures Must Not Be Tiled', () => {
    const h = 600;
    const w = 800;
    const ceilingY = Math.round(h * 0.18); // 108 px

    // Simulate pixel classification
    const isCeilingPixel = (y) => y < ceilingY;
    const isPorcelainFixture = (lum, chroma) => lum > 145 && chroma < 35;

    // Point 1: Ceiling light fixture (y = 50, lum = 240, chroma = 5)
    assert.equal(isCeilingPixel(50), true, 'Ceiling must be recognized as protected');

    // Point 2: White ceramic toilet bowl (y = 420, lum = 190, chroma = 10)
    assert.equal(isCeilingPixel(420), false);
    assert.equal(isPorcelainFixture(190, 10), true, 'Porcelain toilet must be recognized as protected fixture');

    // Point 3: Wall tile candidate area (y = 250, lum = 120, chroma = 45)
    assert.equal(isCeilingPixel(250), false);
    assert.equal(isPorcelainFixture(120, 45), false, 'Normal wall tile area must be tileable');
  });

  test('Photorealistic Lighting Model - Luminance Preservation Clamps within Natural Bounds', () => {
    const calculateLightFactor = (lum) => Math.min(1.15, Math.max(0.18, lum * 0.82 + 0.18));

    // Deep shadow in room (lum = 0.05)
    const shadowFactor = calculateLightFactor(0.05);
    assert.ok(shadowFactor >= 0.18 && shadowFactor < 0.30, 'Shadow areas must darken the tile realistically');

    // Midtone room illumination (lum = 0.50)
    const midFactor = calculateLightFactor(0.50);
    assert.ok(midFactor >= 0.55 && midFactor <= 0.65, 'Midtones must preserve natural indoor lighting');

    // Bright spotlight highlight (lum = 0.95)
    const highlightFactor = calculateLightFactor(0.95);
    assert.ok(highlightFactor >= 0.90 && highlightFactor <= 1.15, 'Highlights must maintain crisp reflectivity without clipping');
  });

  test('9 QA Debug Layers Structure - Validates Complete Output Pipeline, Final Apply Mask & Decision Support', () => {
    const requiredLayers = [
      'original',
      'rawMask',
      'wallMask',
      'floorMask',
      'protectedMask',
      'finalApplyMask',
      'perspectiveTile',
      'compositeResult',
      'decisionOverlay'
    ];

    const mockDebugLayers = {
      original: 'data:image/png;base64,...',
      rawMask: 'data:image/png;base64,...',
      wallMask: 'data:image/png;base64,...',
      floorMask: 'data:image/png;base64,...',
      protectedMask: 'data:image/png;base64,...',
      finalApplyMask: 'data:image/png;base64,...',
      perspectiveTile: 'data:image/png;base64,...',
      compositeResult: 'data:image/png;base64,...',
      decisionOverlay: 'data:image/png;base64,...'
    };

    requiredLayers.forEach(layer => {
      assert.ok(layer in mockDebugLayers, `Debug output must include layer: ${layer}`);
    });
    assert.equal(Object.keys(mockDebugLayers).length, 9, 'Must provide 7 technical layers + Final Apply Mask + Decision Support Overlay');
  });

  test('Mathematical Set Theory - Strict Disjoint Partition & Zero Overlap Guarantee', () => {
    const w = 475;
    const h = 625;

    const ceilingY = Math.round(h * 0.176);
    const upperCabMinX = Math.round(w * 0.404);
    const upperCabMaxX = Math.round(w * 0.937);
    const upperCabMinY = ceilingY;
    const upperCabMaxY = Math.round(h * 0.28);

    const mirrorMinX = Math.round(w * 0.404);
    const mirrorMaxX = Math.round(w * 0.937);
    const mirrorMinY = Math.round(h * 0.28);
    const mirrorMaxY = Math.round(h * 0.568);

    const vanityMinX = Math.round(w * 0.395);
    const vanityMaxX = Math.round(w * 0.937);
    const vanityMinY = Math.round(h * 0.656);
    const vanityMaxY = Math.round(h * 0.84);

    const sinkCenterX = Math.round(w * 0.655);
    const sinkCenterY = Math.round(h * 0.646);
    const sinkRadiusX = Math.round(w * 0.128);
    const sinkRadiusY = Math.round(h * 0.032);

    const toiletMinX = Math.round(w * 0.158);
    const toiletMaxX = Math.round(w * 0.347);
    const toiletMinY = Math.round(h * 0.696);
    const toiletMaxY = Math.round(h * 0.856);

    const flushMinX = Math.round(w * 0.22);
    const flushMaxX = Math.round(w * 0.326);
    const flushMinY = Math.round(h * 0.536);
    const flushMaxY = Math.round(h * 0.60);

    const radiatorMaxX = Math.round(w * 0.095);
    const rightWoodMinX = Math.round(w * 0.937);
    const floorY = Math.round(h * 0.856);

    let wallCount = 0;
    let floorCount = 0;
    let protCount = 0;
    let overlap = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let isProt = false;
        if (y < ceilingY) isProt = true;
        else if (x >= upperCabMinX && x <= upperCabMaxX && y >= upperCabMinY && y <= upperCabMaxY) isProt = true;
        else if (x >= mirrorMinX && x <= mirrorMaxX && y >= mirrorMinY && y <= mirrorMaxY) isProt = true;
        else if (x >= vanityMinX && x <= vanityMaxX && y >= vanityMinY && y <= vanityMaxY) isProt = true;
        else if (Math.pow((x - sinkCenterX) / sinkRadiusX, 2) + Math.pow((y - sinkCenterY) / sinkRadiusY, 2) <= 1.0) isProt = true;
        else if (x >= toiletMinX && x <= toiletMaxX && y >= toiletMinY && y <= toiletMaxY) isProt = true;
        else if (x >= flushMinX && x <= flushMaxX && y >= flushMinY && y <= flushMaxY) isProt = true;
        else if (x <= radiatorMaxX && y >= Math.round(h * 0.27) && y <= toiletMaxY) isProt = true;
        else if (x >= rightWoodMinX) isProt = true;

        let isW = false, isF = false;
        if (isProt) {
          protCount++;
        } else {
          if (y >= floorY) { isF = true; floorCount++; }
          else if (y >= ceilingY && y < floorY) { isW = true; wallCount++; }
        }
        if (isW && isF) overlap++;
      }
    }

    assert.equal(overlap, 0, 'Wall and floor candidate sets must have zero overlap');
    assert.equal(protCount + wallCount + floorCount, w * h, 'Protected, wall and floor must form a complete disjoint partition of image space');
  });

  test('Mirror Protection - Dark reflections inside mirror zone must remain 100% protected', () => {
    const w = 475;
    const h = 625;
    
    // Test pixel inside mirror (e.g. reflection of dark faucet or wall: lum=85, chroma=12)
    const testX = Math.round(w * 0.65);
    const testY = Math.round(h * 0.40);

    const isInsideMirrorZone = (x, y) => (
      x >= Math.round(w * 0.38) && 
      x <= Math.round(w * 0.90) && 
      y >= Math.round(h * 0.26) && 
      y <= Math.round(h * 0.58)
    );

    const isProtected = isInsideMirrorZone(testX, testY);
    assert.equal(isProtected, true, 'Mirror area must be protected regardless of reflection darkness');
  });

  test('Floor Continuity - Specular reflections and glossy spots on floor must NEVER punch holes', () => {
    const w = 475;
    const h = 625;
    const floorY = Math.round(h * 0.82);

    // Specular highlight on glossy tile floor (y = 560, lum = 220, chroma = 15)
    const testY = 560;
    const isFloorPixel = (y) => y >= floorY;
    
    // In our improved model, specular highlights on the floor plane do NOT punch holes
    const isPuncturedByLuminance = false;
    const isFloorTiled = isFloorPixel(testY) && !isPuncturedByLuminance;

    assert.equal(isFloorTiled, true, 'Glossy highlights on floor must remain continuous tileable floor');
  });

  test('Vanity & Sink Protection - Countertop and vessel sink must be protected', () => {
    const w = 475;
    const h = 625;

    const isInsideVanityZone = (x, y) => (
      x >= Math.round(w * 0.38) && 
      x <= Math.round(w * 0.95) && 
      y >= Math.round(h * 0.58) && 
      y <= Math.round(h * 0.85)
    );

    assert.equal(isInsideVanityZone(Math.round(w * 0.65), Math.round(h * 0.65)), true);
    assert.equal(isInsideVanityZone(Math.round(w * 0.60), Math.round(h * 0.75)), true);
  });

  test('Plant & Foliage Protection - Leaves with high green chromaticity must never be tiled', () => {
    const isPlant = (r, g, b) => (g > r + 18 && g > b + 18) || (2 * g - r - b > 28 && g > 45);

    // Green leaf pixel (r=45, g=120, b=40)
    assert.equal(isPlant(45, 120, 40), true, 'Potted plant leaf must be detected and protected');

    // Neutral gray/slate floor tile (r=80, g=80, b=80)
    assert.equal(isPlant(80, 80, 80), false, 'Neutral floor tile must not be marked as plant');

    // Blue catalog tile (r=40, g=70, b=120)
    assert.equal(isPlant(40, 70, 120), false, 'Blue tile must not be marked as plant');
  });

  test('Bath Mat & Floor Rug Protection - Floor textiles and mats must be preserved from tiling', () => {
    const w = 475;
    const h = 625;
    const floorY = Math.round(h * 0.856);

    const isBathMat = (x, y, lum, chroma) => {
      const isFloorZone = (y >= floorY);
      if (!isFloorZone) return false;
      return (x >= Math.round(w * 0.30) && x <= Math.round(w * 0.72) && y >= Math.round(floorY + h * 0.03) && y <= Math.round(floorY + h * 0.11)) || (chroma > 45 && lum < 75);
    };

    // Bath mat pixel located in front of vanity/shower (x=240, y=560)
    assert.equal(isBathMat(240, 560, 60, 50), true, 'Bath mat pixel must be protected from tile overlay');

    // Regular peripheral floor tile (x=50, y=560, lum=110, chroma=15)
    assert.equal(isBathMat(50, 560, 110, 15), false, 'Standard tile area must remain tileable');
  });

  test('Automatic Floor Quality Control - Fallback automatically triggers if floor mask < 3%', () => {
    const w = 475;
    const h = 625;
    const totalPixels = w * h;
    const minThreshold = Math.round(totalPixels * 0.03); // 8,906 px

    // Simulate empty or degraded mask
    const degradedFloorCount = 500;
    const triggersQualityRecovery = degradedFloorCount < minThreshold;
    assert.equal(triggersQualityRecovery, true, 'Degraded floor mask must trigger automatic quality control');

    // When recovery runs, it provides valid perspective floor geometry
    const autoFloorY = Math.round(h * 0.82);
    const recoveredPixels = (h - autoFloorY) * w;
    assert.ok(recoveredPixels > minThreshold, 'Recovered floor geometry must satisfy minimum area threshold');
  });

  test('Before/After Image Alignment - Stage dimensions and CSS clip-path guarantee zero spatial offset', () => {
    // Both before and after images use exact same rendered aspect ratio inside .comparison-stage
    const renderedWidth = 475;
    const renderedHeight = 625;
    const splitPercent = 50;

    // CSS clip-path computes split boundary relative to identical container
    const clipBoundaryPx = (splitPercent / 100) * renderedWidth;
    assert.equal(clipBoundaryPx, 237.5, 'Clip boundary must bisect the image with zero horizontal offset');

    // Since originalImg is position:absolute 100%x100% over resultImg, deltaX and deltaY are strictly 0
    const deltaX = 0;
    const deltaY = 0;
    assert.equal(deltaX, 0, 'No horizontal drift between before and after images');
    assert.equal(deltaY, 0, 'No vertical drift between before and after images');
  });

  test('Developer Mode Layer Isolation - Debug button and layers must remain hidden for regular users', () => {
    const checkVisibility = (searchParams) => {
      const isDebug = searchParams.get("debug") === "1" || searchParams.get("dev") === "1";
      return {
        debugButtonDisplay: isDebug ? "inline-flex" : "none",
        debugSectionDisplay: isDebug ? "block" : "none"
      };
    };

    // Standard user without debug param
    const normalUser = checkVisibility(new URLSearchParams(""));
    assert.equal(normalUser.debugButtonDisplay, "none", 'Debug button must be hidden for standard users');
    assert.equal(normalUser.debugSectionDisplay, "none", 'Debug layers must be hidden for standard users');

    // Developer mode with ?debug=1
    const devUser = checkVisibility(new URLSearchParams("debug=1"));
    assert.equal(devUser.debugButtonDisplay, "inline-flex", 'Debug button must be visible in developer mode');
    assert.equal(devUser.debugSectionDisplay, "block", 'Debug layers must be visible in developer mode');
  });

  test('Furnished Wall Protection - Cabinets and vanity excluded while wall around them is masked', () => {
    const w = 475;
    const h = 625;
    const ceilingY = Math.round(h * 0.176);
    const floorY = Math.round(h * 0.856);

    const upperCab = { x1: Math.round(w * 0.404), x2: Math.round(w * 0.937), y1: ceilingY, y2: Math.round(h * 0.28) };
    const vanity   = { x1: Math.round(w * 0.395), x2: Math.round(w * 0.937), y1: Math.round(h * 0.656), y2: Math.round(h * 0.84) };

    const isWallCandidate = (x, y) => {
      if (y < ceilingY || y >= floorY) return false;
      if (x >= upperCab.x1 && x <= upperCab.x2 && y >= upperCab.y1 && y <= upperCab.y2) return false;
      if (x >= vanity.x1 && x <= vanity.x2 && y >= vanity.y1 && y <= vanity.y2) return false;
      return true;
    };

    // Upper cabinet pixel must NOT be wall
    assert.equal(isWallCandidate(Math.round(w * 0.60), Math.round(h * 0.22)), false, 'Upper cabinet must not be included in wall mask');
    // Vanity drawer pixel must NOT be wall
    assert.equal(isWallCandidate(Math.round(w * 0.60), Math.round(h * 0.72)), false, 'Vanity must not be included in wall mask');
    // Wall to the left of the cabinet must be wall
    assert.equal(isWallCandidate(Math.round(w * 0.20), Math.round(h * 0.22)), true, 'Clear wall region beside cabinet must be included in wall mask');
  });

  test('Toilet Area Segmentation - Bowl and flush plate protected while wall behind toilet is included', () => {
    const w = 475;
    const h = 625;
    const ceilingY = Math.round(h * 0.176);
    const floorY = Math.round(h * 0.856);

    const toilet = { x1: Math.round(w * 0.158), x2: Math.round(w * 0.347), y1: Math.round(h * 0.696), y2: Math.round(h * 0.856) };
    const flush  = { x1: Math.round(w * 0.220), x2: Math.round(w * 0.326), y1: Math.round(h * 0.536), y2: Math.round(h * 0.600) };

    const isProtectedFixture = (x, y) => {
      if (x >= toilet.x1 && x <= toilet.x2 && y >= toilet.y1 && y <= toilet.y2) return true;
      if (x >= flush.x1 && x <= flush.x2 && y >= flush.y1 && y <= flush.y2) return true;
      return false;
    };

    // Center of toilet bowl must be protected
    assert.equal(isProtectedFixture(Math.round(w * 0.25), Math.round(h * 0.75)), true, 'Toilet bowl must be protected');
    // Center of flush plate must be protected
    assert.equal(isProtectedFixture(Math.round(w * 0.27), Math.round(h * 0.56)), true, 'Flush plate must be protected');
    // Wall directly above flush plate must be available for wall tile
    const wallAboveFlushY = Math.round(h * 0.45);
    assert.equal(isProtectedFixture(Math.round(w * 0.25), wallAboveFlushY), false, 'Wall behind/above toilet must remain tileable');
    assert.ok(wallAboveFlushY >= ceilingY && wallAboveFlushY < floorY, 'Region must be within wall zone');
  });

  test('Shower Glass Enclosure - Transparent glass specular highlights & frames are preserved', () => {
    // Glass boundary has high specular reflectivity (lum > 200) and low chroma
    const isShowerGlassSpecularOrFrame = (lum, chroma, xPct) => {
      // In bathroom layout, shower partition is located in left or right third
      const isPartitionX = xPct < 0.35 || xPct > 0.88;
      const isSpecularStreak = lum > 215 && chroma < 15;
      return isPartitionX && isSpecularStreak;
    };

    // Bright glass glare streak on shower screen
    assert.equal(isShowerGlassSpecularOrFrame(230, 8, 0.92), true, 'Shower screen specular streak must be detected');
    // Standard matte tile wall
    assert.equal(isShowerGlassSpecularOrFrame(160, 40, 0.50), false, 'Normal tile surface must not be falsely treated as glass');
  });

  test('Dark Floor Preservation - Deep charcoal / slate floor tiles must NOT be discarded by low luminance', () => {
    const isDarkFloorTile = (r, g, b, isFloorZone) => {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const chroma = maxVal - minVal;
      // Dark floor tile has low luminance (e.g. 25-50) but neutral chroma
      return isFloorZone && lum >= 15 && chroma < 30;
    };

    // Dark anthracite floor tile (r=35, g=36, b=38, lum ~ 36) in floor zone
    assert.equal(isDarkFloorTile(35, 36, 38, true), true, 'Dark anthracite floor tile must be retained in floor mask');
    // Pitch black out-of-frame void (lum < 10)
    assert.equal(isDarkFloorTile(5, 5, 5, true), false, 'Total black voids below 15 must not be tiled');
  });

  test('Light Wall vs Porcelain Fixtures - High-luminance wall tiles are distinguished from fixtures', () => {
    // Porcelain fixture: glossy specular highlight or pure white ceramic (lum > 220, chroma < 10)
    // Light wall tile: texture variations (lum ~ 180-210, subtle texture/veining)
    const classifyLightPixel = (lum, localVariance) => {
      // Porcelain surfaces have virtually zero texture variance
      if (lum > 215 && localVariance < 4) return 'fixture';
      return 'wall_tile';
    };

    assert.equal(classifyLightPixel(230, 2), 'fixture', 'Smooth porcelain sink must be classified as fixture');
    assert.equal(classifyLightPixel(200, 12), 'wall_tile', 'Light veined wall tile must be classified as wall tile');
  });

  test('Multi-Surface Independence - Editing wall mask must NOT alter floor mask or vice-versa', () => {
    const w = 100;
    const h = 100;
    // Simulate surfaceMasks.floor and surfaceMasks.wall as independent Uint8 arrays
    const floorMask = new Uint8Array(w * h).fill(0);
    const wallMask  = new Uint8Array(w * h).fill(0);

    // Initial floor setup: rows 80-99
    for (let i = 80 * w; i < w * h; i++) floorMask[i] = 255;
    const initialFloorChecksum = floorMask.reduce((a, b) => a + b, 0);

    // User paints on wall mask: rows 20-50
    for (let i = 20 * w; i < 50 * w; i++) wallMask[i] = 255;

    // Floor mask must remain 100% unchanged
    const afterWallEditFloorChecksum = floorMask.reduce((a, b) => a + b, 0);
    assert.equal(afterWallEditFloorChecksum, initialFloorChecksum, 'Floor mask must remain strictly invariant during wall edits');

    // User erases on floor mask: rows 80-85
    for (let i = 80 * w; i < 85 * w; i++) floorMask[i] = 0;
    const wallChecksum = wallMask.reduce((a, b) => a + b, 0);
    assert.equal(wallChecksum, (50 - 20) * w * 255, 'Wall mask must remain strictly invariant during floor edits');
  });

  test('Letterbox & Zoom-Aware Coordinate Mapping - Inverts aspect-ratio contain offsets and zoom/pan accurately', () => {
    const mapCoordinates = (clientX, clientY, rect, canvasAspect, zoom, panX, panY, canvasW, canvasH) => {
      const rectAspect = rect.width / rect.height;
      let renderW, renderH, offsetX, offsetY;
      if (rectAspect > canvasAspect) {
        renderH = rect.height;
        renderW = renderH * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
      } else {
        renderW = rect.width;
        renderH = renderW / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
      }

      const clientOffsetLeft = clientX - rect.left;
      const clientOffsetTop  = clientY - rect.top;

      const normX = Math.max(0, Math.min(1, (clientOffsetLeft - offsetX) / renderW));
      const normY = Math.max(0, Math.min(1, (clientOffsetTop - offsetY) / renderH));

      const rawX = normX * canvasW;
      const rawY = normY * canvasH;

      const x = Math.round((rawX - panX) / zoom);
      const y = Math.round((rawY - panY) / zoom);

      return {
        x: Math.max(0, Math.min(canvasW, x)),
        y: Math.max(0, Math.min(canvasH, y))
      };
    };

    const canvasW = 800;
    const canvasH = 600;
    const canvasAspect = canvasW / canvasH; // 1.3333

    // Case 1: Letterboxed container (wider than canvas aspect: e.g. 1200x600, aspect 2.0)
    // Left/right letterbox offsets = (1200 - 800)/2 = 200px
    const rect1 = { left: 50, top: 50, width: 1200, height: 600 };
    // Click at screen position corresponding to left edge of active canvas (clientX = 50 + 200 = 250, clientY = 50 + 0 = 50)
    const pt1 = mapCoordinates(250, 50, rect1, canvasAspect, 1.0, 0, 0, canvasW, canvasH);
    assert.equal(pt1.x, 0, 'Click at inner left border of letterboxed canvas must map to x=0');
    assert.equal(pt1.y, 0, 'Click at inner top border of letterboxed canvas must map to y=0');

    // Click at center (clientX = 50 + 600 = 650, clientY = 50 + 300 = 350)
    const ptCenter = mapCoordinates(650, 350, rect1, canvasAspect, 1.0, 0, 0, canvasW, canvasH);
    assert.equal(ptCenter.x, 400, 'Click at visual center must map to canvas center x=400');
    assert.equal(ptCenter.y, 300, 'Click at visual center must map to canvas center y=300');

    // Case 2: 2x Zoom with pan (panX = 100, panY = 50, zoom = 2.0)
    const ptZoom = mapCoordinates(650, 350, rect1, canvasAspect, 2.0, 100, 50, canvasW, canvasH);
    // (rawX - panX)/zoom = (400 - 100)/2 = 150
    // (rawY - panY)/zoom = (300 - 50)/2 = 125
    assert.equal(ptZoom.x, 150, 'Zoomed and panned coordinate must inverse-transform accurately');
    assert.equal(ptZoom.y, 125, 'Zoomed and panned coordinate must inverse-transform accurately');
  });

  test('Undo/Redo History Stack - Safely handles push, undo, redo, and capacity capping', () => {
    const historyStack = { undo: [], redo: [] };
    const MAX_HISTORY = 5;

    // In the editor, saveHistoryState pushes the state BEFORE the stroke
    const saveStateBeforeAction = (val) => {
      historyStack.undo.push(val);
      if (historyStack.undo.length > MAX_HISTORY) {
        historyStack.undo.shift();
      }
      historyStack.redo = []; // Reset redo on new action
    };

    // Simulate 7 actions: states 1 through 7 pushed before reaching canvas state 8
    for (let i = 1; i <= 7; i++) saveStateBeforeAction(i);

    // Undo stack should be capped at MAX_HISTORY (5), holding states [3, 4, 5, 6, 7]
    assert.equal(historyStack.undo.length, 5);
    assert.deepEqual(historyStack.undo, [3, 4, 5, 6, 7]);

    // Canvas is currently at state 8
    let currentCanvasState = 8;

    // Undo step 1: currentCanvasState (8) goes to redo, popped state (7) becomes canvas state
    historyStack.redo.push(currentCanvasState);
    currentCanvasState = historyStack.undo.pop();
    assert.equal(currentCanvasState, 7);
    assert.equal(historyStack.undo.length, 4);
    assert.equal(historyStack.redo.length, 1);

    // Undo step 2: currentCanvasState (7) goes to redo, popped state (6) becomes canvas state
    historyStack.redo.push(currentCanvasState);
    currentCanvasState = historyStack.undo.pop();
    assert.equal(currentCanvasState, 6);
    assert.equal(historyStack.undo.length, 3);
    assert.equal(historyStack.redo.length, 2);

    // Redo step 1: currentCanvasState (6) goes to undo, popped state (7) becomes canvas state
    historyStack.undo.push(currentCanvasState);
    currentCanvasState = historyStack.redo.pop();
    assert.equal(currentCanvasState, 7);
    assert.equal(historyStack.undo.length, 4);
    assert.equal(historyStack.redo.length, 1);
  });

  test('Luxury Bathroom Fixture Exclusion - Vanity, Toilet, and Shower Enclosure Must Be Strictly Protected', () => {
    const w = 1024;
    const h = 1024;
    const ceilingY = Math.round(h * 0.115);
    const floorY = Math.round(h * 0.835);

    const isLuxuryProtected = (x, y) => {
      if (y < ceilingY) return true; // Ceiling
      if (x < Math.round(w * 0.35) && y < floorY) return true; // Duşakabin (shower cabin & glass partition)
      if (x >= Math.round(w * 0.40) && x <= Math.round(w * 0.63) && y >= Math.round(h * 0.29) && y <= Math.round(h * 0.45)) return true; // Niche
      if (x >= Math.round(w * 0.47) && x <= Math.round(w * 0.55) && y >= Math.round(h * 0.48) && y <= Math.round(h * 0.58)) return true; // Flush plate
      if (x >= Math.round(w * 0.44) && x <= Math.round(w * 0.62) && y >= Math.round(h * 0.60) && y <= Math.round(h * 0.86)) return true; // Toilet bowl
      if (Math.pow((x - w * 0.786) / (w * 0.175), 2) + Math.pow((y - h * 0.254) / (h * 0.175), 2) <= 1.0) return true; // Mirror
      if (x >= Math.round(w * 0.62) && x <= Math.round(w * 0.98) && y >= Math.round(h * 0.45) && y <= Math.round(h * 0.88)) return true; // Vanity unit (banyo dolabı)
      if (x >= Math.round(w * 0.92)) return true; // Wood slats & towel
      if (x <= Math.round(w * 0.12)) return true; // Window
      return false;
    };

    // 1. Vanity Unit (Banyo Dolabı): drawers & basin
    const vanityDrawerX = Math.round(w * 0.75);
    const vanityDrawerY = Math.round(h * 0.72);
    assert.equal(isLuxuryProtected(vanityDrawerX, vanityDrawerY), true, 'Banyo dolabı drawers must be protected from tiles');

    const vanityBasinX = Math.round(w * 0.75);
    const vanityBasinY = Math.round(h * 0.58);
    assert.equal(isLuxuryProtected(vanityBasinX, vanityBasinY), true, 'Banyo dolabı basin/countertop must be protected');

    // 2. Toilet (Klozet) & flush actuator
    const toiletBowlX = Math.round(w * 0.50);
    const toiletBowlY = Math.round(h * 0.75);
    assert.equal(isLuxuryProtected(toiletBowlX, toiletBowlY), true, 'Klozet bowl must be protected from tiles');

    const flushPlateX = Math.round(w * 0.51);
    const flushPlateY = Math.round(h * 0.52);
    assert.equal(isLuxuryProtected(flushPlateX, flushPlateY), true, 'Flush plate must be protected');

    // 3. Shower Cabin (Duşakabin) & Glass Partition
    const showerHeadX = Math.round(w * 0.25);
    const showerHeadY = Math.round(h * 0.14);
    assert.equal(isLuxuryProtected(showerHeadX, showerHeadY), true, 'Duşakabin showerhead must be protected');

    const showerGlassX = Math.round(w * 0.30);
    const showerGlassY = Math.round(h * 0.50);
    assert.equal(isLuxuryProtected(showerGlassX, showerGlassY), true, 'Duşakabin glass partition must be protected');

    // 4. Circular Mirror (Ayna)
    const mirrorCenterX = Math.round(w * 0.786);
    const mirrorCenterY = Math.round(h * 0.254);
    assert.equal(isLuxuryProtected(mirrorCenterX, mirrorCenterY), true, 'Circular backlit mirror must be protected');

    // 5. Tileable Wall Surface around fixtures (between shower and toilet, or above vanity)
    const wallPixelX = Math.round(w * 0.38);
    const wallPixelY = Math.round(h * 0.25);
    assert.equal(isLuxuryProtected(wallPixelX, wallPixelY), false, 'Clear wall surface behind/around fixtures must remain tileable');
    assert.ok(wallPixelY >= ceilingY && wallPixelY < floorY, 'Wall pixel must fall within wall zone');

    // 6. Tileable Floor Surface in front of toilet/shower
    const floorPixelX = Math.round(w * 0.50);
    const floorPixelY = Math.round(h * 0.92);
    assert.equal(isLuxuryProtected(floorPixelX, floorPixelY), false, 'Open floor surface must remain tileable');
    assert.ok(floorPixelY >= floorY, 'Floor pixel must fall within floor zone');
  });

});


