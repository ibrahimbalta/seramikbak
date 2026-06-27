const fs = require('fs');
const path = require('path');

async function testSeries(slug) {
  const url = `https://www.yurtbayseramik.com/tr/urunler/seriler/${slug}`;
  console.log(`Fetching Yurtbay Series: ${url}`);
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
    fs.writeFileSync(path.join(__dirname, 'yurtbay-series.html'), text, 'utf8');
    
    // Check for images
    console.log('--- Searching for images in series ---');
    const imgs = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      imgs.push(match[1]);
    }
    console.log(`Found ${imgs.length} images. First 20:`);
    console.log(imgs.slice(0, 20));

    // Look for lazy images (Yurtbay uses lazy images)
    console.log('--- Searching for lazy images (data-src) ---');
    const lazyImgs = [];
    const lazyImgRegex = /data-src="([^"]+)"/gi;
    while ((match = lazyImgRegex.exec(text)) !== null) {
      lazyImgs.push(match[1]);
    }
    console.log(`Found ${lazyImgs.length} data-src images. First 20:`);
    console.log(lazyImgs.slice(0, 20));

    // Look for headers
    console.log('--- Searching for headings ---');
    const headings = [];
    const headingRegex = /<h[2345][^>]*>([\s\S]*?)<\/h[2345]>/gi;
    while ((match = headingRegex.exec(text)) !== null) {
      headings.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    console.log(`Found ${headings.length} headings:`);
    console.log(headings);
  } catch (err) {
    console.error('Error:', err);
  }
}

testSeries('afyon');
