import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Helper: Retrieve Gemini API Key (from DB SystemSetting or headers or env)
// ---------------------------------------------------------------------------
async function getGeminiKey(request) {
  let dbKey = '';
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'gemini_api_key' }
    });
    if (setting?.value) {
      dbKey = setting.value;
    }
  } catch (err) {
    console.warn('[AI Re-Tile] Could not read gemini_api_key from DB:', err.message);
  }

  return (
    dbKey ||
    request.headers.get('x-ai-key') ||
    request.headers.get('x-gemini-key') ||
    process.env.GEMINI_API_KEY ||
    ''
  );
}

// ---------------------------------------------------------------------------
// Helper: Get the best Gemini model that supports image generation
// ---------------------------------------------------------------------------
async function getImageGenModel(apiKey) {
  // Models that support generateContent with image output
  const preferredModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
  ];

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    if (response.ok) {
      const data = await response.json();
      const available = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      for (const pref of preferredModels) {
        if (available.includes(pref)) return pref;
      }
      if (available.length > 0) return available[0];
    }
  } catch (err) {
    console.error('[AI Re-Tile] Failed to list Gemini models:', err.message);
  }
  return 'gemini-2.5-flash-image';
}

// ---------------------------------------------------------------------------
// Helper: Fetch an image URL and return base64
// ---------------------------------------------------------------------------
async function urlToBase64(url) {
  // If already base64/data-url, extract the base64 portion
  if (url.startsWith('data:')) {
    return {
      base64: url.split('base64,')[1],
      mimeType: url.split(';')[0].split(':')[1] || 'image/jpeg',
    };
  }

  // Resolve relative URLs (e.g. /textures/...)
  const fullUrl = url.startsWith('http')
    ? url
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seramikbak.com'}${url}`;

  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  return { base64, mimeType };
}

// ---------------------------------------------------------------------------
// Fallback: Style-matched static visual (when no API key or Gemini fails)
// ---------------------------------------------------------------------------
function getModelMatchedTileVisual({ style, color, name, roomType }) {
  const lcStyle = (style || '').toLowerCase();
  const lcColor = (color || '').toLowerCase();
  const lcName = (name || '').toLowerCase();

  if (lcStyle.includes('antrasit') || lcStyle.includes('siyah') || lcColor.includes('antrasit') || lcColor.includes('siyah') || lcName.includes('albatros') || lcName.includes('borneo')) {
    return '/textures/albatros_antrasit.jpg';
  }
  if (lcStyle.includes('beton') || lcStyle.includes('taş') || lcColor.includes('gri') || lcName.includes('loft') || lcName.includes('concrete')) {
    return '/hero/hero_ceramics.jpg';
  }
  if (lcStyle.includes('ahşap') || lcColor.includes('kahve') || lcName.includes('oak') || lcName.includes('teak') || lcName.includes('ahşap')) {
    return '/hero/scandinavian_kitchen.png';
  }
  if (lcStyle.includes('traverten') || lcColor.includes('bej') || lcName.includes('travertino') || lcName.includes('vista')) {
    return '/textures/travertino_classico.jpg';
  }
  return '/hero/luxury_bathroom.png';
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      image,           // Room photo (data URL or relative path)
      tileImageUrl,    // Tile texture image URL
      productName,
      style,
      color,
      finish,
      width,
      height,
      roomType,
    } = body;

    const fallbackVisual = getModelMatchedTileVisual({ style, color, name: productName, roomType });
    const geminiKey = await getGeminiKey(req);

    // -----------------------------------------------------------------------
    // Strategy 1: Gemini Image Editing (Best Quality — like ChatGPT)
    // -----------------------------------------------------------------------
    if (geminiKey && image) {
      try {
        console.log('[AI Re-Tile] Using Gemini image editing with room photo + tile texture');

        const modelName = await getImageGenModel(geminiKey);
        console.log(`[AI Re-Tile] Selected model: ${modelName}`);

        // Prepare room photo as base64
        const roomImage = await urlToBase64(image);

        // Build the prompt parts
        const parts = [
          {
            text: `You are an expert interior designer AI. I am giving you two images:
1. First image: A room photo (bathroom/kitchen/living room)
2. Second image: A ceramic tile texture

YOUR TASK: Realistically re-tile the walls and floor of the room in the first photo using the ceramic tile texture from the second image.

IMPORTANT RULES:
- Keep the EXACT SAME room layout, furniture, fixtures (sink, toilet, mirror, bathtub, cabinets) — do NOT change them
- Apply the tile texture ONLY to wall and floor surfaces
- Maintain proper perspective and vanishing points for tile grout lines
- Add realistic 2mm grout lines between tiles
- Tile size is ${width || 60}x${height || 120} cm
- Tile finish: ${finish || 'mat'}
- Preserve the original lighting, shadows, and reflections of the room
- The result must look like a professional architectural visualization
- Do NOT add or remove any objects from the room
- Output a single photorealistic image of the re-tiled room`,
          },
          {
            inlineData: {
              mimeType: roomImage.mimeType,
              data: roomImage.base64,
            },
          },
        ];

        // Add tile texture image if available
        if (tileImageUrl) {
          try {
            const tileImage = await urlToBase64(tileImageUrl);
            parts.push({
              inlineData: {
                mimeType: tileImage.mimeType,
                data: tileImage.base64,
              },
            });
          } catch (tileErr) {
            console.warn('[AI Re-Tile] Could not load tile texture, using text description:', tileErr.message);
            parts[0].text += `\n\nNote: The tile texture could not be loaded. Use a ${color || 'white'} ${style || 'marble'} ceramic tile texture based on this description: ${productName || 'Calacatta Gold'}.`;
          }
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              temperature: 0.4,
            },
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const candidates = geminiData.candidates || [];

          // Find the image part in the response
          for (const candidate of candidates) {
            const responseParts = candidate.content?.parts || [];
            for (const part of responseParts) {
              if (part.inlineData?.data) {
                const resultMime = part.inlineData.mimeType || 'image/jpeg';
                const resultDataUrl = `data:${resultMime};base64,${part.inlineData.data}`;

                console.log('[AI Re-Tile] ✅ Gemini image editing successful');
                return NextResponse.json({
                  success: true,
                  imageUrl: resultDataUrl,
                  method: 'gemini-image-edit',
                  model: modelName,
                });
              }
            }
          }

          // Gemini returned text but no image
          const textResponse = candidates[0]?.content?.parts?.find(p => p.text)?.text || '';
          console.warn('[AI Re-Tile] Gemini returned text but no image:', textResponse.substring(0, 200));
        } else {
          const errText = await geminiResponse.text();
          console.error(`[AI Re-Tile] Gemini API error (${geminiResponse.status}):`, errText.substring(0, 300));
        }
      } catch (geminiErr) {
        console.error('[AI Re-Tile] Gemini image editing failed:', geminiErr.message);
      }
    }

    // -----------------------------------------------------------------------
    // Strategy 2: Pollinations Fallback (text-to-image, lower quality)
    // -----------------------------------------------------------------------
    console.log('[AI Re-Tile] Falling back to Pollinations text-to-image');

    const targetRoom = roomType === 'salon' ? 'luxury living room' : roomType === 'mutfak' ? 'modern kitchen' : 'luxury bathroom';
    const prompt = `Photorealistic architectural interior design photo of a ${targetRoom}, all wall surfaces and floor retiled with high-end ${color || 'white'} ${style || 'Calacatta Marble'} ceramic porcelain tiles (${productName || 'Calacatta Gold'}, ${width || 60}x${height || 120} cm, ${finish || 'polished Lappato'} finish, realistic tile grout lines, natural ambient reflections), 8k resolution, architectural digest interior design photo`;
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&nologo=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const aiResponse = await fetch(aiImageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const arrayBuffer = await aiResponse.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        return NextResponse.json({
          success: true,
          imageUrl: dataUrl,
          fallbackUrl: fallbackVisual,
          method: 'pollinations',
          prompt,
        });
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn('[AI Re-Tile] Pollinations timed out:', fetchErr.message);
    }

    // -----------------------------------------------------------------------
    // Strategy 3: Static fallback (always works)
    // -----------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      imageUrl: fallbackVisual,
      method: 'static-fallback',
      prompt,
    });

  } catch (error) {
    console.error('[AI Re-Tile] Error:', error);
    return NextResponse.json({
      success: true,
      imageUrl: '/hero/luxury_bathroom.png',
      method: 'error-fallback',
      error: error.message,
    });
  }
}
