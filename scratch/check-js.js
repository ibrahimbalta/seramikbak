async function checkJs() {
  const url = 'https://ngkutahyaseramik.com.tr/assets/js/kutahya.js?v=011';
  console.log('Fetching', url);
  const response = await fetch(url);
  const text = await response.text();
  console.log('Length:', text.length);

  // Search for keywords
  const keywords = ['upload', 'product', 'image', 'png', 'jpg', 'jpeg', 'assets/img', 'doku', 'texture', 'src='];
  keywords.forEach(keyword => {
    let count = 0;
    let pos = text.indexOf(keyword);
    while (pos !== -1) {
      count++;
      pos = text.indexOf(keyword, pos + 1);
    }
    console.log(`Keyword '${keyword}': found ${count} times`);
  });

  // Print occurrences of upload/jpg/png with surrounding context
  console.log('--- Matches for uploads/image/jpg/png ---');
  const regex = /.{0,50}(upload|jpg|png|image|doku).{0,50}/gi;
  let match;
  let matchesCount = 0;
  while ((match = regex.exec(text)) !== null && matchesCount < 20) {
    console.log(match[0].replace(/\n/g, ' '));
    matchesCount++;
  }
}

checkJs().catch(console.error);
