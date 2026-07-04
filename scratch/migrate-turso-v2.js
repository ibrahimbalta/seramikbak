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
  console.log('Connecting to Turso for V2 migrations...');

  // 1. Add payment columns to DealerSaaSConfig
  const dealerColumns = ['paymentSender', 'paymentDate', 'paymentNote'];
  for (const col of dealerColumns) {
    try {
      console.log(`Adding ${col} to DealerSaaSConfig...`);
      await client.execute(`ALTER TABLE DealerSaaSConfig ADD COLUMN ${col} TEXT;`);
      console.log(`Successfully added ${col} to DealerSaaSConfig.`);
    } catch (err) {
      console.log(`DealerSaaSConfig ${col}: ${err.message}`);
    }
  }

  // 2. Add payment columns to SaaSConfig
  const saasColumns = ['paymentSender', 'paymentDate', 'paymentNote'];
  for (const col of saasColumns) {
    try {
      console.log(`Adding ${col} to SaaSConfig...`);
      await client.execute(`ALTER TABLE SaaSConfig ADD COLUMN ${col} TEXT;`);
      console.log(`Successfully added ${col} to SaaSConfig.`);
    } catch (err) {
      console.log(`SaaSConfig ${col}: ${err.message}`);
    }
  }

  // 3. Create SystemSetting table
  try {
    console.log('Creating SystemSetting table...');
    await client.execute(`
      CREATE TABLE SystemSetting (
        id TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Successfully created SystemSetting table.');
  } catch (err) {
    console.log('SystemSetting table creation: ' + err.message);
  }

  // 4. Seed default Bank settings if they don't exist
  const defaultSettings = [
    { key: 'bank_name', value: 'Akbank' },
    { key: 'bank_recipient', value: 'SeramikBak Yazılım A.Ş.' },
    { key: 'bank_iban', value: 'TR98 0004 6001 5000 1234 5678 90' }
  ];

  for (const setting of defaultSettings) {
    try {
      console.log(`Seeding ${setting.key}...`);
      await client.execute({
        sql: `INSERT OR IGNORE INTO SystemSetting (id, "key", value, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [require('crypto').randomUUID(), setting.key, setting.value]
      });
      console.log(`Seeded/verified ${setting.key}.`);
    } catch (err) {
      console.log(`Failed to seed ${setting.key}: ${err.message}`);
    }
  }

  console.log('V2 migrations completed.');
}

main().catch(console.error).finally(() => process.exit(0));
