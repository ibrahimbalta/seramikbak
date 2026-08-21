import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, productName, productCode, style, color, finish, width, height } = body;

    // Construct high-detail prompt for interior design AI room re-tiling
    const prompt = `A modern high-end architectural photorealistic bathroom interior, walls and floor completely tiled with ${color || 'white'} ${style || 'Marble'} ceramic tiles (${productName || 'Calacatta'}, ${width || 60}x${height || 120} cm, ${finish || 'polished'} finish) with clean grout lines, realistic ambient lighting, luxury bathroom fixtures, mirror, vanity, shower glass, 8k resolution, cinematic lighting`;

    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

    // Call Pollinations.ai FLUX.1 free open AI image generation API
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&nologo=true`;

    // Fetch generated image to convert to base64 so client gets direct reliable data
    const aiResponse = await fetch(aiImageUrl);
    if (!aiResponse.ok) {
      throw new Error(`AI generation service status: ${aiResponse.status}`);
    }

    const arrayBuffer = await aiResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt
    });

  } catch (error) {
    console.error('AI Re-Tile Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Yapay zeka banyo görseli oluşturulamadı.' },
      { status: 500 }
    );
  }
}
