const fs = require('fs');
const path = require('path');

// Read the products page HTML
const contentPath = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\25e2108e-e4b0-4556-bfd2-e4d621338667\\.system_generated\\steps\\1909\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

// Extract the ViewState value
const vsMatch = html.match(/__VIEWSTATE[^>]+value="([^"]+)"/);
if (!vsMatch) {
  console.error('ViewState not found!');
  process.exit(1);
}

const vsBase64 = vsMatch[1];
const vsDecoded = Buffer.from(vsBase64, 'base64').toString('utf8');

// Find all product URLs in the decoded ViewState
// Pattern: /urunler/XXXX/category/XXX/name.aspx
const urlRegex = /\/urunler\/\d+\/[^\/]+\/\d+\/[\w-]+\.aspx/gi;
const urls = [];
let match;
while ((match = urlRegex.exec(vsDecoded)) !== null) {
  if (!urls.includes(match[0])) {
    urls.push(match[0]);
  }
}

console.log(`Found ${urls.length} unique product series URLs in ViewState.`);

// Also find image paths
const imgRegex = /\/images\/urunler\/[\w_-]+\.jpg/gi;
const images = [];
while ((match = imgRegex.exec(vsDecoded)) !== null) {
  if (!images.includes(match[0])) {
    images.push(match[0]);
  }
}
console.log(`Found ${images.length} unique product images in ViewState.`);

// Extract series names
const nameRegex = /\/urunler\/\d+\/[\w_-]+\/\d+\/([\w-]+)\.aspx/gi;
const seriesNames = [];
while ((match = nameRegex.exec(vsDecoded)) !== null) {
  const name = match[1].toUpperCase();
  if (!seriesNames.includes(name)) {
    seriesNames.push(name);
  }
}
console.log(`Series names: ${seriesNames.join(', ')}`);

// Build series list with image mappings
const seriesList = [];
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const nameMatch = url.match(/\/(\w[\w-]*)\.aspx$/i);
  const name = nameMatch ? nameMatch[1].toUpperCase() : 'UNKNOWN';
  
  // Find nearest image
  const imgPath = i < images.length ? images[i] : '';
  
  seriesList.push({
    name: name,
    url: 'https://www.graniser.com.tr' + url,
    thumbImage: imgPath ? 'https://www.graniser.com.tr' + imgPath : ''
  });
}

console.log('\nSeries list:');
seriesList.forEach((s, i) => console.log(`  ${i+1}. ${s.name} -> ${s.url}`));

// Save the series list
fs.writeFileSync(path.join(__dirname, 'graniser-series-list.json'), JSON.stringify(seriesList, null, 2), 'utf8');
console.log(`\nSaved ${seriesList.length} series to scratch/graniser-series-list.json`);
