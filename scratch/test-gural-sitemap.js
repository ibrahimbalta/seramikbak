const fs = require('fs');

async function main() {
  const urls = [
    'https://www.guralseramik.com.tr/sitemap.xml',
    'https://guralseramik.com.tr/sitemap.xml',
    'http://www.guralseramik.com.tr/sitemap.xml'
  ];
  
  for (const url of urls) {
    console.log('Fetching sitemap from:', url);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`Response status for ${url}: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Fetched sitemap. Length: ${text.length} characters.`);
        const regex = /<loc>([\s\S]*?)<\/loc>/gi;
        let match;
        const locs = [];
        while ((match = regex.exec(text)) !== null) {
          locs.push(match[1].trim());
        }
        console.log(`Total URLs: ${locs.length}`);
        console.log('\nSample URLs:');
        locs.slice(0, 10).forEach((u, i) => console.log(`${i+1}. ${u}`));
        break; // found it!
      }
    } catch (err) {
      console.error('Error fetching:', err.message);
    }
  }
}

main();
