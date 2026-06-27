async function testApi() {
  const url = 'https://www.yurtbayseramik.com/tr/filterProducts';
  console.log(`Sending POST to: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        seri: 'AFYON'
      })
    });
    console.log(`Status: ${response.status}`);
    const json = await response.json();
    console.log('API response keys:', Object.keys(json));
    console.log('Response count:', json.count);
    console.log('Response count_msg:', json.count_msg);
    console.log('Response render preview (first 1000 chars):');
    console.log(json.render.substring(0, 1000));
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}

testApi();
