const fs = require('fs');

async function search() {
  const url = 'https://ngkutahyaseramik.com.tr/build/assets/app-C5afAk9e.js?v=01';
  console.log('Fetching', url);
  const response = await fetch(url);
  const text = await response.text();

  // Search for getProducts
  const keywords = ['Products', 'products', 'getProducts', 'getProductsByCatalogue', 'getVirtualRoom'];
  keywords.forEach(kw => {
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
