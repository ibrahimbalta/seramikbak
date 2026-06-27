async function testApiWithCsrf() {
  const pageUrl = 'https://www.yurtbayseramik.com/tr/urunler/seriler/afyon';
  console.log(`Step 1: Fetching page to obtain CSRF token and Cookies from: ${pageUrl}`);
  
  try {
    const pageResponse = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log(`Page Status: ${pageResponse.status}`);
    const html = await pageResponse.text();
    
    // Extract CSRF token
    const csrfMatch = html.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"/i);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;
    console.log(`Extracted CSRF Token: ${csrfToken}`);
    
    if (!csrfToken) {
      console.error('Could not find CSRF token in HTML!');
      return;
    }
    
    // Extract Cookies
    const rawCookies = pageResponse.headers.getSetCookie();
    console.log('Raw Set-Cookie headers:', rawCookies);
    
    // Join cookies into a cookie string
    const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');
    console.log('Cookie header string:', cookieHeader);
    
    // Step 2: Post request with CSRF and Cookies
    const apiUrl = 'https://www.yurtbayseramik.com/tr/filterProducts';
    console.log(`Step 2: Sending POST to: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken,
        'Cookie': cookieHeader,
        'Referer': pageUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: new URLSearchParams({
        seri: 'AFYON'
      })
    });
    
    console.log(`API Status: ${apiResponse.status}`);
    const json = await apiResponse.json();
    console.log('API response keys:', Object.keys(json));
    console.log('Response count:', json.count);
    console.log('Response count_msg:', json.count_msg);
    console.log('Response render preview (first 1000 chars):');
    console.log(json.render.substring(0, 1000));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testApiWithCsrf();
