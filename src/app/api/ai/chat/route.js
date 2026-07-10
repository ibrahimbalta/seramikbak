import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    // Retrieve API provider and keys from database system settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const provider = settingsMap['ai_provider'] || 'deepseek';

    let apiKey = '';
    let apiUrl = '';
    let apiModel = '';

    if (provider === 'grok') {
      apiKey = settingsMap['grok_api_key'];
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      apiModel = 'grok-beta'; // xAI Grok standard model
    } else {
      // Default to deepseek
      apiKey = settingsMap['deepseek_api_key'] || 'sk-81324cd7ab0749abaee06efafb9013a2';
      apiUrl = 'https://api.deepseek.com/chat/completions';
      apiModel = 'deepseek-chat';
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: `${provider === 'grok' ? 'Grok' : 'DeepSeek'} API key is not configured.` },
        { status: 400 }
      );
    }

    // Call selected API Chat Completions endpoint
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          {
            role: 'system',
            content: 'Sen SeramikBak uygulamasının akıllı yapay zeka tasarım ve teknik asistanısın. Kullanıcılara ev tasarımı, banyo/mutfak seramik seçimi, metraj/kutu hesaplama, derz dolgusu renk uyumu ve teknik seramik terimleri konularında danışmanlık yaparsın. Yanıtlarında lüks, profesyonel ve samimi bir üslup kullan. Sadece SeramikBak kataloğunda kesinlikle var olan ve satılan şu ürünleri tavsiye et: Calacatta Gold (beyaz mermer), DuraTiles MYSTIQUE Multi Color (renkli taş), DuraTiles FADE Altın (altın beton), DuraTiles COZY Gri (gri beton), DuraTiles GLEN Snow (beyaz mat), Graniser Travertino classico (bej traverten), DuraTiles NATURAL OAK (doğal ahşap), Vintage Wood (koyu ahşap), Marmara Beyazı (beyaz mermer), Sand Travertine (bej), Antik Mermer (beyaz), Bien Verona (gri). Önerdiğin seramik modellerini kullanıcıların tıklayıp detaylarını görebilmesi için mutlaka şu formatta markdown linki olarak yaz: [Ürün Adı](product:Ürün Adı) (örneğin: [DuraTiles MYSTIQUE Multi Color](product:DuraTiles MYSTIQUE Multi Color) veya [Calacatta Gold](product:Calacatta Gold)). Link parametresi olarak bu tam ürün adını yaz.'
          },
          ...messages
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[${provider.toUpperCase()} API Error]`, errText);
      return NextResponse.json(
        { success: false, error: `${provider.toUpperCase()} API response error`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('DeepSeek Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Yapay zeka yanıtı işlenirken hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}
