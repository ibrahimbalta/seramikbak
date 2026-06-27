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

async function run() {
  console.log('Fetching Portland (3260)...');
  const data = await fetchJsonWithRetry('https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=3260&locale=tr');
  console.log('Portland products structure:', Object.keys(data));
  console.log('Portland products detail:', JSON.stringify(data, null, 2).substring(0, 800));
}

run().catch(console.error);
