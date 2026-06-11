import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to find the first array inside a JSON object recursively
function findJsonArray(obj) {
  if (Array.isArray(obj)) return obj;
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        return obj[key];
      }
      if (typeof obj[key] === 'object') {
        const found = findJsonArray(obj[key]);
        if (found) return found;
      }
    }
  }
  return null;
}

// JSON Feed Parser
function parseJsonFeed(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    const array = findJsonArray(parsed);
    if (!array) return [];

    return array.map(item => {
      const getAnyKey = (keys) => {
        for (const k of keys) {
          if (item[k] !== undefined && item[k] !== null) {
            return String(item[k]).trim();
          }
        }
        return '';
      };

      const name = getAnyKey(['name', 'ad', 'title', 'urun_adi', 'urunadi', 'label', 'Name']);
      const code = getAnyKey(['code', 'kod', 'sku', 'product_code', 'productcode', 'barcode', 'barkod', 'Code', 'SKU']);
      const widthVal = getAnyKey(['width', 'genislik', 'boyut_x', 'en', 'Width']);
      const heightVal = getAnyKey(['height', 'yukseklik', 'boyut_y', 'boy', 'Height']);
      const color = getAnyKey(['color', 'renk', 'colour', 'Color']);
      const finish = getAnyKey(['finish', 'yuzey', 'kaplama', 'yuzey_tipi', 'Finish']);
      const style = getAnyKey(['style', 'stil', 'kategori', 'category', 'tarz', 'Style']);
      const area = getAnyKey(['area', 'alan', 'kullanim_alani', 'kullanim_alanlari', 'place', 'Area']);
      const img = getAnyKey(['image', 'imageUrl', 'gorsel', 'resim', 'texture', 'textureUrl', 'image_url', 'ImageUrl']);

      return {
        name,
        code,
        width: parseInt(widthVal, 10) || 60,
        height: parseInt(heightVal, 10) || 60,
        color: color || 'Gri',
        finish: finish || 'Mat',
        style: style || '',
        area: area || 'Yer,Duvar',
        imageUrl: img || ''
      };
    }).filter(p => p.name && p.code);
  } catch (err) {
    console.error('[Feed API] JSON Parsing error:', err);
    return [];
  }
}

// Regex-based robust XML Feed Parser
function parseXmlFeed(xmlText) {
  // Clean spacing and newlines
  const cleanXml = xmlText.replace(/\s+/g, ' ');

  // Try to find elements wrapped in urun, product, item, record, row
  const itemRegex = /<(urun|product|item|record|row)\b[^>]*>(.*?)<\/\1>/gi;
  const products = [];
  let match;

  while ((match = itemRegex.exec(cleanXml)) !== null) {
    const itemContent = match[2];
    
    const getTagValue = (tagName) => {
      const tagRegex = new RegExp(`<(${tagName})\\b[^>]*>(.*?)<\\/\\1>`, 'i');
      const tagMatch = tagRegex.exec(itemContent);
      return tagMatch ? tagMatch[2].replace(/<!\[CDATA\[(.*?)\]\]>/i, '$1').trim() : '';
    };

    const getAnyTagValue = (tagNames) => {
      for (const name of tagNames) {
        const val = getTagValue(name);
        if (val) return val;
      }
      return '';
    };

    const name = getAnyTagValue(['name', 'ad', 'title', 'urun_adi', 'urunadi', 'label']);
    const code = getAnyTagValue(['code', 'kod', 'sku', 'product_code', 'productcode', 'barcode', 'barkod']);
    const widthVal = getAnyTagValue(['width', 'genislik', 'boyut_x', 'en']);
    const heightVal = getAnyTagValue(['height', 'yukseklik', 'boyut_y', 'boy']);
    const color = getAnyTagValue(['color', 'renk', 'colour']);
    const finish = getAnyTagValue(['finish', 'yuzey', 'kaplama', 'yuzey_tipi']);
    const style = getAnyTagValue(['style', 'stil', 'kategori', 'category', 'tarz']);
    const area = getAnyTagValue(['area', 'alan', 'kullanim_alani', 'kullanim_alanlari', 'place']);
    const img = getAnyTagValue(['image', 'imageUrl', 'gorsel', 'resim', 'texture', 'textureUrl', 'image_url']);

    if (name && code) {
      products.push({
        name,
        code,
        width: parseInt(widthVal, 10) || 60,
        height: parseInt(heightVal, 10) || 60,
        color: color || 'Gri',
        finish: finish || 'Mat',
        style: style || '',
        area: area || 'Yer,Duvar',
        imageUrl: img || ''
      });
    }
  }

  // Fallback splitting if tags aren't clean
  if (products.length === 0) {
    const tags = ['urun', 'product', 'item', 'record', 'row'];
    for (const tag of tags) {
      const splitRegex = new RegExp(`<${tag}\\b`, 'i');
      const parts = cleanXml.split(splitRegex);
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          const getTagValueFallback = (tagName) => {
            const tagRegex = new RegExp(`<${tagName}\\b[^>]*>(.*?)<\\/${tagName}>`, 'i');
            const m = tagRegex.exec(part);
            return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/i, '$1').trim() : '';
          };
          
          const getAnyTagValueFallback = (tagNames) => {
            for (const name of tagNames) {
              const val = getTagValueFallback(name);
              if (val) return val;
            }
            return '';
          };

          const name = getAnyTagValueFallback(['name', 'ad', 'title', 'urun_adi', 'urunadi']);
          const code = getAnyTagValueFallback(['code', 'kod', 'sku', 'product_code', 'productcode']);
          const widthVal = getAnyTagValueFallback(['width', 'genislik', 'boyut_x', 'en']);
          const heightVal = getAnyTagValueFallback(['height', 'yukseklik', 'boyut_y', 'boy']);
          const color = getAnyTagValueFallback(['color', 'renk']);
          const finish = getAnyTagValueFallback(['finish', 'yuzey', 'kaplama']);
          const style = getAnyTagValueFallback(['style', 'stil', 'kategori', 'category']);
          const area = getAnyTagValueFallback(['area', 'alan', 'kullanim_alani']);
          const img = getAnyTagValueFallback(['image', 'imageUrl', 'gorsel', 'resim', 'texture', 'textureUrl']);

          if (name && code) {
            products.push({
              name,
              code,
              width: parseInt(widthVal, 10) || 60,
              height: parseInt(heightVal, 10) || 60,
              color: color || 'Gri',
              finish: finish || 'Mat',
              style: style || '',
              area: area || 'Yer,Duvar',
              imageUrl: img || ''
            });
          }
        }
        if (products.length > 0) break;
      }
    }
  }

  return products;
}

export async function POST(request) {
  const logs = [];
  let importedCount = 0;
  try {
    const body = await request.json();
    const { brandId, feedUrl, defaultStyle } = body;

    if (!brandId || !feedUrl) {
      return NextResponse.json({ success: false, error: 'Marka seçimi ve Feed URL gereklidir.', logs }, { status: 400 });
    }

    // Fetch brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Seçili marka veritabanında bulunamadı.', logs }, { status: 404 });
    }

    logs.push(`[Feed Entegrasyonu] Bağlanılıyor: ${feedUrl}`);
    console.log(`[Feed API] Fetching url: ${feedUrl}`);

    // Fetch feed content with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    let response;
    try {
      response = await fetch(feedUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      throw new Error(`Feed URL'sine bağlanılamadı: ${fetchErr.message}`);
    }

    if (!response.ok) {
      throw new Error(`Feed sunucusu hata kodu döndürdü: ${response.status}`);
    }

    const rawText = await response.text();
    logs.push(`[Feed Entegrasyonu] Veri indirildi. Boyut: ${rawText.length} karakter.`);

    // Auto-detect format
    const trimmed = rawText.trim();
    let isJson = false;
    let isXml = false;

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      isJson = true;
    } else if (trimmed.includes('<?xml') || trimmed.includes('<') || response.headers.get('content-type')?.includes('xml')) {
      isXml = true;
    }

    let parsedProducts = [];
    if (isJson) {
      logs.push(`[Ayrıştırma] JSON veri formatı algılandı.`);
      parsedProducts = parseJsonFeed(trimmed);
    } else if (isXml) {
      logs.push(`[Ayrıştırma] XML veri formatı algılandı.`);
      parsedProducts = parseXmlFeed(trimmed);
    } else {
      // Try JSON then XML fallback
      try {
        parsedProducts = parseJsonFeed(trimmed);
        if (parsedProducts.length > 0) {
          isJson = true;
          logs.push(`[Ayrıştırma] Başarıyla JSON formatında ayrıştırıldı.`);
        }
      } catch (e) {
        // Not JSON
      }

      if (parsedProducts.length === 0) {
        parsedProducts = parseXmlFeed(trimmed);
        if (parsedProducts.length > 0) {
          isXml = true;
          logs.push(`[Ayrıştırma] Başarıyla XML formatında ayrıştırıldı.`);
        }
      }
    }

    if (parsedProducts.length === 0) {
      throw new Error('Ayrıştırılabilir ürün verisi bulunamadı. Lütfen feed yapısının doğru veya etiketlerin standart olduğundan emin olun.');
    }

    logs.push(`[Ayrıştırma] Feed kaynağından ${parsedProducts.length} adet geçerli ürün ayıklandı. Veritabanı eşleştirmesi yapılıyor...`);

    // Process & Upsert items
    for (let i = 0; i < parsedProducts.length; i++) {
      const prod = parsedProducts[i];
      const name = prod.name?.trim();
      const code = prod.code?.trim()?.toUpperCase();

      if (!name || !code) continue;

      const width = prod.width || 60;
      const height = prod.height || 60;
      const color = prod.color || 'Gri';
      const finish = prod.finish || 'Mat';
      const style = prod.style || defaultStyle || 'Mermer';
      const area = prod.area || 'Yer,Duvar,Banyo,Mutfak';

      // Texture mappings
      let imageUrl = prod.imageUrl;
      if (!imageUrl || !imageUrl.startsWith('http')) {
        imageUrl = style === 'Ahşap' ? '/textures/teak_ahsap.jpg' :
                   style === 'Beton' ? '/textures/loft_beton.jpg' :
                   style === 'Taş' ? '/textures/vista_bej.jpg' : '/textures/calacatta_gold.jpg';
      }

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
            imageUrl,
            textureUrl: imageUrl
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
            imageUrl,
            textureUrl: imageUrl,
            isPremium: false
          }
        });

        logs.push(`[Eşleştirildi] Ürün eklendi/güncellendi: "${name}" (SKU: ${code})`);
        importedCount++;
      } catch (dbErr) {
        logs.push(`[Öğe ${i + 1} - Veritabanı Hatası] ${dbErr.message}`);
      }
    }

    logs.push(`[Tamamlandı] Feed Entegrasyonu bitti. ${importedCount} adet ürün başarıyla güncellendi.`);
    return NextResponse.json({
      success: true,
      count: importedCount,
      logs
    });

  } catch (error) {
    console.error('[Import Feed API Error]', error);
    logs.push(`[Hata] Entegrasyon başarısız oldu: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
