const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ege-collection.html'), 'utf8');

console.log('--- Checking for Tables in Ege Collection ---');

// Find all table content
const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
let match;
let tableIdx = 0;
while ((match = tableRegex.exec(html)) !== null) {
  console.log(`\nTable ${tableIdx + 1} (Length: ${match[1].length}):`);
  console.log(match[1].substring(0, 1500)); // print first 1500 chars of table content
  tableIdx++;
}

// Find tabs or other sections containing product faces / images
console.log('\n--- Checking for tabs or dynamic grids ---');
// Let's print out all divs that have id containing "tab" or class containing "tab"
const divRegex = /<div[^>]+(id|class)="[^"]*tab[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
let divIdx = 0;
while ((match = divRegex.exec(html)) !== null && divIdx < 5) {
  console.log(`\nDiv ${divIdx + 1} with tab-class/id (Length: ${match[2].length}):`);
  console.log(match[2].substring(0, 1000));
  divIdx++;
}

// Check for images with specific structures (like products, uploads, files, etc.)
console.log('\n--- Checking for uploads images in collection page ---');
const imgRegex = /src="([^"]*application\/files[^"]*)"/gi;
const filesImgs = [];
while ((match = imgRegex.exec(html)) !== null) {
  filesImgs.push(match[1]);
}
console.log(`Found ${filesImgs.length} images containing application/files:`);
console.log(filesImgs);
