const fs = require('fs');

async function search() {
  const url = 'https://ngkutahyaseramik.com.tr/build/assets/app-C5afAk9e.js?v=01';
  console.log('Fetching', url);
  const response = await fetch(url);
  const text = await response.text();

  // Search for the word _products_url
  const index = text.indexOf('_products_url');
  if (index !== -1) {
    console.log('Found _products_url at index', index);
    console.log(text.substring(index - 200, index + 300));
  } else {
    console.log('_products_url not found in app.js');
  }

  // Look for any fetch or axios calls that load product data
  // E.g., loading products list
  const searchKeywords = ['/products', '/urunler', 'window._', 'axios.', 'fetch(', 'get('];
  searchKeywords.forEach(kw => {
    let pos = 0;
    console.log(`--- Matches for '${kw}' ---`);
    let matchesCount = 0;
    while ((pos = text.indexOf(kw, pos)) !== -1 && matchesCount < 5) {
      console.log(text.substring(pos - 100, pos + 100).replace(/\n/g, ' '));
      pos += kw.length;
      matchesCount++;
    }
  });
}

search().catch(console.error);
