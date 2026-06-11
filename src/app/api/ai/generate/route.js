import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
    }

    const provider = request.headers.get('x-ai-provider') || 'grok';
    const apiKey = request.headers.get('x-ai-key') || process.env.GROK_API_KEY || process.env.GEMINI_API_KEY;

    // If no API key, fall back to a beautiful public image (curated modern bathrooms)
    if (!apiKey) {
      console.warn('[AI Generate] No API Key. Falling back to a high-quality free Unsplash bathroom image.');
      const fallbacks = [
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1024&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1024&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1024&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1024&auto=format&fit=crop'
      ];
      const randomImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return NextResponse.json({
        success: true,
        image: randomImage,
        isFallback: true,
        message: 'No API key provided. Curated mockup applied.'
      });
    }

    if (provider === 'grok') {
      console.log('[AI Generate] Calling Grok Imagine API...');
      const response = await fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-2-image',
          prompt: prompt,
          n: 1,
          response_format: 'url'
        })
      });

      if (!response.ok) {
        console.warn('[AI Generate] Grok API call failed. Trying fallback model...');
        const errText = await response.text();
        console.error('[AI Generate - Grok Error]', errText);
        
        // Try backup imagine model
        const retryResponse = await fetch('https://api.x.ai/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'grok-imagine-image-quality',
            prompt: prompt,
            n: 1,
            response_format: 'url'
          })
        });

        if (!retryResponse.ok) {
          throw new Error(`Grok Imagine API failed: ${retryResponse.status}`);
        }

        const data = await retryResponse.json();
        const imageUrl = data.data?.[0]?.url;
        if (!imageUrl) throw new Error('No image URL returned from Grok retry.');
        
        return NextResponse.json({ success: true, image: imageUrl, isFallback: false });
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      if (!imageUrl) throw new Error('No image URL returned from Grok.');
      
      return NextResponse.json({ success: true, image: imageUrl, isFallback: false });

    } else {
      // Gemini provider
      console.log('[AI Generate] Calling Gemini Image Generation...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          numberOfImages: 1,
          aspectRatio: '16:9',
          outputMimeType: 'image/jpeg'
        })
      });

      if (!response.ok) {
        console.warn('[AI Generate] Gemini Image Gen failed or not supported. Falling back to Unsplash.');
        const fallbacks = [
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1024&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1024&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1024&auto=format&fit=crop'
        ];
        const randomImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        return NextResponse.json({
          success: true,
          image: randomImage,
          isFallback: true,
          message: 'Gemini Image Generation fallback applied.'
        });
      }

      const data = await response.json();
      const base64Bytes = data.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Bytes) throw new Error('No image bytes returned from Gemini.');
      
      const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;
      return NextResponse.json({ success: true, image: imageUrl, isFallback: false });
    }

  } catch (error) {
    console.error('[AI Generate Route Error]', error);
    const fallbacks = [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1024&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1024&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1024&auto=format&fit=crop'
    ];
    const randomImage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({
      success: true,
      image: randomImage,
      isFallback: true,
      error: error.message
    });
  }
}
