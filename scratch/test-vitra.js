const fs = require('fs');
const path = require('path');

async function testUrl(url, filename) {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Length: ${text.length}`);
    fs.writeFileSync(path.join(__dirname, filename), text, 'utf8');
    
    // Check for insider data-attributes
    const insiderRegex = /data-insider-plp-product/gi;
    const matches = text.match(insiderRegex);
    console.log(`Found data-insider-plp-product count: ${matches ? matches.length : 0}`);
  } catch (err) {
    console.error(`Error:`, err);
  }
}

async function run() {
  await testUrl('https://www.vitra.com.tr/c-yer-karolari?page=2', 'vitra-page-2.html');
  await testUrl('https://www.vitra.com.tr/ajax/c-yer-karolari?q=%3AbestSelling&page=1', 'vitra-ajax.html');
}

run();
