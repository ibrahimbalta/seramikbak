const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'bien-output.html'), 'utf8');

console.log('--- Analyzing HTML Blocks Around Images ---');

// Let's find images containing 'bienseramik.b-cdn.net' or 'uploads/'
// and print the surrounding HTML content to see the card structure.
const regex = /(<div[^>]*class="[^"]*col[^"]*"[^>]*>[\s\S]*?<img[^>]+src="https:\/\/bienseramik\.b-cdn\.net[^"]+"[\s\S]*?<\/div>)/gi;

let match;
let count = 0;
while ((match = regex.exec(html)) !== null && count < 5) {
  console.log(`\n--- Block ${count + 1} ---`);
  console.log(match[1].substring(0, 1000)); // Print first 1000 chars of block
  count++;
}

// Let's also look for simple patterns around the image, e.g. parent link or text
console.log('\n--- Searching for simpler tags containing image and title ---');
// Let's search for an img and look 300 characters forward and backward
const imgUrlRegex = /src="(https:\/\/bienseramik\.b-cdn\.net\/uploads\/[^"]+)"/gi;
let imgMatch;
let imgCount = 0;
while ((imgMatch = imgUrlRegex.exec(html)) !== null && imgCount < 5) {
  const url = imgMatch[1];
  const index = imgMatch.index;
  // Get 300 chars before and 300 chars after
  const start = Math.max(0, index - 400);
  const end = Math.min(html.length, index + 500);
  console.log(`\n--- Image Match ${imgCount + 1} (URL: ${url}) ---`);
  console.log(html.substring(start, end));
  imgCount++;
}
