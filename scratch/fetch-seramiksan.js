const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for native HTTPS GET
function getHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP Status ${res.statusCode}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });

    req.on('error', reject);
  });
}

// Fetch with retry
async function getHtmlWithRetry(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await getHtml(url);
    } catch (err) {
      console.log(`[HTTP GET Attempt ${attempt}/3] Error: ${err.message}. Retrying...`);
      if (attempt < 3) await sleep(3000);
      else throw err;
    }
  }
}

// Title Case helper
function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/ı/g, 'I')
    .replace(/i/g, 'i')
    .replace(/ş/g, 'ş')
    .replace(/ğ/g, 'ğ')
    .replace(/ü/g, 'ü')
    .replace(/ö/g, 'ö')
    .replace(/ç/g, 'ç')
    .split(/[\s-]+/)
    .map(word => {
      if (word.length === 0) return '';
      let firstChar = word.charAt(0);
      if (firstChar === 'i') firstChar = 'İ';
      else if (firstChar === 'I') firstChar = 'I';
      else firstChar = firstChar.toUpperCase();
      return firstChar + word.slice(1);
    })
    .join(' ');
}

async function main() {
  console.log('======================================================');
  console.log('         Seramiksan Ürün İndirici (Eşzamanlı)         ');
  console.log('======================================================\n');

  const inputPath = path.join(__dirname, 'seramiksan-product-urls.json');
  if (!fs.existsSync(inputPath)) {
    console.error('[Hata] Ürün URL listesi bulunamadı!');
    process.exit(1);
  }

  const productUrls = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`[Dosya] ${productUrls.length} adet ürün URL'i taranacak.`);

  const finalProducts = [];
  const concurrencyLimit = 10;
  let activeIndex = 0;

  const worker = async () => {
    while (activeIndex < productUrls.length) {
      const currentIndex = activeIndex++;
      const item = productUrls[currentIndex];
      
      console.log(`[PDP] [${currentIndex + 1}/${productUrls.length}] İndiriliyor: ${item.url}`);
      
      try {
        const html = await getHtmlWithRetry(item.url);

        // 1. Teknik Tabloyu Parse edelim
        const specMap = {};
        const rowRegex = /<tr>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(html)) !== null) {
          const key = rowMatch[1].replace(/<[^>]+>/g, '').trim();
          const val = rowMatch[2].replace(/<[^>]+>/g, '').trim();
          specMap[key] = val;
        }

        // 2. Ürün Kodu kontrolü
        const code = specMap['Ürün Kodu'];
        if (!code) {
          console.log(`   -> [Atlandı] Ürün kodu bulunamadı: ${item.url}`);
          continue;
        }

        // 3. Ebat / Boyut parse etme
        let width = 60;
        let height = 60;
        const ebatRaw = specMap['Ebat'] || '';
        const sizeStr = ebatRaw.toLowerCase().replace(/\*/g, 'x').replace(/,/g, '.').trim();
        const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]);
          height = parseFloat(sizeMatch[2]);
        }

        // 4. Renk Standardizasyonu
        let color = 'Gri';
        const colorVal = (specMap['Renk'] || '').toLowerCase();
        if (colorVal.includes('beyaz') || colorVal.includes('white')) color = 'Beyaz';
        else if (colorVal.includes('gri') || colorVal.includes('grey') || colorVal.includes('antrasit')) color = 'Gri';
        else if (colorVal.includes('bej') || colorVal.includes('beige')) color = 'Bej';
        else if (colorVal.includes('krem') || colorVal.includes('cream')) color = 'Krem';
        else if (colorVal.includes('kahve') || colorVal.includes('brown')) color = 'Kahverengi';
        else if (colorVal.includes('siyah') || colorVal.includes('black')) color = 'Siyah';
        else if (colorVal.includes('mavi') || colorVal.includes('blue')) color = 'Mavi';
        else if (colorVal.includes('yeşil') || colorVal.includes('green')) color = 'Yeşil';
        else if (colorVal.includes('sarı') || colorVal.includes('yellow')) color = 'Sarı';
        else if (colorVal.includes('altın') || colorVal.includes('gold')) color = 'Altın';

        // 5. Yüzey (Surface / Finish)
        let finish = 'Mat';
        const surfaceVal = (specMap['Yüzey'] || '').toLowerCase();
        if (surfaceVal.includes('parlak') || surfaceVal.includes('lappato') || surfaceVal.includes('glossy') || surfaceVal.includes('sugar')) {
          finish = 'Parlak';
        }

        // 6. Stil (Style / Texture)
        let style = 'Mermer';
        const textureVal = (specMap['Doku'] || '').toLowerCase();
        if (textureVal.includes('ahşap') || textureVal.includes('wood') || textureVal.includes('ahsap')) style = 'Ahşap';
        else if (textureVal.includes('taş') || textureVal.includes('stone') || textureVal.includes('tas') || textureVal.includes('doğaltaş')) style = 'Taş';
        else if (textureVal.includes('beton') || textureVal.includes('cement')) style = 'Beton';

        // 7. Kullanım Alanı
        let area = 'Yer,Duvar,Mutfak,Banyo';
        const groupVal = (specMap['Ürün Grubu'] || '').toLowerCase();
        if (groupVal.includes('duvar')) {
          area = 'Duvar,Mutfak,Banyo';
        }

        // 8. Rektifiyeli (Rectified)
        const nameLower = toTitleCase(specMap['Seri'] || item.seriesName).toLowerCase();
        const rectified = nameLower.includes('rektifiyeli') || ebatRaw.toLowerCase().includes('r') || html.toLowerCase().includes('rektifiyeli');

        // 9. Görsel Bağlantısı (data-pinch)
        let highResImage = item.imageUrl;
        const pinchMatch = html.match(/data-pinch="([^"]+)"/i);
        if (pinchMatch && pinchMatch[1]) {
          highResImage = pinchMatch[1];
        }
        if (highResImage && !highResImage.startsWith('http')) {
          highResImage = 'https://www.seramiksan.com.tr' + highResImage;
        }

        // 10. İsim Biçimlendirme
        const cleanSeries = toTitleCase(specMap['Seri'] || item.seriesName);
        const cleanColor = toTitleCase(specMap['Renk'] || '').replace(' Tonları', '');
        const cleanSurface = toTitleCase(specMap['Yüzey'] || '');
        const cleanSize = ebatRaw.replace(/\*/g, 'x').trim();

        const finalName = `Seramiksan ${cleanSeries} ${cleanColor} ${cleanSurface} ${cleanSize}`;

        finalProducts.push({
          name: finalName,
          code: code,
          width,
          height,
          color,
          finish,
          style,
          area,
          thickness: 8.5,
          rectified,
          imageUrl: highResImage,
          textureUrl: highResImage,
          sourceUrl: item.url
        });
        console.log(`   -> Eklendi: ${finalName} (Kod: ${code})`);
      } catch (err) {
        console.error(`[Hata] Ürün indirilemedi veya ayrıştırılamadı: ${item.url} - ${err.message}`);
      }

      await sleep(100);
    }
  };

  const workers = Array.from({ length: concurrencyLimit }, () => worker());
  await Promise.all(workers);

  console.log(`\n[Bitti] Tüm ürünler tarandı. Toplam ${finalProducts.length} adet geçerli ürün kaydedilecek.`);

  const outputPath = path.join(__dirname, 'seramiksan-products.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log(`[Dosya] Başarıyla "${outputPath}" konumuna kaydedildi.`);
}

main().catch(console.error).finally(() => process.exit(0));
