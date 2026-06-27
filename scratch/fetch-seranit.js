const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for native HTTPS JSON requests
function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse JSON: ${err.message}. Raw length: ${data.length}`));
          }
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
async function getJsonWithRetry(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await getJson(url);
    } catch (err) {
      console.log(`[HTTP GET Attempt ${attempt}/3] Error: ${err.message}. Retrying...`);
      if (attempt < 3) await sleep(4000);
      else throw err;
    }
  }
}

// Helper to convert words to title case (Turkish characters handled)
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
      // Capitalize first letter
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
  console.log('         Seranit Ürün İndirici (API Bazlı)            ');
  console.log('======================================================\n');

  // 1. Tüm serileri çekelim
  const seriesList = [];
  let page = 1;
  let hasMore = true;

  console.log('[PLP] Seriler taranıyor...');
  while (hasMore) {
    console.log(`   -> Seriler sayfası ${page} indiriliyor...`);
    const plpUrl = `https://www.seranit.com.tr/tr/Seriler/getSer?st=${page}&uk=0&ka=0&_do=0&yu=0&bo=0&re=0&val=`;
    
    try {
      const res = await getJsonWithRetry(plpUrl);
      if (res && res.length > 0) {
        seriesList.push(...res);
        page++;
        // Eğer gelen kayıt sayısı 20'den azsa sonraki sayfa yoktur
        if (res.length < 20) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
      await sleep(200);
    } catch (err) {
      console.error(`[PLP Hata] Sayfa ${page} taranamadı:`, err.message);
      hasMore = false;
    }
  }

  console.log(`\n[PLP] Tarama tamamlandı. Toplam ${seriesList.length} adet seri bulundu.`);

  if (seriesList.length === 0) {
    console.error('[Hata] Hiç seri bulunamadı.');
    process.exit(1);
  }

  // 2. Her bir serinin ürünlerini çekelim
  const finalProducts = [];
  const concurrencyLimit = 5;
  let activeIndex = 0;

  console.log('\n[PDP] Seri ürünleri çekiliyor...');

  const worker = async () => {
    while (activeIndex < seriesList.length) {
      const currentIndex = activeIndex++;
      const series = seriesList[currentIndex];
      const pdpUrl = `https://www.seranit.com.tr/tr/Seriler/getSeriProduct?se=${series.Id}&si=&_do=&mo=`;
      
      console.log(`[PDP] [${currentIndex + 1}/${seriesList.length}] Ürünler çekiliyor: ${series.Name} (ID: ${series.Id})`);
      
      try {
        const products = await getJsonWithRetry(pdpUrl);
        let seriesProductCount = 0;

        for (const prod of products) {
          if (!prod.Code || !prod.ListImage) continue;

          // 1. Boyutları parse edelim (örn. "40x120")
          let width = 60;
          let height = 60;
          const sizeStr = (prod.Size || '').toLowerCase().replace(/,/g, '.').trim();
          const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
          if (sizeMatch) {
            width = parseFloat(sizeMatch[1]);
            height = parseFloat(sizeMatch[2]);
          }

          // 2. Renk standardizasyonu
          let color = 'Gri';
          const colorVal = (prod.Color || '').toLowerCase();
          if (colorVal.includes('beyaz') || colorVal.includes('white') || colorVal.includes('bianco')) color = 'Beyaz';
          else if (colorVal.includes('gri') || colorVal.includes('grey') || colorVal.includes('antrasit')) color = 'Gri';
          else if (colorVal.includes('bej') || colorVal.includes('beige')) color = 'Bej';
          else if (colorVal.includes('krem') || colorVal.includes('cream') || colorVal.includes('kemik')) color = 'Krem';
          else if (colorVal.includes('kahve') || colorVal.includes('brown')) color = 'Kahverengi';
          else if (colorVal.includes('siyah') || colorVal.includes('black')) color = 'Siyah';
          else if (colorVal.includes('mavi') || colorVal.includes('blue')) color = 'Mavi';
          else if (colorVal.includes('yeşil') || colorVal.includes('green')) color = 'Yeşil';
          else if (colorVal.includes('sarı') || colorVal.includes('yellow')) color = 'Sarı';
          else if (colorVal.includes('altın') || colorVal.includes('gold')) color = 'Altın';
          else if (colorVal.includes('vizon')) color = 'Bej';

          // 3. Yüzey (Surface)
          let finish = 'Mat';
          const surfaceVal = (prod.Surface || '').toLowerCase();
          if (surfaceVal.includes('parlak') || surfaceVal.includes('lappato') || surfaceVal.includes('lux') || surfaceVal.includes('crystal')) {
            finish = 'Parlak';
          }

          // 4. Stil (Style / Texture)
          let style = 'Mermer';
          const textureVal = (prod.Texture || '').toLowerCase();
          if (textureVal.includes('ahşap') || textureVal.includes('wood') || textureVal.includes('ahsap')) style = 'Ahşap';
          else if (textureVal.includes('taş') || textureVal.includes('stone') || textureVal.includes('tas')) style = 'Taş';
          else if (textureVal.includes('beton') || textureVal.includes('cement')) style = 'Beton';

          // 5. Kullanım Alanı
          let area = 'Yer,Duvar,Mutfak,Banyo';
          const bodyVal = (prod.Body || '').toLowerCase();
          if (bodyVal.includes('duvar')) {
            area = 'Duvar,Mutfak,Banyo';
          }

          // 6. Rektifiyeli (Rectified)
          const nameLower = (prod.Name || '').toLowerCase();
          const rectified = nameLower.includes('rektifiyeli') || nameLower.includes('rek') || prod.Code.toLowerCase().includes('rek');

          // 7. İsim biçimlendirme
          const cleanSeries = toTitleCase(series.Name);
          const cleanColor = toTitleCase(prod.Color);
          const cleanSurface = toTitleCase(prod.Surface);
          const cleanSize = (prod.Size || '').toLowerCase().trim();
          
          const finalName = `Seranit ${cleanSeries} ${cleanColor} ${cleanSurface} ${cleanSize}`;

          finalProducts.push({
            name: finalName,
            code: prod.Code,
            width,
            height,
            color,
            finish,
            style,
            area,
            thickness: parseFloat(prod.Thickness) || 8.5,
            rectified,
            imageUrl: `https://www.seranit.com.tr/products/${prod.ListImage}`,
            textureUrl: `https://www.seranit.com.tr/products/${prod.ListImage}`,
            sourceUrl: `https://www.seranit.com.tr/tr/karo-seriler/${encodeURIComponent(series.Name)}/${series.Id}`
          });
          seriesProductCount++;
        }
        console.log(`   -> ${series.Name} serisinden ${seriesProductCount} adet varyasyon karo alındı.`);
      } catch (err) {
        console.error(`[PDP Hata] Seri ürünleri çekilemedi: ${series.Name} - ${err.message}`);
      }
      
      // Polite sleep
      await sleep(100);
    }
  };

  // Concurrency limitine göre workerları başlatalım
  const workers = Array.from({ length: concurrencyLimit }, () => worker());
  await Promise.all(workers);

  console.log(`\n[PDP] Tüm ürün varyasyonları tarandı. Toplam ${finalProducts.length} adet porselen karo hazırlandı.`);

  // Kayıt edelim
  const outputPath = path.join(__dirname, 'seranit-products.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log(`[Dosya] Ürünler başarıyla "${outputPath}" dosyasına kaydedildi.`);
}

main().catch(console.error).finally(() => process.exit(0));
