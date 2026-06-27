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
    fs.writeFileSync(path.join(__dirname, 'qua-output.html'), text, 'utf8');
    
    console.log('--- HTML Clues ---');
    // Check if we have Bien-like data attributes
    const dataAttributes = [
      'data-collection',
      'data-doku',
      'data-package',
      'data-product_type',
      'data-feature'
    ];
    dataAttributes.forEach(attr => {
      const regex = new RegExp(attr, 'gi');
      const matches = text.match(regex);
      console.log(`Found ${attr} count: ${matches ? matches.length : 0}`);
    });

    // Check for images
    const imgs = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`Found ${imgs.length} images. First 15:`);
    console.log(imgs.slice(0, 15));

    // Links
    const links = [];
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = linkRegex.exec(text)) !== null) {
      const href = match[1];
      const content = match[2];
      if (href.includes('/karolar/') || href.includes('detail') || href.includes('product')) {
        links.push({ href, text: content.replace(/<[^>]*>/g, '').trim() });
      }
    }
    console.log(`Found ${links.length} matching links. First 15:`);
    console.log(links.slice(0, 15));

  } catch (err) {
    console.error(`Error:`, err);
  }
}

testUrl('https://qua.com.tr/karolar/tum-karolar');
