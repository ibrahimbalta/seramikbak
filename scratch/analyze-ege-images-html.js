const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ege-collection.html'), 'utf8');

console.log('--- Analyzing Surrounding HTML for Adriatic Product Images ---');

// Search for ADR14 or ADR15 in HTML and print its surroundings
const keywords = ['ADR14', 'ADR15', 'ADRIATIC1', 'ADRIATIC2'];

keywords.forEach(keyword => {
  console.log(`\n================ Keyword: ${keyword} ================`);
  const index = html.indexOf(keyword);
  if (index !== -1) {
    const start = Math.max(0, index - 400);
    const end = Math.min(html.length, index + 600);
    console.log(html.substring(start, end));
  } else {
    console.log('Not found!');
  }
});
