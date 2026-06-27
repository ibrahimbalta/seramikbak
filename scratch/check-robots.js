async function main() {
  const url = 'https://www.guralseramik.com/robots.txt';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('Robots.txt contents:\n', text);
  } catch (err) {
    console.error('Error fetching robots.txt:', err.message);
  }
}
main();
