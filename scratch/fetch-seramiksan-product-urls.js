const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function getHtmlWithRetry(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await getHtml(url);
    } catch (err) {
      console.log(`[Fetch Attempt ${attempt}/3] Error for ${url}: ${err.message}. Retrying...`);
      if (attempt < 3) await sleep(2000);
      else throw err;
    }
  }
}

async function main() {
  const seriesListPath = path.join(__dirname, 'seramiksan-series-list.json');
  if (!fs.existsSync(seriesListPath)) {
    console.error('Series list not found!');
    process.exit(1);
  }

  const seriesList = JSON.parse(fs.readFileSync(seriesListPath, 'utf8'));
  console.log(`Loaded ${seriesList.length} series to scan.`);

  const productUrlsMap = {};
  const concurrency = 10;
  let activeIndex = 0;

  const worker = async () => {
    while (activeIndex < seriesList.length) {
      const idx = activeIndex++;
      const series = seriesList[idx];
      console.log(`[Series ${idx + 1}/${seriesList.length}] Fetching ${series.name} (${series.url})...`);

      try {
        const html = await getHtmlWithRetry(series.url);
        
        // Find product links:
        // <a href="https://www.seramiksan.com.tr/seramik/336601-33x66-etna-kemik-sugar-urunu" data-result="show">
        //   <picture><source ...><img src="IMAGE_URL" ...></picture>
        //   ...
        // </a>
        // Let's use regex to find anchors containing -urunu
        const anchorRegex = /<a\s+href="(https:\/\/www\.seramiksan\.com\.tr\/seramik\/[\w,-]+-urunu)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        let count = 0;
        while ((match = anchorRegex.exec(html)) !== null) {
          const productUrl = match[1];
          const innerHtml = match[2];
          
          // Find image URL in inner HTML
          const imgMatch = innerHtml.match(/<img\s+src="([^"]+)"/i);
          const imageUrl = imgMatch ? imgMatch[1] : '';

          if (!productUrlsMap[productUrl]) {
            productUrlsMap[productUrl] = {
              imageUrl: imageUrl,
              seriesName: series.name
            };
            count++;
          }
        }
        console.log(`   -> Found ${count} new product variations in ${series.name}`);
      } catch (err) {
        console.error(`[Error] Failed to scan series ${series.name}:`, err.message);
      }
      await sleep(100);
    }
  };

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const productList = Object.entries(productUrlsMap).map(([url, info]) => ({
    url,
    imageUrl: info.imageUrl,
    seriesName: info.seriesName
  }));

  console.log(`\nTotal unique product variation URLs found: ${productList.length}`);

  const outputPath = path.join(__dirname, 'seramiksan-product-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(productList, null, 2), 'utf8');
  console.log(`Saved product URLs mapping to: ${outputPath}`);
}

main().catch(console.error);
