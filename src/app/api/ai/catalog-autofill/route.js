import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const EDITORIAL_PREFACES = [
  "Yenilikçi yüzey teknolojileri, yüksek dayanımlı porselen gövde ve çağdaş tasarım estetiği ile yaşam alanlarınıza değer katıyoruz. 2026 koleksiyonumuz, doğanın zamansız mermer ve taş dokularını ileri seramik mühendisliğiyle harmanlayarak mimarlara ve tasarımcılara sınırsız ilham sunuyor.",
  "Estetik ile fonksiyonelliğin kusursuz uyumu. Geniş ebatlı porselen plakalarımız, zengin yüzey bitişlerimiz ve üstün aşınma dayanımımız ile iç ve dış mekan projelerinizde zamansız bir atmosfer yaratmak için tasarlandı.",
  "Doğal mermer damarlarının zarafetini, ahşabın sıcaklığını ve betonun modern yalınlığını porselenin ebedi gücüyle buluşturuyoruz. Mimari projelere özel teknik detaylar ve ilham verici mekan konseptleri bu katalogda bir araya geldi."
];

const TEMPLATES = ['milano', 'verona', 'bologna', 'roma', 'premium-mimari', 'editorial'];

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`ai_catalog_${clientIp}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'İstek sınırına ulaşıldı. Lütfen bir dakika sonra tekrar deneyiniz.'
      }, { status: 429 });
    }

    const body = await request.json();
    const { brandName = 'Seramik', theme = 'luxury', language = 'tr', products = [] } = body;

    // Check if system setting has external AI provider
    const settings = await prisma.systemSetting.findMany().catch(() => []);
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    let title = `${brandName} ${nextYear} Mimari Seramik Koleksiyonu`;
    let coverTitle = `${brandName.toUpperCase()} ARCHITECTURAL TILES ${nextYear}`;
    let coverSubtitle = `EXCLUSIVE PORCELAIN & CERAMIC LOOKBOOK`;
    let introText = EDITORIAL_PREFACES[Math.floor(Math.random() * EDITORIAL_PREFACES.length)];
    let template = 'milano';
    let primaryColor = '#b4823c'; // Luxury Gold
    let accentColor = '#0f172a';
    let orientation = 'portrait';

    if (theme === 'natural_stone') {
      coverTitle = `${brandName.toUpperCase()} NATUREL STONE & MARBLE`;
      coverSubtitle = `DOĞAL DOKULAR VE BÜYÜK EBAT PORSELEN SERİLER`;
      template = 'verona';
      primaryColor = '#8c7355';
    } else if (theme === 'modern_minimal') {
      coverTitle = `${brandName.toUpperCase()} MODERN LIVING & SURFACES`;
      coverSubtitle = `ÇAĞDAŞ MİMARİ VE ÇİMENTO DOKULU SERİLER`;
      template = 'bologna';
      primaryColor = '#475569';
    } else if (theme === 'technical') {
      coverTitle = `${brandName.toUpperCase()} TECHNICAL & SPECIFICATION CATALOG`;
      coverSubtitle = `PROJE VE MİMARİ ŞARTNAME REHBERİ`;
      template = 'roma';
      orientation = 'landscape';
      primaryColor = '#1e3a8a';
    }

    // Try calling external LLM if API key configured (e.g. Gemini, DeepSeek, Grok)
    const geminiKey = settingsMap['gemini_api_key'] || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `Sen seramik, karo ve mimari sektöründe uzmanlaşmış lüks bir B2B İtalyan/Türk katalog editörüsün.
Marka Adı: "${brandName}"
Tema: "${theme}"
Dil: "${language}"

Aşağıdaki JSON formatında yanıt ver (sadece geçerli JSON, markdown code block olmadan):
{
  "title": "${brandName} için 2026 katalog adı (örn: ${brandName} 2026 Mimari Seramik Koleksiyonu)",
  "coverTitle": "Kapak için büyük çarpıcı mimari ana başlık",
  "coverSubtitle": "Kapak alt başlığı (İngilizce/Türkçe kurumsal)",
  "introText": "Kataloğun giriş sayfası için 3-4 cümlelik prestijli, ilham verici mimari önsöz metni.",
  "template": "milano veya verona veya bologna veya roma",
  "primaryColor": "Markaya uygun lüks hex renk kodu (örn: #b4823c)",
  "orientation": "portrait veya landscape"
}`;

        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
            })
          }
        );

        const aiData = await aiRes.json();
        const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed.title) title = parsed.title;
          if (parsed.coverTitle) coverTitle = parsed.coverTitle;
          if (parsed.coverSubtitle) coverSubtitle = parsed.coverSubtitle;
          if (parsed.introText) introText = parsed.introText;
          if (parsed.template) template = parsed.template;
          if (parsed.primaryColor) primaryColor = parsed.primaryColor;
          if (parsed.orientation) orientation = parsed.orientation;
        }
      } catch (e) {
        console.warn('Gemini catalog autofill fallback to editorial engine:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title,
        coverTitle,
        coverSubtitle,
        introText,
        template,
        primaryColor,
        accentColor,
        orientation,
        pageSize: 'a4',
        showSpecs: true,
        showDescriptions: true,
        showQrCodes: true,
        showCover: true,
        showTOC: true
      }
    });
  } catch (error) {
    console.error('Catalog autofill error:', error);
    return NextResponse.json({ success: false, error: 'Otomatik katalog oluşturma sırasında bir hata oluştu.' }, { status: 500 });
  }
}
