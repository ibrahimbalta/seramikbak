import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
    }

    // Retrieve API keys from database settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const dbProvider = settingsMap['ai_provider'] || 'gemini';
    const dbGeminiKey = settingsMap['gemini_api_key'];
    const dbGrokKey = settingsMap['grok_api_key'];

    const provider = request.headers.get('x-ai-provider') || dbProvider;
    const apiKey = request.headers.get('x-ai-key') || (provider === 'grok' ? dbGrokKey : dbGeminiKey) || process.env.GROK_API_KEY || process.env.GEMINI_API_KEY;

    // If no API key is configured, generate a customized room concept using Pollinations AI for free
    if (!apiKey) {
      console.log('[AI Generate] No API Key. Generating custom image using Pollinations AI free service.');
      const seed = Math.floor(Math.random() * 1000000);
      const generatedImageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=576&seed=${seed}&nologo=true`;
      
      return NextResponse.json({
        success: true,
        image: generatedImageUrl,
        isFallback: false,
        message: 'Generated via free Pollinations AI service'
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
        console.warn('[AI Generate] Gemini Image Gen failed or not supported. Falling back to Pollinations AI.');
        const seed = Math.floor(Math.random() * 1000000);
        const generatedImageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=576&seed=${seed}&nologo=true`;
        return NextResponse.json({
          success: true,
          image: generatedImageUrl,
          isFallback: true,
          message: 'Gemini Image Generation failed. Generated via free Pollinations AI fallback.'
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
    const seed = Math.floor(Math.random() * 1000000);
    const generatedImageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=576&seed=${seed}&nologo=true`;
    return NextResponse.json({
      success: true,
      image: generatedImageUrl,
      isFallback: true,
      error: error.message,
      message: 'Route error. Generated via free Pollinations AI fallback.'
    });
  }
}
