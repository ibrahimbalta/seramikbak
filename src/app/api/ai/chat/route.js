import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function extractKeywords(text) {
  if (!text) return [];
  const stopWords = new Set([
    've', 'veya', 'bir', 'için', 'mi', 'mı', 'mu', 'mü', 'ne', 'nasıl', 'nedir', 
    'seramik', 'karo', 'fayans', 'var', 'en', 'daha', 'ile', 'de', 'da', 'ki', 
    'bu', 'şu', 'o', 'gibi', 'miyim', 'misin', 'tavsiye', 'öneri', 'link', 
    'bul', 'göster', 'listele', 'lütfen', 'yardımcı', 'asistan', 'katalog', 
    'katalogda', 'katalogdaki', 'ürün', 'ürünü', 'ürünler', 'yazınca', 'bulmalı',
    'ver', 'vermek', 'vermeli', 'bana', 'bunu', 'şunu'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, " ")
    .split(/\s+/)
    .filter(token => token.length >= 3 && !stopWords.has(token));
}

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
    } else if (provider === 'gemini') {
      apiKey = settingsMap['gemini_api_key'];
      apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      apiModel = 'gemini-flash-lite-latest';
    } else {
      // Default to deepseek
      apiKey = settingsMap['deepseek_api_key'] || 'sk-81324cd7ab0749abaee06efafb9013a2';
      apiUrl = 'https://api.deepseek.com/chat/completions';
      apiModel = 'deepseek-chat';
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: `${provider === 'grok' ? 'Grok' : provider === 'gemini' ? 'Gemini' : 'DeepSeek'} API key is not configured.` },
        { status: 400 }
      );
    }

    // Extract keywords from the last user message to query the catalog dynamically
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const keywords = extractKeywords(lastUserMessage);
    
    let matchingProducts = [];
    if (keywords.length > 0) {
      const andConditions = keywords.map(token => ({
        OR: [
          { name: { contains: token } },
          { code: { contains: token } },
          { brand: { name: { contains: token } } },
          { style: { contains: token } },
          { color: { contains: token } }
        ]
      }));
      
      // 1. Try strict matching first (AND conditions for all keywords)
      matchingProducts = await prisma.product.findMany({
        where: { AND: andConditions },
        include: { brand: true },
        take: 15
      });
      
      // 2. Fallback to ranking matches if AND returns nothing
      if (matchingProducts.length === 0) {
        const orConditions = keywords.map(token => ({
          OR: [
            { name: { contains: token } },
            { code: { contains: token } },
            { brand: { name: { contains: token } } },
            { style: { contains: token } },
            { color: { contains: token } }
          ]
        }));
        
        const rawMatches = await prisma.product.findMany({
          where: { OR: orConditions },
          include: { brand: true },
          take: 50
        });
        
        // Rank based on matches frequency and relevance
        matchingProducts = rawMatches
          .map(product => {
            let score = 0;
            const lowerName = product.name.toLowerCase();
            const lowerCode = product.code.toLowerCase();
            const lowerBrandName = product.brand.name.toLowerCase();
            const lowerStyle = (product.style || '').toLowerCase();
            const lowerColor = (product.color || '').toLowerCase();
            
            keywords.forEach(keyword => {
              if (lowerName.includes(keyword)) score += 3;
              if (lowerBrandName.includes(keyword)) score += 2;
              if (lowerCode.includes(keyword)) score += 1;
              if (lowerStyle.includes(keyword)) score += 1;
              if (lowerColor.includes(keyword)) score += 1;
            });
            
            return { product, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 15)
          .map(item => item.product);
      }
    }

    // If no keywords matched or no products found, fallback to premium featured products
    if (matchingProducts.length === 0) {
      matchingProducts = await prisma.product.findMany({
        where: { isPremium: true },
        include: { brand: true },
        take: 12
      });
    }

    const productListStr = matchingProducts
      .map(p => `- ${p.name} (Marka: ${p.brand.name}, Kod: ${p.code}, Renk: ${p.color}, Stil: ${p.style})`)
      .join('\n');

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
            content: `Sen SeramikBak uygulamasının akıllı yapay zeka tasarım ve teknik asistanısın. Kullanıcılara ev tasarımı, banyo/mutfak seramik seçimi, metraj/kutu hesaplama, derz dolgusu renk uyumu ve teknik seramik terimleri konularında danışmanlık yaparsın. Yanıtlarında lüks, profesyonel ve samimi bir üslup kullan.

Sadece SeramikBak kataloğunda kesinlikle var olan ve satılan şu ürünleri tavsiye etmelisin (kullanıcıya önerirken marka ismiyle birlikte tam adını belirt):
${productListStr}

Önerdiğin seramik modellerini kullanıcıların tıklayıp detaylarını görebilmesi için mutlaka şu formatta markdown linki olarak yaz: [Ürün Adı](product:Ürün Adı)
Örnek kullanım: [Calacatta Gold](product:Calacatta Gold) veya [NG Kütahya Royal Pulpis Bone 60x60](product:NG Kütahya Royal Pulpis Bone 60x60)
Link parametresi (parantez içindeki product: kısmından sonraki değer) olarak yukarıda listelenen ürünün tam adını (veritabanındaki "p.name" değerini) yazmalısın. Örneğin: [NG Kütahya Royal Pulpis Bone 60x60](product:NG Kütahya Royal Pulpis Bone 60x60).`
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
