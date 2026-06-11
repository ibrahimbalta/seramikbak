import { NextResponse } from 'next/server';

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
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
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
  return 'gemini-2.0-flash';
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

    // Get AI Provider and Key from headers
    const provider = request.headers.get('x-ai-provider') || 'grok'; // Default to grok
    const apiKey = request.headers.get('x-ai-key') || request.headers.get('x-gemini-key') || process.env.GROK_API_KEY || process.env.GEMINI_API_KEY;

    // If no API Key is provided, use calibrated fallbacks
    if (!apiKey) {
      console.warn(`[AI Segment] No API Key provided for ${provider}. Using local geometric fallback.`);
      const fallbackPolygon = target === 'floor' 
        ? [ [18, 62], [82, 62], [100, 100], [0, 100] ]
        : [ [5, 5], [95, 5], [95, 62], [5, 62] ];

      const fallbackExclude = target === 'floor'
        ? [ [ [0, 62], [48, 62], [48, 100], [0, 100] ] ]
        : [ [ [11, 13], [29, 13], [29, 56], [11, 56] ] ];

      return NextResponse.json({
        success: true,
        polygon: fallbackPolygon,
        exclude: fallbackExclude,
        isFallback: true,
        message: 'API Key missing. Pre-calibrated fallback applied.'
      });
    }

    const prompt = `
      You are an expert AI system for interior design and computer vision.
      Analyze this room photo and find the primary ${target === 'floor' ? 'floor surface (zemin)' : 'wall surface (duvar)'}.
      
      Identify the 4 corner points of this surface to form a perspective quadrilateral.
      Order the points clockwise starting from top-left:
      1. Top-Left corner
      2. Top-Right corner
      3. Bottom-Right corner
      4. Bottom-Left corner
      
      Also, detect any foreground objects that lie in front of this surface (such as sinks, mirrors, vanity cabinets, toilets, plants, bath tubs, windows).
      For each foreground object, outline its shape as a polygon.
      
      Return ONLY a JSON object with two keys "polygon" and "exclude":
      {
        "polygon": [ [x1, y1], [x2, y2], [x3, y3], [x4, y4] ],
        "exclude": [
          [ [e1x, e1y], [e2x, e2y], ... ],
          ...
        ]
      }
      where each coordinate (x, y) is an integer percentage from 0 to 100 relative to the image width and height.
      
      Return ONLY the raw JSON object. Do not wrap in markdown or include backticks.
    `;

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
      ? [ [5, 5], [95, 5], [95, 62], [5, 62] ]
      : [ [18, 62], [82, 62], [100, 100], [0, 100] ];

    const fallbackExclude = target === 'walls'
      ? [ [ [11, 13], [29, 13], [29, 56], [11, 56] ] ]
      : [ [ [0, 62], [48, 62], [48, 100], [0, 100] ] ];

    return NextResponse.json({
      success: true,
      polygon: fallbackPolygon,
      exclude: fallbackExclude,
      isFallback: true,
      error: error.message
    });
  }
}
