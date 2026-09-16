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

// Helper to determine the best Gemini model name
async function getBestGeminiModel(apiKey) {
  const preferredModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    if (response.ok) {
      const data = await response.json();
      const availableModels = data.models || [];
      const genModels = availableModels
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      for (const pref of preferredModels) {
        if (genModels.includes(pref)) {
          return pref;
        }
      }
      if (genModels.length > 0) return genModels[0];
    }
  } catch (err) {
    console.error('[AI Segment] Gemini list models failed:', err);
  }
  return 'gemini-3.6-flash';
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

    // If no API Key is provided, use calibrated fallbacks
    if (!apiKey) {
      console.warn(`[AI Segment] No API Key provided for ${provider}. Using calibrated geometric fallback.`);
      const fallbackPolygon = target === 'floor' 
        ? [ [0, 54], [100, 54], [100, 100], [0, 100] ]
        : [ [0, 0], [100, 0], [100, 54], [0, 54] ];

      const fallbackExclude = [];

      return NextResponse.json({
        success: true,
        polygon: fallbackPolygon,
        exclude: fallbackExclude,
        isFallback: true,
        message: 'API Key missing. Pre-calibrated fallback applied.'
      });
    }

    const prompt = target === 'floor'
      ? `You are an expert interior architecture AI system.
Analyze this room photo and accurately detect the entire FLOOR PLANE (zemin / taban).

1. Find the 4 corner points of the full floor surface in perspective:
   Order clockwise:
   - Top-Left: where the back wall or windows meet the floor on the left (e.g. around y=50-60%)
   - Top-Right: where the back wall or windows meet the floor on the right
   - Bottom-Right: [100, 100] (bottom right corner of image)
   - Bottom-Left: [0, 100] (bottom left corner of image)
   Note: Unless obstructed, bottom corners should be [100, 100] and [0, 100] so the floor covers the entire foreground.

2. Identify any foreground furniture or fixtures standing on the floor that should NOT have tiles painted on top:
   - Sofas, armchairs, coffee tables, dining tables, chairs
   - TV console, cabinets, fireplace base, staircase
   - Bathtubs, sinks, toilets, bathroom vanities
   Outline each foreground object as a tight polygon of points.

Return ONLY a JSON object:
{
  "polygon": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
  "exclude": [
    [[x, y], [x, y], ...],
    ...
  ]
}
where each (x, y) is an integer or decimal percentage from 0 to 100. Return raw JSON without markdown.`
      : `You are an expert interior architecture AI system.
Analyze this room photo and find the main WALL surfaces (duvar).
1. Identify the 4 corner points of the wall surface: Top-Left, Top-Right, Bottom-Right, Bottom-Left.
2. Identify foreground fixtures (mirrors, wall art, lamps, windows, cabinets) to exclude.

Return ONLY a JSON object:
{
  "polygon": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
  "exclude": [
    [[x, y], [x, y], ...],
    ...
  ]
}
where each (x, y) is an integer or decimal percentage from 0 to 100. Return raw JSON without markdown.`;

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
      // Gemini provider
      const modelName = await getBestGeminiModel(apiKey);
      console.log(`[AI Segment] Calling Gemini (${modelName}) for target: ${target}...`);
      
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

      if (!response.ok) {
        const errText = await response.text();
        console.error('[AI Segment - Gemini Error]', errText);
        throw new Error(`Gemini API returned error: ${response.status}`);
      }

      const data = await response.json();
      resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    }

    if (!resultText) {
      throw new Error('AI provider did not return any content.');
    }

    const cleanedText = cleanJsonString(resultText);
    const parsedData = JSON.parse(cleanedText);
    
    if (!parsedData.polygon || !Array.isArray(parsedData.polygon) || parsedData.polygon.length !== 4) {
      throw new Error('Invalid polygon format returned from AI.');
    }

    console.log(`[AI Segment] Successfully segmented target: ${target} using ${provider}`);
    return NextResponse.json({
      success: true,
      polygon: parsedData.polygon,
      exclude: parsedData.exclude || [],
      isFallback: false
    });

  } catch (error) {
    console.error('[AI Segment Route Error]', error);
    
    // Graceful fallback values
    const fallbackPolygon = target === 'walls'
      ? [ [0, 0], [100, 0], [100, 54], [0, 54] ]
      : [ [0, 54], [100, 54], [100, 100], [0, 100] ];

    const fallbackExclude = [];

    return NextResponse.json({
      success: true,
      polygon: fallbackPolygon,
      exclude: fallbackExclude,
      isFallback: true,
      error: error.message
    });
  }
}
