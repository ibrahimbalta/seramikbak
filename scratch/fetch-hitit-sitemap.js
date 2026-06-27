async function main() {
  const url = 'https://www.hititseramik.com.tr/sitemap.xml';
  console.log('Fetching sitemap from:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Response status:', res.status);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    const text = await res.text();
    console.log(`Fetched sitemap. Length: ${text.length} characters.`);
    
    // Extract all <loc>
    const regex = /<loc>([\s\S]*?)<\/loc>/gi;
    let match;
    const urls = [];
    while ((match = regex.exec(text)) !== null) {
      urls.push(match[1].trim());
    }
    console.log(`Total URLs in sitemap: ${urls.length}`);
    
    // Print URLs containing /urunler/
    console.log('\nProduct URLs:');
    let count = 0;
    for (const u of urls) {
      if (u.toLowerCase().includes('/urunler/')) {
        console.log(`- ${u}`);
        count++;
      }
    }
    console.log(`Total product URLs: ${count}`);
    
    if (count === 0) {
      console.log('\nFirst 50 URLs in sitemap:');
      urls.slice(0, 50).forEach(u => console.log('-', u));
    }
  } catch (err) {
    console.error('Error fetching sitemap:', err.message);
  }
}
main();
