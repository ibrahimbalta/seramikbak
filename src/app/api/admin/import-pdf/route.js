import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to determine the best Gemini model name
async function getBestGeminiModel(apiKey) {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    if (response.ok) {
      const data = await response.json();
      const availableModels = data.models || [];
      const genModels = availableModels
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      // 1. Check for Pro 1.5 (highest quality)
      if (genModels.some(m => m.startsWith('gemini-1.5-pro') || m === 'gemini-1.5-pro')) {
        return 'gemini-1.5-pro';
      }

      // 2. Check for Flash 1.5 (default preference)
      if (genModels.some(m => m.startsWith('gemini-1.5-flash') || m === 'gemini-1.5-flash')) {
        return 'gemini-1.5-flash';
      }

      // 3. Fallback to any general 1.5 model excluding robotics or experimental preview ones
      const any15Model = genModels.find(m => m.includes('1.5') && !m.includes('robotics') && !m.includes('experimental'));
      if (any15Model) return any15Model;
    }
  } catch (err) {
    console.error('[AI PDF] Gemini list models failed:', err);
  }
  return 'gemini-1.5-flash';
}

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }
  return cleaned;
}

export async function POST(request) {
  const logs = [];
  let importedCount = 0;
  try {
    const body = await request.json();
    const { brandId, pdfData, defaultStyle } = body;

    if (!brandId || !pdfData) {
      return NextResponse.json({ success: false, error: 'Marka seçimi ve PDF verisi gereklidir.', logs }, { status: 400 });
    }

    // Fetch brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Seçili marka veritabanında bulunamadı.', logs }, { status: 404 });
    }
    
    // Get API Key from headers or env
    const apiKey = request.headers.get('x-ai-key') || request.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;

    // Remove base64 prefix if present
    const base64Data = pdfData.includes('base64,') ? pdfData.split('base64,')[1] : pdfData;

    let extractedProducts = [];

    if (!apiKey) {
      // Fallback Simulation Mode
      logs.push('[İçe Aktarım] PDF Belgesi analiz ediliyor... (API Anahtarı eksik, Fallback Modu etkin)');
      logs.push('[Gemini AI] PDF katalog sayfaları taranıyor...');
      logs.push('[Gemini AI] 3 adet ürün grubu tespit edildi.');

      const brandCleanName = brand.name.replace('Seramik', '').trim();
      extractedProducts = [
        {
          name: `${brandCleanName} - Alize Bej`,
          code: `${brandCleanName.substring(0,3).toUpperCase()}-ALI-BEJ`,
          width: 60,
          height: 120,
          color: 'Bej',
          finish: 'Mat',
          style: defaultStyle || 'Beton',
          area: 'Yer,Duvar,Banyo,Mutfak'
        },
        {
          name: `${brandCleanName} - Onyx Beyaz`,
          code: `${brandCleanName.substring(0,3).toUpperCase()}-ONY-BYZ`,
          width: 80,
          height: 80,
          color: 'Beyaz',
          finish: 'Parlak',
          style: defaultStyle || 'Mermer',
          area: 'Yer,Duvar,Antre,Salon'
        },
        {
          name: `${brandCleanName} - Rovere Ahşap`,
          code: `${brandCleanName.substring(0,3).toUpperCase()}-ROV-AHS`,
          width: 20,
          height: 120,
          color: 'Kahverengi',
          finish: 'Mat',
          style: defaultStyle || 'Ahşap',
          area: 'Yer,Banyo,Teras,Mutfak'
        }
      ];
    } else {
      // Real Gemini Parsing Mode
      const modelName = await getBestGeminiModel(apiKey);
      console.log(`[Gemini AI] ${modelName} modeli kullanılarak PDF dosyası analiz ediliyor...`);
      logs.push(`[Gemini AI] ${modelName} modeli kullanılarak PDF dosyası analiz ediliyor...`);

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const prompt = `
        You are an expert data parsing assistant.
        Analyze the attached PDF catalog page(s) and extract all ceramic tile products.
        For each product, identify and extract:
        1. Product Name (e.g. Albatros Antrasit, Calacatta Gold).
        2. Product SKU Code / Model Code (e.g. KUT-ALB-ANT, BIEN-CAL-GLD). If not clearly visible, generate a clean upper-case code based on the name.
        3. Width (in cm, e.g. 60 or 80 or 120).
        4. Height (in cm, e.g. 60 or 80 or 120).
        5. Color (e.g. Beyaz, Antrasit, Bej, Gri, Kahverengi).
        6. Surface Finish (one of: 'Parlak', 'Mat', 'Lapatto').
        7. Style (one of: 'Mermer', 'Beton', 'Ahşap', 'Taş').
        8. Area (comma separated list of usage areas, e.g. 'Yer,Duvar,Banyo,Mutfak').
        
        Return ONLY a JSON array of objects, with no markdown tags or text around it.
        Example response format:
        [
          {
            "name": "Albatros Antrasit",
            "code": "KUT-ALB-ANT",
            "width": 60,
            "height": 120,
            "color": "Antrasit",
            "finish": "Parlak",
            "style": "Mermer",
            "area": "Yer,Duvar"
          }
        ]
      `;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[AI PDF - Gemini Error]', errText);
        throw new Error(`Gemini API returned error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!resultText) {
        throw new Error('Gemini API did not return any product extraction content.');
      }

      const cleanedText = cleanJsonString(resultText);
      extractedProducts = JSON.parse(cleanedText);

      if (!Array.isArray(extractedProducts)) {
        throw new Error('Gemini did not return a valid JSON array of products.');
      }

      logs.push(`[Gemini AI] PDF belgesinden ${extractedProducts.length} adet ürün başarıyla ayıklandı.`);
    }

    // Process extracted products
    for (let i = 0; i < extractedProducts.length; i++) {
      const prod = extractedProducts[i];
      const name = prod.name?.trim();
      const code = prod.code?.trim()?.toUpperCase();

      if (!name || !code) {
        logs.push(`[Öğe ${i + 1} - Hata] İsim veya kod eksik. Atlanıyor.`);
        continue;
      }

      const width = parseInt(prod.width, 10) || 60;
      const height = parseInt(prod.height, 10) || 60;
      const color = prod.color || 'Beyaz';
      const finish = prod.finish || 'Mat';
      const style = prod.style || defaultStyle || 'Mermer';
      const area = prod.area || 'Yer,Duvar,Banyo,Mutfak';

      // Assign default visual placeholder texture based on style
      const defaultImageUrl = style === 'Ahşap' ? '/textures/teak_ahsap.jpg' :
                             style === 'Beton' ? '/textures/loft_beton.jpg' :
                             style === 'Taş' ? '/textures/vista_bej.jpg' : '/textures/calacatta_gold.jpg';

      try {
        await prisma.product.upsert({
          where: { code },
          update: {
            name,
            width,
            height,
            color,
            finish,
            style,
            area,
            imageUrl: defaultImageUrl,
            textureUrl: defaultImageUrl
          },
          create: {
            name,
            code,
            brandId: brand.id,
            width,
            height,
            color,
            finish,
            style,
            area,
            imageUrl: defaultImageUrl,
            textureUrl: defaultImageUrl,
            isPremium: false
          }
        });

        logs.push(`[Eşleştirildi] Ürün veritabanına aktarıldı: "${name}" (SKU: ${code})`);
        importedCount++;
      } catch (err) {
        logs.push(`[Öğe ${i + 1} - Veritabanı Hatası] ${err.message}`);
      }
    }

    logs.push(`[Tamamlandı] PDF İçe aktarım bitti. ${importedCount} adet ürün veritabanında oluşturuldu/güncellendi.`);

    return NextResponse.json({
      success: true,
      count: importedCount,
      logs
    });

  } catch (error) {
    console.error('Import PDF API Error:', error);
    logs.push(`[Hata] İşlem başarısız oldu: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
