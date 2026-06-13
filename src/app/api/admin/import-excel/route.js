import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { brandId, tsvData, defaultStyle } = body;

    if (!brandId || !tsvData) {
      return NextResponse.json({ success: false, error: 'Marka seçimi ve Excel verisi gereklidir.' }, { status: 400 });
    }

    // Fetch brand
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Seçili marka veritabanında bulunamadı.' }, { status: 404 });
    }

    const logs = [];
    let importedCount = 0;

    // Split rows by newline
    const rows = tsvData.split(/\r?\n/);
    logs.push(`[İçe Aktarım] ${rows.length} satır tespit edildi. Ayrıştırma başlıyor...`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue; // Skip empty rows

      // Split columns by tab (\t) or comma if no tabs are found (simple CSV support)
      const cols = row.includes('\t') ? row.split('\t') : row.split(',');

      if (cols.length < 2) {
        logs.push(`[Satır ${i + 1} - Hata] Yetersiz sütun. Satır atlandı: "${row.substring(0, 30)}..."`);
        continue;
      }

      // Expected format:
      // Col 0: Name (e.g. Borneo Antrasit)
      // Col 1: Code/SKU (e.g. BIEN-BOR-ANT)
      // Col 2: Width (e.g. 60)
      // Col 3: Height (e.g. 120)
      // Col 4: Color (e.g. Antrasit)
      // Col 5: Finish (e.g. Parlak)
      // Col 6: Style (optional, e.g. Mermer)
      // Col 7: Area (optional, e.g. Yer,Duvar)
      // Col 8: Image URL (optional, e.g. /textures/borneo.jpg)

      const name = cols[0]?.trim();
      const code = cols[1]?.trim()?.toUpperCase();
      
      if (!name || !code) {
        logs.push(`[Satır ${i + 1} - Hata] Ürün adı veya kodu eksik. Satır atlandı.`);
        continue;
      }

      const width = parseFloat(cols[2]?.replace(',', '.')) || 60;
      const height = parseFloat(cols[3]?.replace(',', '.')) || 60;
      const color = cols[4]?.trim() || 'Beyaz';
      const finish = cols[5]?.trim() || 'Mat';
      const style = cols[6]?.trim() || defaultStyle || 'Mermer';
      const area = cols[7]?.trim() || 'Yer,Duvar,Mutfak,Banyo';
      
      // Default to standard texture if no URL is provided.
      // We will match these SKU codes later when the user uploads a ZIP of images!
      const defaultImageUrl = style === 'Ahşap' ? '/textures/teak_ahsap.jpg' :
                             style === 'Beton' ? '/textures/loft_beton.jpg' :
                             style === 'Taş' ? '/textures/vista_bej.jpg' : '/textures/calacatta_gold.jpg';
      
      const imageUrl = cols[8]?.trim() || defaultImageUrl;

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
        
        logs.push(`[Eşleştirildi] Ürün Başarıyla Eklendi: "${name}" (SKU: ${code})`);
        importedCount++;
      } catch (err) {
        logs.push(`[Satır ${i + 1} - Veritabanı Hatası] ${err.message}`);
      }
    }

    logs.push(`[Tamamlandı] İçe aktarım bitti. ${importedCount} adet ürün veritabanında oluşturuldu/güncellendi.`);

    return NextResponse.json({
      success: true,
      count: importedCount,
      logs
    });

  } catch (error) {
    console.error('Import Excel API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
