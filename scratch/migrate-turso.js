const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Manually parse .env file if it exists
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.error('Error reading .env file:', e);
}

async function run() {
  const url = process.env.TURSO_DATABASE_URL || 'libsql://seramikbak-ibrahimbalta.aws-eu-west-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    console.error('Error: TURSO_AUTH_TOKEN is missing in env!');
    return;
  }

  console.log(`Connecting to Turso database: ${url}`);
  const client = createClient({ url, authToken });

  const columnsToAdd = [
    { name: 'aboutText', type: 'TEXT' },
    { name: 'logisticsServices', type: 'TEXT' },
    { name: 'featuredProducts', type: 'TEXT' },
    { name: 'dealerCampaigns', type: 'TEXT' },
    { name: 'referenceProjects', type: 'TEXT' },
    { name: 'dealerFaqs', type: 'TEXT' }
  ];

  for (const col of columnsToAdd) {
    try {
      console.log(`Adding column ${col.name}...`);
      await client.execute(`ALTER TABLE Dealer ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✓ Column ${col.name} added successfully.`);
    } catch (err) {
      if (err.message && (err.message.includes('duplicate column name') || err.message.includes('already exists'))) {
        console.log(`⚠ Column ${col.name} already exists.`);
      } else {
        console.error(`✕ Failed to add column ${col.name}:`, err.message || err);
      }
    }
  }

  console.log('Migration complete.');
  client.close();
}

run().catch(console.error);
