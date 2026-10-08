/**
 * RoomAnalysisService.js
 * =======================
 * Service layer for AI-powered architectural room analysis and segmentation.
 * Automatically identifies floor planes, vertical wall quads, ceiling horizons,
 * and foreground obstacles (bathtubs, vanities, faucets, furniture) for the Room Renovation visualizer.
 */

import { normalizePolygon } from '../utils/renovationUtils.js';

/**
 * Intelligent architectural fallback based on image aspect ratio and horizon heuristics.
 * @param {'floor'|'walls'|'both'|'all'} target 
 * @param {number} imgRatio - width / height
 * @returns {object}
 */
export function getArchitecturalFallback(target = 'both', imgRatio = 1.0) {
  // Horizon estimation: Tall portraits have lower ground horizon, wide photos have wider floor
  const horizonY = imgRatio < 0.85 ? 68 : (imgRatio > 1.3 ? 58 : 64);

  const floor = {
    name: 'floor_plane',
    polygon: [
      [12, horizonY],
      [88, horizonY],
      [100, 100],
      [0, 100]
    ],
    exclude: []
  };

  const walls = [
    {
      name: 'back_wall',
      polygon: [
        [15, 18],
        [85, 18],
        [85, horizonY],
        [15, horizonY]
      ],
      exclude: []
    },
    {
      name: 'left_wall',
      polygon: [
        [0, 15],
        [15, 18],
        [15, horizonY],
        [0, horizonY + 8]
      ],
      exclude: []
    },
    {
      name: 'right_wall',
      polygon: [
        [85, 18],
        [100, 15],
        [100, horizonY + 8],
        [85, horizonY]
      ],
      exclude: []
    }
  ];

  if (target === 'floor') {
    return { floor, walls: [], obstacles: [], isFallback: true };
  }
  if (target === 'walls') {
    return { floor: null, walls, obstacles: [], isFallback: true };
  }
  return { floor, walls, obstacles: [], isFallback: true };
}

/**
 * Calls the AI segmentation endpoint to analyze room boundaries and fixtures.
 * @param {string} imageBase64OrUrl 
 * @param {'floor'|'walls'|'both'} target 
 * @param {number} [aspectRatio=1.0] 
 * @returns {Promise<{ floor: object|null, walls: Array<object>, obstacles: Array<object>, isFallback: boolean }>}
 */
export async function analyzeRoomSurfaces(imageBase64OrUrl, target = 'both', aspectRatio = 1.0) {
  if (!imageBase64OrUrl) {
    return getArchitecturalFallback(target, aspectRatio);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9500);

  try {
    const response = await fetch('/api/ai/segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageBase64OrUrl,
        target: target === 'both' ? 'all' : target
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Segment API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.success) {
      throw new Error(data?.error || 'Segmentasyon sonucu geçersiz');
    }

    // Extract floor
    let resolvedFloor = null;
    if (data.floor && Array.isArray(data.floor.polygon) && data.floor.polygon.length >= 4) {
      resolvedFloor = {
        name: 'floor',
        polygon: data.floor.polygon,
        exclude: Array.isArray(data.floor.exclude) ? data.floor.exclude : []
      };
    } else if (data.polygon && Array.isArray(data.polygon) && data.polygon.length >= 4) {
      resolvedFloor = {
        name: 'floor',
        polygon: data.polygon,
        exclude: Array.isArray(data.exclude) ? data.exclude : []
      };
    }

    // Extract walls
    let resolvedWalls = [];
    if (Array.isArray(data.walls)) {
      resolvedWalls = data.walls.filter(w => w && Array.isArray(w.polygon) && w.polygon.length >= 4);
    }

    // Extract obstacles / fixture excludes
    const obstacles = [];
    if (resolvedFloor && Array.isArray(resolvedFloor.exclude)) {
      resolvedFloor.exclude.forEach((poly, idx) => {
        if (poly && poly.length >= 3) {
          obstacles.push({ name: `fixture_${idx + 1}`, polygon: poly });
        }
      });
    }

    // If AI did not detect floor but target needed floor, blend with architectural fallback
    if (!resolvedFloor && (target === 'floor' || target === 'both')) {
      const fallback = getArchitecturalFallback('floor', aspectRatio);
      resolvedFloor = fallback.floor;
    }

    return {
      floor: resolvedFloor,
      walls: resolvedWalls,
      obstacles,
      isFallback: Boolean(data.isFallback)
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[RoomAnalysisService] AI segment call failed, applying architectural fallback:', err.message);
    return getArchitecturalFallback(target, aspectRatio);
  }
}
