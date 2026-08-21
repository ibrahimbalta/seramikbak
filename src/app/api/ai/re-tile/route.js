import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, productName, productCode, style, color, finish, width, height } = body;

    // Construct high-precision architectural AI room prompt
    const prompt = `Architectural digest photorealistic luxury bathroom interior transformation, wall behind vanity sink under mirror, wall inside glass shower cabin, and bathroom floor seamlessly tiled with ${color || 'white'} ${style || 'Marble'} ceramic tiles (${productName || 'Calacatta Gold'}, ${width || 60}x${height || 120} cm, ${finish || 'polished'} finish, elegant grey marble vein patterns), preserving original vanity sink basin, faucet, mirror frame, towel radiator, glass shower enclosure, 8k resolution, cinematic studio lighting`;

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
