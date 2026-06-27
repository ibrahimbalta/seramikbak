const fs = require('fs');

async function main() {
  const url = 'https://www.hititseramik.com.tr/sitemap.xml';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    const regex = /<loc>([\s\S]*?)<\/loc>/gi;
    let match;
    const seriesUrls = new Set();
    while ((match = regex.exec(text)) !== null) {
      const u = match[1].trim();
      // Look for product urls like https://www.hititseramik.com.tr/urunler/series-name/product-name/
      const parts = u.split('/');
      // If it has enough parts and starts with /urunler/
      if (u.includes('/urunler/') && parts.length >= 6) {
        // e.g. https:, "", www.hititseramik.com.tr, urunler, series-name, product-name
        const seriesName = parts[4];
        if (seriesName !== 'renkler' && seriesName !== 'yuzeyler' && seriesName !== 'dis-mekan' && seriesName !== 'ebatlar') {
          seriesUrls.add(`https://www.hititseramik.com.tr/urunler/${seriesName}/`);
        }
      }
    }
    console.log(`Unique series URLs found: ${seriesUrls.size}`);
    for (const s of seriesUrls) {
      console.log('-', s);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
