async function fetchJsonWithRetry(url, options = {}, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://ngkutahyaseramik.com.tr/urunler',
          ...options.headers
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE')) {
        throw new Error('Received HTML instead of JSON (Rate limit or WAF)');
      }
      return JSON.parse(text);
    } catch (err) {
      console.log(`[Retry ${i + 1}/${retries}] Failed to fetch ${url}: ${err.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

function extractProductsFromResponse(data) {
  const list = [];
  if (!data || !data.products) return list;
  
  if (Array.isArray(data.products)) {
    for (const item of data.products) {
      // Format 1: Flat array of products
      if (item.slug && item.url) {
        list.push(item);
      } 
      // Format 2: Array of categories with nested products object
      else if (item.products && typeof item.products === 'object') {
        const categories = item.products;
        for (const size in categories) {
          if (Array.isArray(categories[size])) {
            for (const prod of categories[size]) {
              if (prod.slug && prod.url) {
                list.push(prod);
              }
            }
          }
        }
      }
    }
  }
  return list;
}

async function run() {
  console.log('Fetching Adel (2412)...');
  const adelData = await fetchJsonWithRetry('https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=2412&locale=tr');
  const adelProducts = extractProductsFromResponse(adelData);
  console.log(`Adel count: ${adelProducts.length}`);
  if (adelProducts.length > 0) {
    console.log('Adel sample:', {
      title: adelProducts[0].title,
      code: adelProducts[0].code,
      image_url: adelProducts[0].image_url
    });
  }

  // Sleep 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Fetching Portland (3260)...');
  const portlandData = await fetchJsonWithRetry('https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=3260&locale=tr');
  const portlandProducts = extractProductsFromResponse(portlandData);
  console.log(`Portland count: ${portlandProducts.length}`);
  if (portlandProducts.length > 0) {
    console.log('Portland sample:', {
      title: portlandProducts[0].title,
      code: portlandProducts[0].code,
      image_url: portlandProducts[0].image_url
    });
  }
}

run().catch(console.error);
