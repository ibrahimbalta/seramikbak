import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to sanitize JSON response
function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  // Remove markdown code block wrappers
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }
  return cleaned;
}

// Active and fast Gemini models with priority on verified vision models
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
  'gemini-3-flash-preview'
];

// Normalize coordinates to [0, 100] percentage range (Gemini vision often uses 0-1000)
function normalizePolygon(poly) {
  if (!Array.isArray(poly) || poly.length === 0) return poly;
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

// Helper to determine the best Grok model name
async function getBestGrokModel(apiKey) {
  const preferredModels = [
    'grok-2-vision',
    'grok-2-vision-1212',
    'grok-vision-beta',
    'grok-2'
  ];

  try {
    const listUrl = 'https://api.x.ai/v1/models';
    const response = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      const availableModels = data.data || [];
      const modelIds = availableModels.map(m => m.id);
      console.log('[AI Segment] Supported Grok models found:', modelIds);

      for (const pref of preferredModels) {
        if (modelIds.includes(pref)) {
          console.log(`[AI Segment] Selected preferred Grok model: ${pref}`);
          return pref;
        }
      }
      if (modelIds.length > 0) return modelIds[0];
    } else {
      console.warn('[AI Segment] Failed to list Grok models, status:', response.status);
    }
  } catch (err) {
    console.error('[AI Segment] Error listing Grok models:', err);
  }

  console.log('[AI Segment] Defaulting to grok-2-vision');
  return 'grok-2-vision';
}

export async function POST(request) {
  let target = 'floor';
  try {
    const body = await request.json();
    const { image, target: requestTarget } = body;
    if (requestTarget) {
      target = requestTarget;
    }

    if (!image) {
      return NextResponse.json({ success: false, error: 'Oda fotoğrafı yüklenmedi.' }, { status: 400 });
    }

    // Strip base64 headers if present
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    // Get AI settings from Database
    let dbProvider = 'gemini';
    let dbGeminiKey = '';
    let dbGrokKey = '';
    try {
      const settings = await prisma.systemSetting.findMany();
      settings.forEach(s => {
        if (s.key === 'ai_provider') dbProvider = s.value;
        if (s.key === 'gemini_api_key') dbGeminiKey = s.value;
        if (s.key === 'grok_api_key') dbGrokKey = s.value;
      });
    } catch (dbErr) {
      console.warn('[AI Segment] DB settings fetch failed:', dbErr.message);
    }

    // Get AI Provider and Key from headers or database or env
    const provider = request.headers.get('x-ai-provider') || dbProvider || 'gemini';
    const apiKey = request.headers.get('x-ai-key') || 
                   (provider === 'grok' ? dbGrokKey : dbGeminiKey) || 
                   (provider === 'grok' ? process.env.GROK_API_KEY : process.env.GEMINI_API_KEY) ||
                   dbGeminiKey ||
                   process.env.GEMINI_API_KEY;

    // Architectural fallbacks (preserving ceiling, mirrors, and windows)
    const fallbackFloor = {
      polygon: [ [0, 62], [100, 62], [100, 100], [0, 100] ],
      exclude: [ [ [40, 55], [60, 55], [60, 70], [40, 70] ] ]
    };

    const fallbackWalls = [
      {
        name: 'left_wall',
        polygon: [ [0, 18], [35, 20], [35, 62], [0, 62] ],
        exclude: []
      },
      {
        name: 'right_wall',
        polygon: [ [65, 20], [100, 18], [100, 62], [65, 62] ],
        exclude: [ [ [68, 18], [96, 18], [96, 52], [68, 52] ] ]
      },
      {
        name: 'back_wall',
        polygon: [ [35, 20], [65, 20], [65, 62], [35, 62] ],
        exclude: [ [ [40, 25], [60, 25], [60, 55], [40, 55] ] ]
      }
    ];

    // If no API Key is provided, use calibrated architectural fallback
    if (!apiKey) {
      console.warn(`[AI Segment] No API Key provided for ${provider}. Using calibrated fallback.`);
      if (target === 'all' || target === 'both') {
        return NextResponse.json({
          success: true,
          floor: fallbackFloor,
          walls: fallbackWalls,
          isFallback: true
        });
      }
      if (target === 'walls') {
        return NextResponse.json({
          success: true,
          walls: fallbackWalls,
          polygon: fallbackWalls[0].polygon,
          exclude: fallbackWalls[0].exclude,
          isFallback: true
        });
      }
      return NextResponse.json({
        success: true,
        polygon: fallbackFloor.polygon,
        exclude: fallbackFloor.exclude,
        isFallback: true
      });
    }

    let prompt = '';
    if (target === 'all' || target === 'both') {
      prompt = `You are an expert interior architecture AI system.
Analyze this room photo for ceramic tile remodel.
Identify the floor and vertical wall surfaces.

CRITICAL ARCHITECTURAL RULES:
1. FLOOR (zemin): Ground plane starting at bottom (y=100) extending to base of walls. Exclude furniture/fixtures (bathtub, stool, vanity).
2. WALLS (duvarlar): Only actual vertical wall surfaces.
   - The CEILING (top 15-25% of image with lights/plaster) is NEVER a wall. Do NOT include ceiling!
   - WINDOWS and outdoor views are NEVER walls. Exclude all windows!
   - MIRRORS (ayna) are NEVER walls. Exclude all mirrors!
   - Separate walls into distinct quads (left_wall, right_wall, back_wall).

Return ONLY valid JSON:
{
  "floor": {
    "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
    "exclude": [ [[x,y],...], ... ]
  },
  "walls": [
    {
      "name": "left_wall",
      "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      "exclude": [ [[x,y],...], ... ]
    },
    {
      "name": "right_wall",
      "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      "exclude": [ [[x,y],...], ... ]
    },
    {
      "name": "back_wall",
      "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      "exclude": [ [[x,y],...], ... ]
    }
  ]
}
Coordinates are percentage (0-100). Return raw JSON only.`;
    } else if (target === 'walls') {
      prompt = `You are an expert interior architecture AI system.
Analyze this room photo and find ONLY the vertical WALL surfaces (duvarlar) that can have tiles.

CRITICAL RULES:
- The CEILING (top of image) is NEVER a wall. Do NOT include the ceiling!
- WINDOWS and outdoor views are NEVER walls. Exclude all windows!
- MIRRORS are NEVER walls. Exclude all mirrors!
- Return individual wall quads: left_wall, right_wall, and back_wall.

Return ONLY valid JSON:
{
  "walls": [
    {
      "name": "left_wall",
      "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      "exclude": [ [[x,y],...], ... ]
    },
    {
      "name": "right_wall",
      "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
      "exclude": [ [[x,y],...], ... ]
    }
  ]
}
Coordinates are percentage (0-100). Return raw JSON only.`;
    } else {
      // floor
      prompt = `You are an expert interior architecture AI system.
Analyze this room photo and detect the FLOOR PLANE (zemin / taban).
1. Order clockwise: Top-Left, Top-Right, Bottom-Right [100,100], Bottom-Left [0,100].
2. Identify foreground fixtures on the floor to exclude (bathtub, vanity, sofa, table, stool).

Return ONLY valid JSON:
{
  "polygon": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]],
  "exclude": [ [[x,y],...], ... ]
}
Coordinates are percentage (0-100). Return raw JSON only.`;
    }

    let resultText = '';

    if (provider === 'grok') {
      const modelName = await getBestGrokModel(apiKey);
      console.log(`[AI Segment] Calling Grok (${modelName}) for target: ${target}...`);
      
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[AI Segment - Grok Error]', errText);
        throw new Error(`Grok API returned error: ${response.status}`);
      }

      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content?.trim();

    } else {
      // Gemini provider with multi-model fallback loop
      for (const modelName of GEMINI_MODELS) {
        try {
          console.log(`[AI Segment] Calling Gemini (${modelName}) for target: ${target}...`);
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
                responseMimeType: 'application/json'
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (resultText) {
              console.log(`[AI Segment] ✅ Successful response from ${modelName}`);
              break;
            }
          } else {
            console.warn(`[AI Segment] Model ${modelName} returned status ${response.status}`);
          }
        } catch (err) {
          console.warn(`[AI Segment] Gemini call failed on ${modelName}:`, err.message);
        }
      }
    }

    if (!resultText) {
      throw new Error('All AI models were unavailable or exhausted quota.');
    }

    const cleanedText = cleanJsonString(resultText);
    const parsedData = JSON.parse(cleanedText);

    // Format output based on target with coordinate normalization
    if (target === 'all' || target === 'both') {
      const rawFloor = parsedData.floor || (parsedData.polygon ? { polygon: parsedData.polygon, exclude: parsedData.exclude } : fallbackFloor);
      const floorObj = {
        polygon: normalizePolygon(rawFloor.polygon || fallbackFloor.polygon),
        exclude: normalizeExcludeList(rawFloor.exclude || fallbackFloor.exclude)
      };

      let wallsArr = [];
      if (Array.isArray(parsedData.walls)) {
        wallsArr = parsedData.walls.map(w => ({
          name: w.name || 'wall',
          polygon: normalizePolygon(w.polygon),
          exclude: normalizeExcludeList(w.exclude)
        })).filter(w => w.polygon && w.polygon.length >= 4);
      } else if (parsedData.walls && parsedData.walls.polygon) {
        wallsArr = [{
          name: parsedData.walls.name || 'wall',
          polygon: normalizePolygon(parsedData.walls.polygon),
          exclude: normalizeExcludeList(parsedData.walls.exclude)
        }];
      }

      if (wallsArr.length === 0) {
        wallsArr = fallbackWalls;
      }

      console.log(`[AI Segment] Segmented ALL: floor + ${wallsArr.length} walls`);
      return NextResponse.json({
        success: true,
        floor: floorObj,
        walls: wallsArr,
        isFallback: false
      });
    }

    if (target === 'walls') {
      let wallsArr = [];
      if (Array.isArray(parsedData.walls)) {
        wallsArr = parsedData.walls.map(w => ({
          name: w.name || 'wall',
          polygon: normalizePolygon(w.polygon),
          exclude: normalizeExcludeList(w.exclude)
        })).filter(w => w.polygon && w.polygon.length >= 4);
      } else if (parsedData.polygon) {
        wallsArr = [{
          name: 'wall',
          polygon: normalizePolygon(parsedData.polygon),
          exclude: normalizeExcludeList(parsedData.exclude)
        }];
      }

      if (wallsArr.length === 0) {
        wallsArr = fallbackWalls;
      }

      console.log(`[AI Segment] Segmented WALLS: ${wallsArr.length} wall surfaces`);
      return NextResponse.json({
        success: true,
        walls: wallsArr,
        polygon: wallsArr[0]?.polygon || fallbackWalls[0].polygon,
        exclude: wallsArr[0]?.exclude || [],
        isFallback: false
      });
    }

    // floor target: handle both { polygon: ... } and { floor: { polygon: ... } }
    const rawFloorPolygon = parsedData.polygon || parsedData.floor?.polygon;
    const rawFloorExclude = parsedData.exclude || parsedData.floor?.exclude || [];

    if (!rawFloorPolygon || !Array.isArray(rawFloorPolygon) || rawFloorPolygon.length < 4) {
      console.warn('[AI Segment] Fallback floor used due to polygon shape');
      return NextResponse.json({
        success: true,
        polygon: fallbackFloor.polygon,
        exclude: fallbackFloor.exclude,
        isFallback: true
      });
    }

    const normPolygon = normalizePolygon(rawFloorPolygon);
    const normExclude = normalizeExcludeList(rawFloorExclude);

    console.log(`[AI Segment] Segmented FLOOR successfully`);
    return NextResponse.json({
      success: true,
      polygon: normPolygon,
      exclude: normExclude,
      isFallback: false
    });

  } catch (error) {
    console.error('[AI Segment Route Error]', error.message);
    
    // Architectural fallback values (never tile ceiling or center window)
    if (target === 'all' || target === 'both') {
      return NextResponse.json({
        success: true,
        floor: {
          polygon: [ [0, 62], [100, 62], [100, 100], [0, 100] ],
          exclude: [ [ [40, 55], [60, 55], [60, 70], [40, 70] ] ]
        },
        walls: [
          {
            name: 'left_wall',
            polygon: [ [0, 18], [35, 20], [35, 62], [0, 62] ],
            exclude: []
          },
          {
            name: 'right_wall',
            polygon: [ [65, 20], [100, 18], [100, 62], [65, 62] ],
            exclude: [ [ [68, 18], [96, 18], [96, 52], [68, 52] ] ]
          },
          {
            name: 'back_wall',
            polygon: [ [35, 20], [65, 20], [65, 62], [35, 62] ],
            exclude: [ [ [40, 25], [60, 25], [60, 55], [40, 55] ] ]
          }
        ],
        isFallback: true,
        error: error.message
      });
    }

    if (target === 'walls') {
      const fallbackWalls = [
        {
          name: 'left_wall',
          polygon: [ [0, 18], [35, 20], [35, 62], [0, 62] ],
          exclude: []
        },
        {
          name: 'right_wall',
          polygon: [ [65, 20], [100, 18], [100, 62], [65, 62] ],
          exclude: [ [ [68, 18], [96, 18], [96, 52], [68, 52] ] ]
        }
      ];

      return NextResponse.json({
        success: true,
        walls: fallbackWalls,
        polygon: fallbackWalls[0].polygon,
        exclude: fallbackWalls[0].exclude,
        isFallback: true,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      polygon: [ [0, 62], [100, 62], [100, 100], [0, 100] ],
      exclude: [],
      isFallback: true,
      error: error.message
    });
  }
}
