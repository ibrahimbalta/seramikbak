import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  resolveSafeTextureUrl, 
  classifyTileProportion, 
  buildSurfaces, 
  validateUploadFile,
  clampCoord
} from '../src/utils/renovationUtils.js';

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
