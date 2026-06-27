const fs = require('fs');

async function search() {
  const url = 'https://ngkutahyaseramik.com.tr/build/assets/app-C5afAk9e.js?v=01';
  console.log('Fetching', url);
  const response = await fetch(url);
  const text = await response.text();

  // Search for _url
  let pos = 0;
  console.log("--- Matches for '_url' ---");
  let matchesCount = 0;
  while ((pos = text.indexOf('_url', pos)) !== -1 && matchesCount < 10) {
    console.log(text.substring(pos - 150, pos + 150).replace(/\n/g, ' '));
    pos += 4;
    matchesCount++;
  }
}

search().catch(console.error);
