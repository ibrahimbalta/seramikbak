const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-output.html'), 'utf8');

// Regex to capture Yurtbay Seramik series links and titles from default listing
const regex = /href="https:\/\/www\.yurtbayseramik\.com\/tr\/urunler\/seriler\/([^"]+)"[\s\S]*?alt="([^"]+)"/gi;

let match;
const series = [];
const seen = new Set();

while ((match = regex.exec(html)) !== null) {
  const slug = match[1].trim();
  const title = match[2].trim().toUpperCase();
  if (!seen.has(slug)) {
    seen.add(slug);
    series.push({ slug, title });
  }
}

console.log(`Found total ${series.length} Yurtbay Seramik series.`);
if (series.length > 0) {
  console.log('First 10 series in list:', JSON.stringify(series.slice(0, 10), null, 2));
}
