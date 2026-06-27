async function countAll() {
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
  const catalogueProductCounts = [];

  // Fetch in batches of 15 to avoid overwhelming the server/timeouts
  const batchSize = 15;
  for (let i = 0; i < catalogues.length; i += batchSize) {
    const batch = catalogues.slice(i, i + batchSize);
    await Promise.all(batch.map(async (cat) => {
      try {
        const prodUrl = `https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=${cat.id}&locale=tr`;
        const prodResponse = await fetch(prodUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(10000)
        });
        const prodData = await prodResponse.json();
        const products = prodData?.products || [];
        totalProducts += products.length;
        catalogueProductCounts.push({ title: cat.title, count: products.length });
      } catch (err) {
        console.error(`Error fetching products for catalogue ${cat.title} (${cat.id}):`, err.message);
      }
    }));
    console.log(`Processed ${Math.min(i + batchSize, catalogues.length)}/${catalogues.length} catalogues...`);
  }

  console.log('--- RESULTS ---');
  console.log('Total catalogues processed:', catalogues.length);
  console.log('Total products found across all catalogues:', totalProducts);
}

countAll().catch(console.error);
