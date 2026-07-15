const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) {
        throw new Error('HTTP 429 Too Many Requests');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.log(`[Retry] Error fetching ${url}: ${err.message}. Retrying ${i + 1}/${retries}...`);
      if (i < retries - 1) {
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
}

async function scrapePage(url) {
  console.log(`Scraping URL: ${url}`);
  const html = await fetchWithRetry(url);
  
  // Let's use a regex to find the product items.
  // Example block:
  // <a class="detailLink detailUrl" data-id="35" title="Decovita Antica Grey Sugar Effect 60x120 cm" href='/decovita-antica-grey-sugar-effect-60x120-cm'>
  // <img ... data-original='https://static.ticimax.cloud/52202/Uploads/UrunResimleri/thumb/decovita-antica-grey-sugar-effect-60x1--bfac-.jpg' alt="..." />
  // </a>
  
  // Let's search for image blocks
  const productRegex = /<div\s+class="productImage"\s*>[\s\S]*?<a\s+class="[^"]*detailUrl[^"]*"\s+[^>]*title="([^"]+)"[\s\S]*?data-original='([^']+)'/gi;
  
  let match;
  const products = [];
  while ((match = productRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const imageUrl = match[2].trim();
    products.push({ title, imageUrl });
  }
  
  // If regex missed some, let's also try a backup regex searching for img tags with alt and data-original directly
  if (products.length === 0) {
    console.log('Primary regex returned 0, trying backup regex...');
    const backupRegex = /<img\s+[^>]*class='[^']*lazyImage[^']*'\s+[^>]*data-original='([^']+)'\s+alt="([^"]+)"/gi;
    while ((match = backupRegex.exec(html)) !== null) {
      const imageUrl = match[1].trim();
      const title = match[2].trim();
      products.push({ title, imageUrl });
    }
  }
  
  console.log(`Found ${products.length} products on page.`);
  return products;
}

async function main() {
  const url1 = 'https://www.banyolife.com.tr/Decovita';
  const url2 = 'https://www.banyolife.com.tr/Decovita?sayfa=2';
  
  try {
    const prods1 = await scrapePage(url1);
    await sleep(1000);
    const prods2 = await scrapePage(url2);
    
    const allProducts = [...prods1, ...prods2];
    console.log(`Total unique or non-unique items scraped: ${allProducts.length}`);
    
    fs.writeFileSync(
      path.join(__dirname, 'banyolife-scraped.json'),
      JSON.stringify(allProducts, null, 2)
    );
    console.log('Saved scraped products to scratch/banyolife-scraped.json');
  } catch (err) {
    console.error('Scraping error:', err);
  }
}

main();
