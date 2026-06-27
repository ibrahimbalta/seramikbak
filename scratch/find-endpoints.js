const fs = require('fs');

async function search() {
  const url = 'https://ngkutahyaseramik.com.tr/build/assets/app-C5afAk9e.js?v=01';
  console.log('Fetching', url);
  const response = await fetch(url);
  const text = await response.text();

  console.log('--- API ENDPOINTS ---');
  const regex = /"\/api\/[^"]+"/gi;
  let match;
  const endpoints = new Set();
  while ((match = regex.exec(text)) !== null) {
    endpoints.add(match[0]);
  }
  
  // also check with single quotes
  const regexSingle = /'\/api\/[^']+'/gi;
  while ((match = regexSingle.exec(text)) !== null) {
    endpoints.add(match[0]);
  }

  endpoints.forEach(ep => console.log(ep));
}

search().catch(console.error);
