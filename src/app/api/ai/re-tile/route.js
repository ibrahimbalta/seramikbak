import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, productName, productCode, style, color, finish, width, height } = body;

    // Detailed Image-to-Image prompt describing room ceramic re-tiling
    const prompt = `Photorealistic architectural interior design transformation of the provided bathroom image, all wall tiles behind sink mirror, inside shower enclosure and floor tiles replaced with high-end ${color || 'white'} ${style || 'Calacatta Marble'} ceramic tiles (${productName || 'Calacatta Gold'}, ${width || 60}x${height || 120} cm, ${finish || 'polished'} finish, bold dark grey marble vein patterns), keeping exact vanity basin, faucet, mirror frame, towel radiator, glass shower enclosure in original positions, 8k resolution, cinematic lighting`;

    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

    let aiImageUrl = '';

    // If client provided custom uploaded image URL/base64, use Image-to-Image endpoint
    if (image && typeof image === 'string' && image.startsWith('http')) {
      const encodedInputImg = encodeURIComponent(image);
      aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&image=${encodedInputImg}&nologo=true`;
    } else {
      aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&nologo=true`;
    }

    // Fetch generated AI image
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
