async function test() {
  // 1. Fetch catalogues
  const catUrl = 'https://ngkutahyaseramik.com.tr/api/getCatalogues';
  console.log('Fetching catalogues from', catUrl);
  const catResponse = await fetch(catUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
      locale: 'tr',
      filters: {},
      page: 1,
      per_page: 20
    })
  });
  
  const catData = await catResponse.json();
  console.log('Catalogues Response:', JSON.stringify(catData, null, 2));

  console.log('Catalogues count:', catData?.data?.length);

  if (catData?.data?.length > 0) {
    const firstCat = catData.data[0];
    console.log('First Catalogue:', firstCat.title, 'ID:', firstCat.id);
    
    // 2. Fetch products in this catalogue
    const prodUrl = `https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=${firstCat.id}&locale=tr`;
    console.log('Fetching products from', prodUrl);
    const prodResponse = await fetch(prodUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const prodData = await prodResponse.json();
    console.log('Products count:', prodData?.products?.length);
    if (prodData?.products?.length > 0) {
      console.log('Sample Product from Catalogue:', JSON.stringify(prodData.products.slice(0, 3), null, 2));
    }
  }
}

test().catch(console.error);
