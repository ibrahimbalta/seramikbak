async function testApi() {
  const url = 'https://www.egeseramik.com/product_categories?locale=tr_TR';
  console.log(`Fetching Ege Seramik API: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    console.log(`Status: ${response.status}`);
    const json = await response.json();
    console.log(`Total items in API response: ${json.total}`);
    console.log(`Data array length: ${json.data.length}`);
    if (json.data.length > 0) {
      console.log('First category item sample:', JSON.stringify(json.data[0], null, 2));
    }
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}

testApi();
