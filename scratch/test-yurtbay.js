const fs = require('fs');
const path = require('path');

async function testUrl(url) {
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
    fs.writeFileSync(path.join(__dirname, 'yurtbay-output.html'), text, 'utf8');
    
    console.log('--- HTML Clues ---');
    if (text.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    }
    if (text.includes('window.__INITIAL_STATE__')) {
      console.log('Found window.__INITIAL_STATE__');
    }

    // Look for link structures
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const href = match[1];
      const content = match[2];
      if (href.includes('/urun/') || href.includes('/urunler/') || href.includes('detail') || href.includes('koleksiyon')) {
        links.push({ href, text: content.replace(/<[^>]*>/g, '').trim() });
      }
    }
    console.log(`Found ${links.length} matching links. First 25:`);
    console.log(links.slice(0, 25));

    // Images
    const imgs = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    while ((match = imgRegex.exec(text)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`Found ${imgs.length} images. First 15:`);
    console.log(imgs.slice(0, 15));

  } catch (err) {
    console.error(`Error:`, err);
  }
}

testUrl('https://www.yurtbayseramik.com/tr/urunler');
