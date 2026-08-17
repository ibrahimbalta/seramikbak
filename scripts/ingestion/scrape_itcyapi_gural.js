const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeGüralSeramikFull() {
  console.log('Starting full Güral Seramik scrape from https://itcyapi.com/marka/gural-seramik/ ...');
  
  const allProducts = [];
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const url = page === 1 
      ? 'https://itcyapi.com/marka/gural-seramik/' 
      : `https://itcyapi.com/marka/gural-seramik/page/${page}/`;

    console.log(`[Scraping] Page ${page}: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.log(`Page ${page} status ${response.status}. Reached end of pages.`);
        break;
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Select product elements
      const items = $('li.product, div.product-grid-item, div.type-product');
      console.log(`Found ${items.length} items on page ${page}`);

      if (items.length === 0) {
        break;
      }

      items.each((_, el) => {
        const title = $(el).find('.woocommerce-loop-product__title, .product-title, h2, h3').first().text().trim();
        const productUrl = $(el).find('a').first().attr('href') || '';
        
        let imageUrl = $(el).find('img').attr('data-lazy-src') ||
                         $(el).find('img').attr('data-src') ||
                         $(el).find('img').attr('src') || '';

        const priceText = $(el).find('.price').first().text().trim();

        if (title && !allProducts.some(p => p.title === title)) {
          allProducts.push({
            title,
            productUrl,
            imageUrl,
            priceText
          });
        }
      });

      page++;
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err.message);
      break;
    }
  }

  console.log(`\n==================================================`);
  console.log(`TOTAL Güral Seramik Products Scraped: ${allProducts.length}`);
  console.log(`==================================================\n`);

  // Save scraped JSON to scratch
  const outputPath = path.join(__dirname, 'gural_scraped_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`Saved scraped products to ${outputPath}`);
}

scrapeGüralSeramikFull().catch(console.error);
