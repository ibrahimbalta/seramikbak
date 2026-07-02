import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0'
];

/**
 * Parses Turkish price strings like "1.250,50 TL", "266,00", "₺305 /m²" into Float numbers.
 * @param {string} text - Raw text price from HTML
 * @returns {number|null} Parsed float price or null
 */
export function parsePriceText(text) {
  if (!text) return null;
  let cleaned = text.trim();
  
  // Keep only digits, commas, and dots
  cleaned = cleaned.replace(/[^0-9,.]/g, '');
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // E.g. "1.250,50" -> replace dot with empty and comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleaned.includes(',')) {
    // E.g. "266,00" -> replace comma with dot
    cleaned = cleaned.replace(/,/g, '.');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Fetches HTML from target URL, optionally routing through a proxy API.
 * @param {string} url - Target URL
 * @returns {Promise<string>} HTML response text
 */
export async function fetchHtml(url) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  // Support for residential proxy/anti-bot bypass (e.g. Scrape.do, ScrapingBee)
  if (process.env.SCRAPING_API_KEY) {
    const proxyUrl = `https://api.scrape.do?token=${process.env.SCRAPING_API_KEY}&url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      throw new Error(`Proxy service returned HTTP ${response.status}`);
    }
    return await response.text();
  }

  // Fallback to direct HTTP fetch
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw new Error(`Direct fetch failed with HTTP ${response.status}`);
  }
  return await response.text();
}

/**
 * Extracts product price from parsed HTML using JSON-LD schema or fallback query selectors.
 * @param {string} html - Raw HTML source code
 * @param {string} url - Target URL to determine the vendor
 * @returns {number|null} Extracted price or null
 */
export function extractPriceFromHtml(html, url) {
  if (!html) return null;
  const $ = cheerio.load(html);
  let price = null;

  // Determine vendor type
  let vendor = '';
  if (url.includes('trendyol.com')) vendor = 'trendyol';
  else if (url.includes('hepsiburada.com')) vendor = 'hepsiburada';
  else if (url.includes('n11.com')) vendor = 'n11';
  else if (url.includes('koctas.com.tr')) vendor = 'koctas';
  else if (url.includes('bauhaus.com.tr')) vendor = 'bauhaus';

  if (!vendor) return null;

  // 1. Try extracting from Schema JSON-LD (Search engines standard)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;
      const json = JSON.parse(content);
      const items = Array.isArray(json) ? json : [json];
      
      for (const item of items) {
        // Look for schema product templates
        if (item['@type'] === 'Product' || item['@type'] === 'ProductModel' || item.offers) {
          const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
          for (const offer of offers) {
            if (offer) {
              const rawPrice = offer.price || offer.lowPrice || offer.priceSpecification?.price;
              if (rawPrice) {
                const parsed = parseFloat(String(rawPrice).replace(',', '.'));
                if (!isNaN(parsed) && parsed > 0) {
                  price = parsed;
                  break;
                }
              }
            }
          }
        }
        if (price) break;
      }
    } catch (err) {
      // Ignore JSON parse errors
    }
  });

  if (price) return price;

  // 2. Selectors based fallback (if LD+JSON isn't available or empty)
  const isSearchPage = url.includes('/sr?') || url.includes('/ara?') || url.includes('/arama?');

  if (vendor === 'trendyol') {
    if (isSearchPage) {
      const priceText = $('.p-card-wrppr .prc-dsc, .p-card-chldrn-cntnr .prc-dsc').first().text();
      price = parsePriceText(priceText);
    } else {
      const priceText = $('.prc-dsc, .product-price-container .pr-bx-w, .pr-bx-w').first().text();
      price = parsePriceText(priceText);
    }
  } 
  else if (vendor === 'hepsiburada') {
    if (isSearchPage) {
      const priceText = $('[data-test-id="price-current-price"], [class*="currentPrice"]').first().text();
      price = parsePriceText(priceText);
    } else {
      const priceText = $('span[itemprop="price"], .price-val, #offering-price').first().text();
      price = parsePriceText(priceText);
    }
  } 
  else if (vendor === 'n11') {
    if (isSearchPage) {
      const priceText = $('.pro .newPrice ins, li.column .newPrice ins, .newPrice ins').first().text();
      price = parsePriceText(priceText);
    } else {
      const priceText = $('#priceins, .newPrice ins, span.price').first().text();
      price = parsePriceText(priceText);
    }
  } 
  else if (vendor === 'koctas') {
    if (isSearchPage) {
      const priceText = $('.product-item .product-price, .product-card .price, .product-tile .price, .price').first().text();
      price = parsePriceText(priceText);
    } else {
      const priceText = $('.product-price, span.price, .amount, .price').first().text();
      price = parsePriceText(priceText);
    }
  } 
  else if (vendor === 'bauhaus') {
    if (isSearchPage) {
      const priceText = $('.product-item .price, .product-card .amount, .price').first().text();
      price = parsePriceText(priceText);
    } else {
      const priceText = $('.price, .amount, .price-box').first().text();
      price = parsePriceText(priceText);
    }
  }

  return price;
}
