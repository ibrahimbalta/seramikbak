const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-output.html'), 'utf8');

console.log('--- Analyzing Yurtbay Seramik defaultList Structure ---');

// Search for defaultList in HTML
const index = html.indexOf('defaultList');
if (index !== -1) {
  console.log('Found defaultList!');
  const start = Math.max(0, index - 200);
  const end = Math.min(html.length, index + 3000);
  console.log(html.substring(start, end));
} else {
  console.log('defaultList class not found in HTML!');
}

// Let's also search for filterSeriesList class
const indexFilterList = html.indexOf('filterSeriesList');
if (indexFilterList !== -1) {
  console.log('Found filterSeriesList!');
  const start = Math.max(0, indexFilterList - 200);
  const end = Math.min(html.length, indexFilterList + 1000);
  console.log(html.substring(start, end));
} else {
  console.log('filterSeriesList not found!');
}
