const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'usak-series-ada.html'), 'utf8');

const idx = html.indexOf('Ada Bone');
if (idx !== -1) {
  console.log('--- HTML around "Ada Bone" ---');
  console.log(html.slice(idx - 300, idx + 600));
} else {
  console.log('"Ada Bone" not found in HTML!');
}

const idx2 = html.indexOf('Ada Kahve');
if (idx2 !== -1) {
  console.log('\n--- HTML around "Ada Kahve" ---');
  console.log(html.slice(idx2 - 300, idx2 + 600));
} else {
  console.log('"Ada Kahve" not found in HTML!');
}
