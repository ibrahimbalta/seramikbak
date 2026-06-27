const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'bien-output.html'), 'utf8');

// Advanced regex to parse Bien Seramik product structure
const regex = /<div[^>]+class="[^"]*prd-col[^"]*"[^>]*data-collection="([^"]*)"[^>]*data-doku="([^"]*)"[^>]*data-package="([^"]*)"[^>]*data-product_type="([^"]*)"[^>]*data-feature="([^"]*)"[\s\S]*?<a[^>]+href="([^"]+)"[^>]*><h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?<img[^>]+src="([^"]+)"/gi;

let match;
const products = [];
const seenCodes = new Set();

while ((match = regex.exec(html)) !== null) {
  const collection = match[1].trim();
  const doku = match[2].trim();
  const size = match[3].trim();
  const type = match[4].trim();
  const feature = match[5].trim();
  const href = match[6].trim();
  const name = match[7].replace(/<[^>]*>/g, '').trim();
  const imgUrl = match[8].trim();

  // Extract code from image URL if it looks like a code (e.g. W168ZDRAD30X0XMAAW10.png)
  // Else generate one from collection, size and type
  const imgFilename = imgUrl.split('/').pop().split('?')[0].split('.')[0];
  let code = imgFilename.toUpperCase();
  
  // Clean special characters from code
  code = code.replace(/[^A-Z0-9-]/gi, '');

  if (code.length < 8 || code.includes('FACE') || code.includes('YENI') || code.includes('IMAGE') || code.includes('LOGO')) {
    // Generate clean code
    const cleanColl = collection.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const cleanSize = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanFeat = feature.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    code = `BIEN-${cleanColl}-${cleanSize}-${cleanFeat}`;
  }

  // Avoid duplicate codes
  let uniqueCode = code;
  let counter = 1;
  while (seenCodes.has(uniqueCode)) {
    uniqueCode = `${code}-${counter}`;
    counter++;
  }
  seenCodes.add(uniqueCode);

  products.push({
    collection,
    doku,
    size,
    type,
    feature,
    href,
    name,
    imgUrl,
    code: uniqueCode
  });
}

console.log(`Successfully parsed ${products.length} Bien Seramik products.`);
if (products.length > 0) {
  console.log('First 5 parsed products:', JSON.stringify(products.slice(0, 5), null, 2));
}
