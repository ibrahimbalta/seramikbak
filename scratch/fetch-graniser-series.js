const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.graniser.com.tr/urunler.aspx'
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function main() {
  console.log('=== Graniser Tüm Serileri Toplama ===\n');
  
  const allSeries = [];
  const seenUrls = new Set();
  
  // Categories: t=-100 (all), t=1001 (Yer Karosu), t=1002 (Yer ve Duvar), t=1004 (20mm), t=1009 (Mutfak)
  const categories = [
    { name: 'Tümü', param: '-100' }
  ];
  
  for (const cat of categories) {
    let startIdx = 0;
    const pageSize = 12;
    let page = 1;
    
    while (true) {
      const url = `https://www.graniser.com.tr/urunler-ajax.aspx?t=${cat.param}&s=${startIdx}&a=${pageSize}`;
      console.log(`[Sayfa ${page}] Çekiliyor: ${url}`);
      
      try {
        const html = await getHtml(url);
        
        // Extract product URLs from anchor tags
        const linkRegex = /href="(\/urunler\/\d+\/[\w_-]+\/\d+\/[\w-]+\.aspx)"/gi;
        let match;
        let foundOnPage = 0;
        
        while ((match = linkRegex.exec(html)) !== null) {
          const seriesUrl = match[1];
          if (!seenUrls.has(seriesUrl)) {
            seenUrls.add(seriesUrl);
            
            // Extract series name
            const nameMatch = seriesUrl.match(/\/(\w[\w-]*)\.aspx$/i);
            const name = nameMatch ? nameMatch[1].toUpperCase() : 'UNKNOWN';
            
            // Extract image
            const imgRegex = new RegExp(`src="(/images/urunler/[^"]+)"`, 'i');
            const afterLink = html.substring(match.index);
            const imgMatch = afterLink.match(imgRegex);
            const imgUrl = imgMatch ? 'https://www.graniser.com.tr' + imgMatch[1] : '';
            
            allSeries.push({
              name,
              url: 'https://www.graniser.com.tr' + seriesUrl,
              thumbImage: imgUrl
            });
            foundOnPage++;
          }
        }
        
        console.log(`   -> ${foundOnPage} yeni seri bulundu (Toplam: ${allSeries.length})`);
        
        // Check for "morePage" link
        if (html.includes('morePage') || html.includes('Sonraki Sayfa')) {
          startIdx += pageSize;
          page++;
          await sleep(500);
        } else {
          // No more pages
          console.log(`   -> Son sayfa.`);
          break;
        }
        
        // Safety check
        if (page > 50) break;
        
      } catch (err) {
        console.error(`[Hata] ${url}: ${err.message}`);
        break;
      }
    }
  }
  
  console.log(`\n=== Toplam ${allSeries.length} benzersiz seri bulundu ===`);
  allSeries.forEach((s, i) => console.log(`  ${i+1}. ${s.name} -> ${s.url}`));
  
  const outputPath = path.join(__dirname, 'graniser-series-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(allSeries, null, 2), 'utf8');
  console.log(`\nKaydedildi: ${outputPath}`);
}

main().catch(console.error);
