const fs = require('fs');
const path = require('path');

async function testCollection(slug) {
  const url = `https://www.egeseramik.com/koleksiyon/${slug}`;
  console.log(`Fetching collection: ${url}`);
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
    fs.writeFileSync(path.join(__dirname, 'ege-collection.html'), text, 'utf8');
    
    // Look for product image and title patterns
    console.log('--- Searching for images in collection ---');
    const imgs = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`Found ${imgs.length} images. First 15:`);
    console.log(imgs.slice(0, 15));

    // Look for product names or titles (often in h3, h4 or list tags)
    console.log('--- Searching for text/titles ---');
    const titles = [];
    const titleRegex = /<h[345][^>]*>(.*?)<\/h[345]>/gi;
    while ((match = titleRegex.exec(text)) !== null) {
      titles.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    console.log(`Found ${titles.length} headings:`);
    console.log(titles.slice(0, 15));

    // Look for tables or lists of sizes/finishes/colors
    console.log('--- Check for spec table ---');
    if (text.includes('<table') || text.includes('tab-content')) {
      console.log('Found table or tab content!');
    }
  } catch (err) {
    console.error('Error fetching collection:', err);
  }
}

testCollection('adriatic');
