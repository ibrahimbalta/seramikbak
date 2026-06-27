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
    fs.writeFileSync(path.join(__dirname, 'bien-output.html'), text, 'utf8');
    
    // Look for some clues
    console.log('--- HTML Clues ---');
    // search for product grids or links
    const matches = [];
    // Bien website typical product urls look like: "/karolar/..." or contain product data
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const href = match[1];
      const content = match[2];
      if (href.includes('/urun/') || href.includes('/karolar/') || href.includes('detail') || href.includes('product')) {
        links.push({ href, text: content.replace(/<[^>]*>/g, '').trim() });
      }
    }
    console.log(`Found ${links.length} matching links. First 15:`);
    console.log(links.slice(0, 15));

    // Search for images with class containing "product" or dynamic folders
    const imgs = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    while ((match = imgRegex.exec(text)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`Found ${imgs.length} images. First 15:`);
    console.log(imgs.slice(0, 15));

    // Check if there is dynamic next.js / JSON payload
    if (text.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    }
  } catch (err) {
    console.error(`Error:`, err);
  }
}

testUrl('https://www.bienseramik.com.tr/karolar/tum-karolar');
