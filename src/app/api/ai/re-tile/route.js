import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, productName, productCode, style, color, finish, width, height, roomType } = body;

    const targetRoom = roomType === 'salon' ? 'luxury living room floor' : roomType === 'mutfak' ? 'modern kitchen' : 'bathroom interior';

    // Detailed Image-to-Image prompt describing room ceramic re-tiling
    const prompt = `Photorealistic architectural interior design transformation of the provided ${targetRoom}, all wall tiles behind sink mirror, inside shower enclosure and floor tiles replaced with high-end ${color || 'white'} ${style || 'Calacatta Marble'} ceramic tiles (${productName || 'Calacatta Gold'}, ${width || 60}x${height || 120} cm, ${finish || 'polished Lappato'} finish, realistic tile grout grid lines, natural ambient reflections), keeping vanity basin, faucet, mirror frame, towel radiator, glass enclosure in original positions, 8k resolution, architectural digest photo`;

    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

    let aiImageUrl = '';

    // If client provided custom uploaded image URL/base64
    if (image && typeof image === 'string' && image.startsWith('http')) {
      const encodedInputImg = encodeURIComponent(image);
      aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&image=${encodedInputImg}&nologo=true`;
    } else {
      aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${randomSeed}&model=flux&nologo=true`;
    }

    // Fetch generated AI image with 12s timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
          prompt: prompt
        });
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn('Pollinations AI API timed out or failed, using fallback AI render:', fetchErr.message);
    }

    // Fallback: Return generated realistic Flux URL directly if stream fetch timed out
    return NextResponse.json({
      success: true,
      imageUrl: aiImageUrl,
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
