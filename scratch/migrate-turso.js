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
  console.log('Connecting to Turso to run DDL migrations...');

  try {
    console.log('Adding pendingPlan to DealerSaaSConfig...');
    await client.execute('ALTER TABLE DealerSaaSConfig ADD COLUMN pendingPlan TEXT;');
    console.log('Successfully added pendingPlan to DealerSaaSConfig.');
  } catch (err) {
    console.log('DealerSaaSConfig pendingPlan: ' + err.message);
  }

  try {
    console.log('Adding pendingStatus to DealerSaaSConfig...');
    await client.execute('ALTER TABLE DealerSaaSConfig ADD COLUMN pendingStatus TEXT;');
    console.log('Successfully added pendingStatus to DealerSaaSConfig.');
  } catch (err) {
    console.log('DealerSaaSConfig pendingStatus: ' + err.message);
  }

  try {
    console.log('Adding pendingPlan to SaaSConfig...');
    await client.execute('ALTER TABLE SaaSConfig ADD COLUMN pendingPlan TEXT;');
    console.log('Successfully added pendingPlan to SaaSConfig.');
  } catch (err) {
    console.log('SaaSConfig pendingPlan: ' + err.message);
  }

  try {
    console.log('Adding pendingStatus to SaaSConfig...');
    await client.execute('ALTER TABLE SaaSConfig ADD COLUMN pendingStatus TEXT;');
    console.log('Successfully added pendingStatus to SaaSConfig.');
  } catch (err) {
    console.log('SaaSConfig pendingStatus: ' + err.message);
  }

  console.log('Migrations completed.');
}

main().catch(console.error).finally(() => process.exit(0));
