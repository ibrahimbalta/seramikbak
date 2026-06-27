async function checkAll() {
  const catUrl = 'https://ngkutahyaseramik.com.tr/api/getCatalogues';
  const response = await fetch(catUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
      locale: 'tr',
      filters: {},
      page: 1,
      per_page: 300 // fetch all 257 catalogues
    })
  });
  
  const catData = await response.json();
  const catalogues = catData?.data || [];
  console.log('Total catalogues:', catalogues.length);

  let totalProducts = 0;
  const sampleProducts = [];

  for (let i = 0; i < Math.min(catalogues.length, 5); i++) {
    const cat = catalogues[i];
    const prodUrl = `https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=${cat.id}&locale=tr`;
    const prodResponse = await fetch(prodUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const prodData = await prodResponse.json();
    const products = prodData?.products || [];
    totalProducts += products.length;
    console.log(`Catalogue: ${cat.title} | Products: ${products.length}`);
    if (products.length > 0) {
      sampleProducts.push({
        catalogueTitle: cat.title,
        sample: products[0]
      });
    }
  }

  console.log('Sample Products details:');
  console.log(JSON.stringify(sampleProducts, null, 2));
}

checkAll().catch(console.error);
