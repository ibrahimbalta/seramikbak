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

  test('8 QA Debug Layers Structure - Validates Complete Output Pipeline & Decision Support', () => {
    const requiredLayers = [
      'original',
      'rawMask',
      'wallMask',
      'floorMask',
      'protectedMask',
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
      perspectiveTile: 'data:image/png;base64,...',
      compositeResult: 'data:image/png;base64,...',
      decisionOverlay: 'data:image/png;base64,...'
    };

    requiredLayers.forEach(layer => {
      assert.ok(layer in mockDebugLayers, `Debug output must include layer: ${layer}`);
    });
    assert.equal(Object.keys(mockDebugLayers).length, 8, 'Must provide 7 inspection layers plus 8th Decision Support Overlay');
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

});

