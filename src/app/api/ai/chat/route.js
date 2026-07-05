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

    // Retrieve DeepSeek API key from database system settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // Use stored key or default to user's provided key
    const deepseekKey = settingsMap['deepseek_api_key'] || 'sk-81324cd7ab0749abaee06efafb9013a2';

    if (!deepseekKey) {
      return NextResponse.json(
        { success: false, error: 'DeepSeek API key is not configured.' },
        { status: 400 }
      );
    }

    // Call DeepSeek API Chat Completions endpoint
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Sen SeramikBak uygulamasının akıllı yapay zeka tasarım ve teknik asistanısın. Kullanıcılara ev tasarımı, banyo/mutfak seramik seçimi, metraj/kutu hesaplama, derz dolgusu renk uyumu ve teknik seramik terimleri konularında danışmanlık yaparsın. Yanıtlarında lüks, profesyonel ve samimi bir üslup kullan. Sadece SeramikBak kataloğunda var olan ve satılan şu 11 ana ürünü tavsiye et: Calacatta Gold (beyaz mermer), Borneo Antrasit (siyah), Travertino Classico (bej traverten), Natural Oak (doğal ahşap), Concrete Light Grey (gri beton), Verona Grey (gri), Vintage Wood (koyu ahşap), Marmara Beyazı (beyaz), Royal Grey (gri mermer), Sand Travertine (bej), Antik Mermer. Önerdiğin seramik modellerini kullanıcıların tıklayıp detaylarını görebilmesi için mutlaka şu formatta markdown linki olarak yaz: [Ürün Adı](product:Ürün Adı) (örneğin: [Concrete Light Grey](product:Concrete Light Grey) veya [Calacatta Gold](product:Calacatta Gold)). Link parametresi olarak tam ürün adını yaz.'
          },
          ...messages
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[DeepSeek API Error]', errText);
      return NextResponse.json(
        { success: false, error: 'DeepSeek API response error', details: errText },
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
