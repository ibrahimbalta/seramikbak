import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to determine texture fallback
function getDefaultTexture(style) {
  const s = (style || '').toLowerCase();
  if (s.includes('ahşap') || s.includes('ahsap') || s.includes('wood')) return '/textures/teak_ahsap.jpg';
  if (s.includes('beton') || s.includes('concrete') || s.includes('çimento')) return '/textures/loft_beton.jpg';
  if (s.includes('taş') || s.includes('tas') || s.includes('stone') || s.includes('traverten')) return '/textures/travertino_classico.jpg';
  return '/textures/calacatta_gold.jpg';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { brandId, tsvData, xmlFeedUrl, defaultStyle = 'Mermer', productsArray } = body;

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Marka ID (brandId) parametresi zorunludur.' }, { status: 400 });
    }

    // Verify brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Belirtilen marka bulunamadı.' }, { status: 404 });
    }

    let rowsToProcess = [];

    // Case 1: Direct JSON products array (e.g. from client-side spreadsheet or mapped array)
    if (Array.isArray(productsArray) && productsArray.length > 0) {
      rowsToProcess = productsArray;
    }
    // Case 2: XML or JSON Feed URL
    else if (xmlFeedUrl) {
      try {
        const feedRes = await fetch(xmlFeedUrl, { headers: { 'User-Agent': 'SeramikBak-Catalog-Sync/1.0' } });
        if (!feedRes.ok) {
          return NextResponse.json({ success: false, error: `ERP/Feed bağlantısı başarısız oldu (HTTP ${feedRes.status})` }, { status: 400 });
        }
        const textData = await feedRes.text();

        // Check if JSON
        if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
          const parsed = JSON.parse(textData);
          const arr = Array.isArray(parsed) ? parsed : (parsed.products || parsed.items || Object.values(parsed)[0]);
          if (Array.isArray(arr)) {
            rowsToProcess = arr.map(item => ({
              name: item.name || item.ad || item.urun_adi || item.title,
              code: item.code || item.kod || item.sku || item.barkod,
              width: parseFloat(item.width || item.en || item.genislik) || 60,
              height: parseFloat(item.height || item.boy || item.yukseklik) || 120,
              color: item.color || item.renk || 'Gri',
              finish: item.finish || item.yuzey || 'Mat',
              style: item.style || item.tarz || defaultStyle,
              area: item.area || item.kullanim_alani || 'Yer,Duvar',
              imageUrl: item.imageUrl || item.gorsel || item.resim || '',
              thickness: parseFloat(item.thickness || item.kalinlik) || 9.5,
              peiRating: parseInt(item.peiRating || item.pei) || 4,
              slipResistance: item.slipResistance || item.kaydirmazlik || 'R9',
              rectified: item.rectified !== undefined ? Boolean(item.rectified) : true
            }));
          }
        } else {
          // Simple regex tag extractor for XML feeds (<product> ... </product> or <item> ... </item>)
          const itemMatches = textData.match(/<(product|item|karo)>([\s\S]*?)<\/\1>/gi) || [];
          rowsToProcess = itemMatches.map(xmlBlock => {
            const getTag = (tag) => {
              const m = xmlBlock.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
              return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim() : '';
            };
            return {
              name: getTag('name') || getTag('ad') || getTag('title') || getTag('urun_adi'),
              code: getTag('code') || getTag('kod') || getTag('sku') || getTag('barkod'),
              width: parseFloat(getTag('width') || getTag('en') || getTag('genislik')) || 60,
              height: parseFloat(getTag('height') || getTag('boy') || getTag('yukseklik')) || 120,
              color: getTag('color') || getTag('renk') || 'Beyaz',
              finish: getTag('finish') || getTag('yuzey') || 'Mat',
              style: getTag('style') || getTag('tarz') || defaultStyle,
              area: getTag('area') || getTag('kullanim_alani') || 'Yer,Duvar',
              imageUrl: getTag('imageUrl') || getTag('gorsel') || getTag('resim') || '',
              thickness: parseFloat(getTag('thickness') || getTag('kalinlik')) || 9.5,
              peiRating: parseInt(getTag('peiRating') || getTag('pei')) || 4,
              slipResistance: getTag('slipResistance') || getTag('kaydirmazlik') || 'R9',
              rectified: getTag('rectified') ? getTag('rectified') === '1' || getTag('rectified') === 'true' : true
            };
          });
        }
      } catch (feedErr) {
        return NextResponse.json({ success: false, error: `ERP Feed ayrıştırma hatası: ${feedErr.message}` }, { status: 400 });
      }
    }
    // Case 3: TSV / CSV text pasted or uploaded
    else if (tsvData && typeof tsvData === 'string') {
      const lines = tsvData.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) {
        return NextResponse.json({ success: false, error: 'İçeri aktarılacak metin satırı bulunamadı.' }, { status: 400 });
      }

      // Check if header exists
      let startIndex = 0;
      const firstLineLower = lines[0].toLowerCase();
      if (firstLineLower.includes('ad') || firstLineLower.includes('kod') || firstLineLower.includes('name') || firstLineLower.includes('sku')) {
        startIndex = 1; // Skip header
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.includes('\t') ? line.split('\t') : line.split(';');
        // If neither tab nor semicolon, check comma
        const finalCols = (cols.length >= 2) ? cols : line.split(',');

        if (finalCols.length < 2) continue;

        // Expected Columns:
        // 0: Name, 1: Code, 2: Width, 3: Height, 4: Color, 5: Finish, 6: Style, 7: Area, 8: ImageUrl, 9: Thickness, 10: Pei, 11: Slip, 12: Rectified
        const name = finalCols[0]?.trim();
        const code = finalCols[1]?.trim()?.toUpperCase();

        if (!name || !code) continue;

        const width = parseFloat(finalCols[2]?.replace(',', '.')) || 60;
        const height = parseFloat(finalCols[3]?.replace(',', '.')) || 120;
        const color = finalCols[4]?.trim() || 'Gri';
        const finish = finalCols[5]?.trim() || 'Mat';
        const style = finalCols[6]?.trim() || defaultStyle;
        const area = finalCols[7]?.trim() || 'Yer,Duvar,Mutfak,Banyo';
        const img = finalCols[8]?.trim() || '';
        const thickness = parseFloat(finalCols[9]?.replace(',', '.')) || 9.5;
        const peiRating = parseInt(finalCols[10]) || 4;
        const slipResistance = finalCols[11]?.trim() || 'R9';
        const rectifiedVal = finalCols[12]?.trim()?.toLowerCase();
        const rectified = rectifiedVal ? (rectifiedVal === 'evet' || rectifiedVal === 'true' || rectifiedVal === '1') : true;

        rowsToProcess.push({
          name,
          code,
          width,
          height,
          color,
          finish,
          style,
          area,
          imageUrl: img,
          thickness,
          peiRating,
          slipResistance,
          rectified
        });
      }
    }

    if (rowsToProcess.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Geçerli ürün verisi tespit edilemedi. Lütfen ürün adı ve kodu sütunlarını kontrol edin.'
      }, { status: 400 });
    }

    // Process DB Upserts
    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const item of rowsToProcess) {
      if (!item.name || !item.code) continue;

      const defaultImg = getDefaultTexture(item.style);
      const imageUrl = (item.imageUrl && item.imageUrl.startsWith('http')) ? item.imageUrl : (item.imageUrl || defaultImg);
      const textureUrl = imageUrl;

      try {
        const existing = await prisma.product.findUnique({
          where: { code: item.code }
        });

        await prisma.product.upsert({
          where: { code: item.code },
          update: {
            name: item.name,
            brandId: brand.id,
            width: item.width || 60,
            height: item.height || 120,
            color: item.color || 'Beyaz',
            finish: item.finish || 'Mat',
            style: item.style || defaultStyle,
            area: item.area || 'Yer,Duvar',
            imageUrl,
            textureUrl,
            thickness: item.thickness || 9.5,
            peiRating: item.peiRating || 4,
            slipResistance: item.slipResistance || 'R9',
            rectified: item.rectified !== undefined ? item.rectified : true
          },
          create: {
            name: item.name,
            code: item.code,
            brandId: brand.id,
            width: item.width || 60,
            height: item.height || 120,
            color: item.color || 'Beyaz',
            finish: item.finish || 'Mat',
            style: item.style || defaultStyle,
            area: item.area || 'Yer,Duvar',
            imageUrl,
            textureUrl,
            isPremium: false,
            thickness: item.thickness || 9.5,
            peiRating: item.peiRating || 4,
            slipResistance: item.slipResistance || 'R9',
            rectified: item.rectified !== undefined ? item.rectified : true
          }
        });

        if (existing) {
          updatedCount++;
        } else {
          importedCount++;
        }
      } catch (err) {
        errors.push(`Kod: ${item.code} (${item.name}) - Hata: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Toplu aktarım başarıyla tamamlandı! ${importedCount} yeni ürün eklendi, ${updatedCount} ürün güncellendi.`,
      summary: {
        totalReceived: rowsToProcess.length,
        importedCount,
        updatedCount,
        errorCount: errors.length
      },
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Bulk Import API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Toplu aktarım sırasında sunucu hatası oluştu: ' + error.message
    }, { status: 500 });
  }
}
