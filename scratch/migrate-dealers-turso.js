const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = (match[2] || '').trim();
  });
}

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env!');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('Connecting to Turso to run DDL migrations for Dealer table...');

  const columns = [
    { name: 'logoUrl', type: 'TEXT' },
    { name: 'showroomImages', type: 'TEXT' },
    { name: 'virtualTourUrl', type: 'TEXT' },
    { name: 'specialConcepts', type: 'TEXT' }
  ];

  for (const col of columns) {
    try {
      console.log(`Adding ${col.name} to Dealer...`);
      await client.execute(`ALTER TABLE Dealer ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Successfully added ${col.name} to Dealer.`);
    } catch (err) {
      console.log(`Dealer ${col.name} error: ` + err.message);
    }
  }

  console.log('Migrations completed.');
}

main().catch(console.error).finally(() => process.exit(0));
