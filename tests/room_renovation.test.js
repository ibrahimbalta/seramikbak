import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  resolveSafeTextureUrl, 
  classifyTileProportion, 
  buildSurfaces, 
  validateUploadFile,
  clampCoord,
  createHomographyFromUnitSquare,
  projectPoint,
  calculateTileGrid,
  calculateDisplayedDimensions,
  normalizePolygon,
  calculateShadowRatio,
  calculateLuminanceMultiplier,
  featherAlphaBuffer
} from '../src/utils/renovationUtils.js';
import { 
  isConvexQuad, 
  calculatePolygonArea, 
  validateSurfaces, 
  validateRenderResult 
} from '../src/utils/qualityValidator.js';
import { getArchitecturalFallback } from '../src/services/RoomAnalysisService.js';

describe('Room Renovation Engine - Texture URL & Security Resolver', () => {
  it('should return default fallback texture when url is empty or undefined', () => {
    assert.equal(resolveSafeTextureUrl(null), '/textures/calacatta_gold.jpg');
    assert.equal(resolveSafeTextureUrl(''), '/textures/calacatta_gold.jpg');
    assert.equal(resolveSafeTextureUrl(undefined), '/textures/calacatta_gold.jpg');
  });

  it('should preserve local relative paths directly without proxy', () => {
    const local = '/textures/loft_beton.jpg';
    assert.equal(resolveSafeTextureUrl(local), '/textures/loft_beton.jpg');
  });

  it('should preserve base64 data URLs directly without proxy', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    assert.equal(resolveSafeTextureUrl(dataUrl), dataUrl);
  });

  it('should preserve blob URLs directly without proxy', () => {
    const blobUrl = 'blob:http://localhost:3000/1234-5678';
    assert.equal(resolveSafeTextureUrl(blobUrl), blobUrl);
  });

  it('should wrap external http/https URLs with /api/proxy to prevent canvas tainting', () => {
    const remote = 'https://res.cloudinary.com/seramikbak/image/upload/v1/marble.jpg';
    const resolved = resolveSafeTextureUrl(remote);
    assert.equal(resolved, `/api/proxy?url=${encodeURIComponent(remote)}`);
  });
});

describe('Room Renovation Engine - Aspect Ratio & Physical Scale Calculator', () => {
  it('should correctly classify 20x120 cm as wood plank', () => {
    const res = classifyTileProportion(20, 120);
    assert.equal(res.isPlank, true);
    assert.equal(res.isSquare, false);
    assert.equal(res.isGrandSlab, false);
  });

  it('should correctly classify 60x60 and 80x80 cm as square tiles', () => {
    const res60 = classifyTileProportion(60, 60);
    assert.equal(res60.isSquare, true);
    assert.equal(res60.isPlank, false);

    const res80 = classifyTileProportion(80, 80);
    assert.equal(res80.isSquare, true);
  });

  it('should correctly classify 60x120 and 120x240 cm as grand format architectural slabs', () => {
    const res60120 = classifyTileProportion(60, 120);
    assert.equal(res60120.isGrandSlab, true);
    assert.equal(res60120.isPlank, false);
    assert.equal(res60120.isSquare, false);

    const res120240 = classifyTileProportion(120, 240);
    assert.equal(res120240.isGrandSlab, true);
  });
});

describe('Room Renovation Engine - Surface Target & Pin Mapping', () => {
  const defaultFloor = [ [15, 68], [85, 68], [100, 100], [0, 100] ];
  const defaultWall = [ [0, 18], [100, 18], [100, 68], [0, 68] ];

  it('should populate floor and leave walls empty when target is floor only', () => {
    const surfaces = buildSurfaces('floor', defaultFloor, defaultWall);
    assert.ok(surfaces.floor);
    assert.equal(surfaces.floor.polygon.length, 4);
    assert.equal(surfaces.walls.length, 0);
  });

  it('should populate walls and leave floor null when target is walls only', () => {
    const surfaces = buildSurfaces('walls', defaultFloor, defaultWall);
    assert.equal(surfaces.floor, null);
    assert.equal(surfaces.walls.length, 1);
    assert.equal(surfaces.walls[0].polygon.length, 4);
  });

  it('should populate both floor and walls when target is both', () => {
    const surfaces = buildSurfaces('both', defaultFloor, defaultWall);
    assert.ok(surfaces.floor);
    assert.equal(surfaces.walls.length, 1);
  });

  it('should clamp percentage coordinates properly', () => {
    assert.equal(clampCoord(-10), 0);
    assert.equal(clampCoord(150), 100);
    assert.equal(clampCoord(45.6), 46);
  });
});

describe('Room Renovation Engine - File Validation & Client-side Memory Safety', () => {
  it('should accept valid JPEG, PNG and WebP images', () => {
    assert.equal(validateUploadFile({ type: 'image/jpeg', size: 1024 * 1024 }).valid, true);
    assert.equal(validateUploadFile({ type: 'image/png', size: 5 * 1024 * 1024 }).valid, true);
    assert.equal(validateUploadFile({ type: 'image/webp', size: 2 * 1024 * 1024 }).valid, true);
  });

  it('should reject non-image file types (PDF, JS, HTML)', () => {
    assert.equal(validateUploadFile({ type: 'application/pdf', size: 1024 }).valid, false);
    assert.equal(validateUploadFile({ type: 'text/html', size: 1024 }).valid, false);
  });

  it('should reject files exceeding 20MB threshold', () => {
    assert.equal(validateUploadFile({ type: 'image/jpeg', size: 25 * 1024 * 1024 }).valid, false);
  });

  it('should reject null or undefined file input safely', () => {
    assert.equal(validateUploadFile(null).valid, false);
    assert.equal(validateUploadFile(undefined).valid, false);
  });
});

describe('Room Renovation Engine - Projective 3D Homography Matrix', () => {
  // Trapezoid quad representing a floor in perspective
  const floorQuad = [
    [200, 300], // Top-Left
    [800, 300], // Top-Right
    [1000, 700], // Bottom-Right
    [50, 700]    // Bottom-Left
  ];

  it('should accurately map unit square 4 corners to exact destination quad coordinates', () => {
    const H = createHomographyFromUnitSquare(floorQuad);
    assert.ok(H, 'Homography matrix should not be null');

    const p0 = projectPoint(H, 0, 0); // TL
    const p1 = projectPoint(H, 1, 0); // TR
    const p2 = projectPoint(H, 1, 1); // BR
    const p3 = projectPoint(H, 0, 1); // BL

    assert.ok(Math.abs(p0[0] - 200) < 1e-4);
    assert.ok(Math.abs(p0[1] - 300) < 1e-4);

    assert.ok(Math.abs(p1[0] - 800) < 1e-4);
    assert.ok(Math.abs(p1[1] - 300) < 1e-4);

    assert.ok(Math.abs(p2[0] - 1000) < 1e-4);
    assert.ok(Math.abs(p2[1] - 700) < 1e-4);

    assert.ok(Math.abs(p3[0] - 50) < 1e-4);
    assert.ok(Math.abs(p3[1] - 700) < 1e-4);
  });

  it('should project interior points inside the quadrilateral with realistic perspective foreshortening', () => {
    const H = createHomographyFromUnitSquare(floorQuad);
    const center = projectPoint(H, 0.5, 0.5);

    // X center should be between left and right bounds
    assert.ok(center[0] > 100 && center[0] < 900);
    // Y center with perspective foreshortening should be higher than linear midpoint 500
    assert.ok(center[1] > 300 && center[1] < 700);
  });

  it('should handle affine parallelogram quads correctly', () => {
    const parallelogram = [
      [100, 100],
      [500, 100],
      [600, 400],
      [200, 400]
    ];
    const H = createHomographyFromUnitSquare(parallelogram);
    assert.ok(H);
    assert.equal(H.g, 0);
    assert.equal(H.h, 0);

    const br = projectPoint(H, 1, 1);
    assert.ok(Math.abs(br[0] - 600) < 1e-4);
    assert.ok(Math.abs(br[1] - 400) < 1e-4);
  });

  it('should safely return null for degenerate or collinear points', () => {
    const collinear = [
      [100, 100],
      [200, 200],
      [300, 300],
      [400, 400]
    ];
    const H = createHomographyFromUnitSquare(collinear);
    assert.equal(H, null);
    assert.equal(projectPoint(null, 0.5, 0.5), null);
  });
});

describe('Room Renovation Engine - Tile Grid Calculation & Architectural Aspect', () => {
  it('should compute 4 cols and 2 rows for 60x120 cm slabs (1:2 ratio, not square)', () => {
    const grid = calculateTileGrid(60, 120, true);
    assert.equal(grid.cols, 4);
    assert.equal(grid.rows, 2);
    assert.equal(grid.ratio, 0.5);
  });

  it('should compute 4 cols and 4 rows for 60x60 cm square tiles (1:1 ratio)', () => {
    const grid = calculateTileGrid(60, 60, true);
    assert.equal(grid.cols, 4);
    assert.equal(grid.rows, 4);
    assert.equal(grid.ratio, 1.0);
  });

  it('should compute 12 cols and 2 rows for 20x120 cm wood plank tiles', () => {
    const grid = calculateTileGrid(20, 120, true);
    assert.equal(grid.cols, 12);
    assert.equal(grid.rows, 2);
    assert.ok(grid.ratio < 0.2);
  });

  it('should compute 2 cols and 1 row for 120x240 cm grand format slabs', () => {
    const grid = calculateTileGrid(120, 240, true);
    assert.equal(grid.cols, 2);
    assert.equal(grid.rows, 1);
  });

  it('should dynamically adapt tile columns and rows when a specific surface quad is provided', () => {
    // Narrow niche quad spanning only 35% of room width
    const narrowNicheQuad = [ [31, 31], [66, 31], [66, 50], [31, 50] ];
    const nicheGrid = calculateTileGrid(60, 120, false, 'vertical', narrowNicheQuad);
    assert.ok(nicheGrid.cols <= 2, 'Narrow niche should have fewer tile columns than full room');

    // Wide living room floor spanning 100% of room width
    const wideFloorQuad = [ [0, 50], [100, 50], [100, 100], [0, 100] ];
    const wideGrid = calculateTileGrid(60, 60, true, 'vertical', wideFloorQuad);
    assert.ok(wideGrid.cols >= 4, 'Full room width should tile across multiple columns');
  });
});

describe('Room Renovation Engine - Displayed Dimensions & Zero-Letterbox Stage', () => {
  it('should preserve 4:3 aspect ratio perfectly within max constraints', () => {
    const dim = calculateDisplayedDimensions(1200, 900, 1100, 520);
    // Height capped at 520, width should be 520 * (4/3) = 693
    assert.equal(dim.height, 520);
    assert.equal(dim.width, 693);
    assert.ok(Math.abs(dim.aspectRatio - 4 / 3) < 1e-4);
  });

  it('should preserve 16:9 widescreen aspect ratio within max constraints', () => {
    const dim = calculateDisplayedDimensions(1920, 1080, 1100, 520);
    // Width capped at 1100, height = 1100 / (16/9) = 619 > 520 -> so height is 520, width = 520 * (16/9) = 924
    assert.equal(dim.height, 520);
    assert.equal(dim.width, 924);
  });

  it('should handle vertical 9:16 smartphone photos without overflowing max height', () => {
    const dim = calculateDisplayedDimensions(1080, 1920, 1100, 520);
    assert.equal(dim.height, 520);
    assert.equal(dim.width, 293);
  });
});

describe('Room Renovation Engine - Coordinate Normalizer', () => {
  it('should clamp standard 0-100 coordinates without scaling', () => {
    const poly = [[10, 20], [80, 90]];
    const res = normalizePolygon(poly);
    assert.deepEqual(res, [[10, 20], [80, 90]]);
  });

  it('should downscale 0-1000 range Gemini vision coordinates to 0-100 percentage space', () => {
    const poly = [[100, 200], [800, 950]];
    const res = normalizePolygon(poly);
    assert.deepEqual(res, [[10, 20], [80, 95]]);
  });

  it('should safely return empty array for invalid input', () => {
    assert.deepEqual(normalizePolygon(null), []);
    assert.deepEqual(normalizePolygon([]), []);
  });
});

describe('Room Renovation Engine - Quality Validator & Geometry Tests', () => {
  it('should accept valid clockwise convex floor quadrilateral', () => {
    const quad = [[15, 65], [85, 65], [100, 100], [0, 100]];
    assert.equal(isConvexQuad(quad), true);
  });

  it('should reject self-intersecting / hourglass / bow-tie quad', () => {
    // Cross-over shape: P0(0,0), P1(100,100), P2(100,0), P3(0,100)
    const selfIntersecting = [[0, 0], [100, 100], [100, 0], [0, 100]];
    assert.equal(isConvexQuad(selfIntersecting), false);
  });

  it('should accurately calculate polygon area via Shoelace formula', () => {
    // 50x50 rectangle in percentage space = 2500 area
    const rect = [[10, 10], [60, 10], [60, 60], [10, 60]];
    const area = calculatePolygonArea(rect);
    assert.equal(area, 2500);
  });

  it('should validate sane surface configurations and reject tiny/degenerate polygons', () => {
    const validSurfaces = {
      floor: { polygon: [[10, 60], [90, 60], [100, 100], [0, 100]] },
      walls: [{ name: 'back', polygon: [[10, 20], [90, 20], [90, 60], [10, 60]] }]
    };
    const report = validateSurfaces(validSurfaces);
    assert.equal(report.isValid, true);
    assert.equal(report.issues.length, 0);

    const invalidSurfaces = {
      floor: { polygon: [[10, 60], [10.1, 60], [10.1, 60.1], [10, 60.1]] } // Tiny 0.01 area
    };
    const badReport = validateSurfaces(invalidSurfaces);
    assert.equal(badReport.isValid, false);
    assert.ok(badReport.issues.length > 0);
  });
});

describe('Room Renovation Engine - Architectural Fallback Service', () => {
  it('should adapt horizon for portrait vs widescreen photos', () => {
    const portrait = getArchitecturalFallback('both', 0.6); // 9:16 mobile portrait
    const landscape = getArchitecturalFallback('both', 1.77); // 16:9 widescreen landscape

    assert.ok(portrait.floor.polygon[0][1] >= 65, 'Portrait floor horizon should be lower');
    assert.ok(landscape.floor.polygon[0][1] <= 60, 'Landscape floor horizon should start higher');
    assert.equal(portrait.walls.length, 3, 'Should generate left, right and back wall quads');
  });
});

describe('Room Renovation Engine - Shadow Preservation & Lighting Blending (Option 1)', () => {
  it('should darken shadow areas where room luminance is lower than surrounding blurred luminance', () => {
    // Under bathtub/vanity: local luminance is 60, surrounding blurred background is 140
    const ratio = calculateShadowRatio(60, 140, 1.0);
    assert.ok(ratio < 0.70, `Expected shadow ratio < 0.70, got ${ratio}`);
    assert.ok(ratio >= 0.40, `Expected shadow ratio clamped >= 0.40, got ${ratio}`);
  });

  it('should maintain or brighten highlights where local luminance exceeds surroundings', () => {
    // Window sunlight patch: local luminance is 220, surrounding blurred background is 160
    const ratio = calculateShadowRatio(220, 160, 1.0);
    assert.ok(ratio > 1.10, `Expected highlight ratio > 1.10, got ${ratio}`);
    assert.ok(ratio <= 1.40, `Expected highlight ratio clamped <= 1.40, got ${ratio}`);
  });

  it('should respect shadow strength parameter', () => {
    const fullStrength = calculateShadowRatio(60, 140, 1.0);
    const halfStrength = calculateShadowRatio(60, 140, 0.5);
    // Half strength should be closer to 1.0 than full strength
    assert.ok(Math.abs(1.0 - halfStrength) < Math.abs(1.0 - fullStrength));
  });

  it('should safely handle division by zero and extreme values without throwing or NaN', () => {
    const zeroBlur = calculateShadowRatio(100, 0, 1.0);
    assert.ok(!Number.isNaN(zeroBlur) && Number.isFinite(zeroBlur));
    const zeroRoom = calculateShadowRatio(0, 100, 1.0);
    assert.ok(!Number.isNaN(zeroRoom) && Number.isFinite(zeroRoom));
  });

  it('should downscale overly bright catalog tile scans in dim rooms via luminance multiplier', () => {
    // Bright white studio catalog scan (mean 230) placed in dim bathroom (mean 90)
    const mult = calculateLuminanceMultiplier(230, 230, 20, 90, 25, 0.55);
    assert.ok(mult < 0.90, `Expected luminance multiplier < 0.90 for dimming, got ${mult}`);
    assert.ok(mult >= 0.55, `Expected clamped multiplier >= 0.55, got ${mult}`);
  });

  it('should upscale dark tile scans in brightly lit sunrooms via luminance multiplier', () => {
    // Dark anthracite tile scan (mean 60) placed in bright sunlit bathroom (mean 190)
    const mult = calculateLuminanceMultiplier(60, 60, 20, 190, 25, 0.55);
    assert.ok(mult > 1.10, `Expected luminance multiplier > 1.10 for brightening, got ${mult}`);
    assert.ok(mult <= 1.45, `Expected clamped multiplier <= 1.45, got ${mult}`);
  });

  it('should feather alpha buffer edges smoothly while preserving 100% opacity in interior', () => {
    const w = 8, h = 6;
    const alpha = new Uint8ClampedArray(w * h);
    // Fill interior box x: 2..5, y: 2..3 with 255
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 6; x++) {
        alpha[y * w + x] = 255;
      }
    }

    const feathered = featherAlphaBuffer(alpha, w, h, 1);
    assert.equal(feathered.length, w * h);

    // Deep interior pixel (x: 3, y: 2) should remain 100% full opacity (255)
    assert.equal(feathered[2 * w + 3], 255);

    // Boundary pixel (x: 1, y: 1) should be feathered to softer value (< 255)
    assert.ok(feathered[1 * w + 1] < 255, 'Boundary pixel should be softened');
    assert.ok(feathered[1 * w + 1] > 0, 'Boundary pixel should not be erased completely');

    // Exterior pixel (x: 0, y: 0) should remain strictly 0
    assert.equal(feathered[0 * w + 0], 0);
  });

  it('should handle invalid or zero-dimension featherAlphaBuffer safely', () => {
    const empty = featherAlphaBuffer(null, 0, 0, 2);
    assert.equal(empty, null);
    const dummy = new Uint8ClampedArray(10);
    const out = featherAlphaBuffer(dummy, 0, 0, 2);
    assert.equal(out, dummy);
  });
});
