const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ege-output.html'), 'utf8');

console.log('--- All Links in Ege Seramik Products Page ---');

const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = linkRegex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2].replace(/<[^>]*>/g, '').trim();
  links.push({ href, text });
}

console.log(`Found total ${links.length} links. Listing all of them:`);
links.forEach((l, idx) => {
  console.log(`${idx + 1}: [${l.text}] -> ${l.href}`);
});
