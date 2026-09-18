import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }
  return cleaned;
}

function normalizePolygon(poly) {
  if (!Array.isArray(poly) || poly.length === 0) return [];
  let maxCoord = 0;
  for (const pt of poly) {
    if (Array.isArray(pt)) {
      maxCoord = Math.max(maxCoord, Number(pt[0]) || 0, Number(pt[1]) || 0);
    }
  }
  const scale = maxCoord > 105 ? (maxCoord > 2000 ? 100 : 10) : 1;
  return poly.map(([x, y]) => [
    Math.min(100, Math.max(0, Math.round(((Number(x) || 0) / scale) * 10) / 10)),
    Math.min(100, Math.max(0, Math.round(((Number(y) || 0) / scale) * 10) / 10))
  ]);
}

function normalizeExcludeList(excludes) {
  if (!Array.isArray(excludes)) return [];
  return excludes
    .map(poly => normalizePolygon(poly))
    .filter(p => Array.isArray(p) && p.length >= 3);
}

// Active and fast Gemini models
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
  'gemini-3-flash-preview'
];

/**
 * POST /api/ai/tile-render
 * =======================
 * Production-ready AI Ceramic Tile Surface Detection and Rendering API.
 *
 * Payload:
 * {
 *   roomImage: string (base64 or URL),
 *   productId?: string,
 *   productData?: {
 *     name, code, width, height, finish, style, color, textureUrl, imageUrl
 *   },
 *   surfaceType?: 'floor' | 'walls' | 'both',
 *   layout?: 'straight' | 'staggered_50' | 'staggered_33' | 'diagonal',
 *   groutWidth?: number (default 2mm),
 *   customMask?: Array<any>
 * }
 */
export async function POST(req) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      roomImage,
      productId,
      productData: rawProductData,
      surfaceType = 'floor',
      layout = 'straight',
      groutWidth = 2,
      customMask
    } = body;

    if (!roomImage) {
      return NextResponse.json(
        { success: false, error: 'Oda fotoğrafı yüklenmedi.' },
        { status: 400 }
      );
    }

    // 1. Fetch full product info and 4K texture
    let product = null;
    if (productId) {
      try {
        product = await prisma.product.findUnique({
          where: { id: productId },
          include: { brand: true }
        });
      } catch (dbErr) {
        console.warn('[Tile-Render API] Could not fetch product from DB:', dbErr.message);
      }
    }

    // Merge with rawProductData if passed from client
    const resolvedProduct = {
      id: product?.id || rawProductData?.id || 'custom-tile',
      name: product?.name || rawProductData?.name || 'Seçili Seramik',
      brand: product?.brand?.name || rawProductData?.brand || 'SeramikBak',
      code: product?.code || rawProductData?.code || 'SKU-60120',
      width: Number(product?.width || rawProductData?.width || 60),
      height: Number(product?.height || rawProductData?.height || 120),
      finish: product?.finish || rawProductData?.finish || 'Full Lappato',
      style: product?.style || rawProductData?.style || 'Mermer',
      color: product?.color || rawProductData?.color || 'Dark Green',
      textureUrl: product?.textureUrl || rawProductData?.textureUrl || product?.imageUrl || rawProductData?.imageUrl || '/textures/albatros_antrasit.jpg',
      imageUrl: product?.imageUrl || rawProductData?.imageUrl || '/textures/albatros_antrasit.jpg',
      groutWidth: Number(groutWidth || 2),
      layout: layout || 'straight'
    };

    // Strip base64 header if present
    const base64Data = roomImage.includes('base64,') ? roomImage.split('base64,')[1] : roomImage;

    // Retrieve API key
    let dbGeminiKey = '';
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'gemini_api_key' }
      });
      if (setting?.value) dbGeminiKey = setting.value;
    } catch (_) {}

    const apiKey = req.headers.get('x-ai-key') ||
                   dbGeminiKey ||
                   process.env.GEMINI_API_KEY;

    // Fallback architectural masks
    const fallbackFloor = {
      polygon: [[0, 68], [100, 68], [100, 100], [0, 100]],
      exclude: [[[35, 62], [65, 62], [65, 85], [35, 85]]]
    };

    const fallbackWalls = [
      {
        name: 'back_wall',
        polygon: [[20, 20], [80, 20], [80, 68], [20, 68]],
        exclude: [[[35, 25], [65, 25], [65, 55], [35, 55]]]
      }
    ];

    let maskData = { floor: null, walls: [] };

    // If customMask is supplied by client MaskBrushEditor, honor it directly
    if (customMask && (customMask.floor || customMask.walls)) {
      maskData = customMask;
    } else if (apiKey) {
      // 2. Perform semantic segmentation using Gemini Vision
      const prompt = `You are an expert interior architecture AI system.
Analyze this room photo for ceramic tile remodel (${resolvedProduct.name} ${resolvedProduct.width}x${resolvedProduct.height} cm).

CRITICAL ARCHITECTURAL RULES:
1. FLOOR (zemin): Ground plane starting at bottom (y=100) extending back to wall baseboards.
2. CLEAN EDGES: Provide sharp and accurate transition coordinates along baseboards, cabinet toe kicks, and furniture edges without blur.
3. OBJECT EXCLUSIONS: Identify all furniture and fixtures to preserve 100% untouched:
   - Bathtubs (küvet), toilets (klozet), sinks & vanities (lavabo/tezgah), faucets (musluk), shower glass (duş camı), doors (kapı), windows (pencere), mirrors (ayna), ceiling (tavan), humans (insan).
4. WALLS (duvarlar): Only true vertical tileable wall surfaces (shower wall, backsplash, feature wall).
   - NEVER include ceilings, mirrors, windows, or glass partitions as walls!

Return ONLY valid JSON:
{
  "floor": {
    "polygon": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
    "exclude": [ [[x, y], ...], ... ]
  },
  "walls": [
    {
      "name": "back_wall",
      "polygon": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
      "exclude": [ [[x, y], ...], ... ]
    }
  ]
}
Coordinates are percentages (0-100). Return raw JSON only.`;

      for (const modelName of GEMINI_MODELS) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              const parsed = JSON.parse(cleanJsonString(text));
              if (parsed.floor) {
                maskData.floor = {
                  polygon: normalizePolygon(parsed.floor.polygon),
                  exclude: normalizeExcludeList(parsed.floor.exclude)
                };
              }
              if (Array.isArray(parsed.walls)) {
                maskData.walls = parsed.walls.map(w => ({
                  name: w.name || 'wall',
                  polygon: normalizePolygon(w.polygon),
                  exclude: normalizeExcludeList(w.exclude)
                })).filter(w => w.polygon && w.polygon.length >= 4);
              }
              break;
            }
          }
        } catch (err) {
          console.warn(`[Tile-Render API] Model ${modelName} attempt failed:`, err.message);
        }
      }
    }

    // If maskData remains empty, use architectural fallbacks
    if (!maskData.floor) maskData.floor = fallbackFloor;
    if (!maskData.walls || maskData.walls.length === 0) maskData.walls = fallbackWalls;

    const processingTime = Date.now() - startTime;

    const tileTypeAndColor = `${resolvedProduct.name} ${resolvedProduct.color ? `- ${resolvedProduct.color}` : ''} ${resolvedProduct.style ? `(${resolvedProduct.style})` : ''}`.trim();
    const tileSizeAndFinish = `${resolvedProduct.width}x${resolvedProduct.height} cm ${resolvedProduct.finish || 'Full Lappato'}`.trim();

    const architecturalPrompt = `Photo-realistic interior design render. Replace the existing floor in the masked area with ${tileTypeAndColor} tiles.

Key Requirements:
- Pattern & Texture: ${tileSizeAndFinish} with subtle natural texture.
- Alignment & Perspective: Tiles must follow the natural perspective lines and depth of the room.
- Details: Seamless installation, ultra-thin precise grout lines matching the tile color.
- Lighting & Reflections: Realistic floor reflections, ambient indoor lighting, natural shadows cast by furniture onto the new ceramic floor.
- Clean Edges: Sharp and accurate transition along the baseboards and furniture edges. No blur, high resolution 8k.`;

    return NextResponse.json({
      success: true,
      product: resolvedProduct,
      surfaceType,
      layout,
      groutWidth: resolvedProduct.groutWidth,
      maskData,
      architecturalPrompt,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error('[Tile-Render API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Seramik döşeme analizi sırasında hata oluştu.'
      },
      { status: 500 }
    );
  }
}
