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

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log('Connecting to Turso database:', url);
  const client = createClient({ url, authToken });

  try {
    // 1. Get info on Lead table columns
    const columnsResult = await client.execute('PRAGMA table_info("Lead");');
    const columns = columnsResult.rows.map(row => row.name);
    console.log('Current columns in Lead table:', columns);

    const requiredColumns = [
      { name: 'requestedUsta', type: 'INTEGER DEFAULT 0' },
      { name: 'requestedArchitect', type: 'INTEGER DEFAULT 0' },
      { name: 'projectDimensions', type: 'TEXT' },
      { name: 'projectPhotoUrl', type: 'TEXT' }
    ];

    let modified = false;
    for (const col of requiredColumns) {
      if (!columns.includes(col.name)) {
        console.log(`Column "${col.name}" is missing. Adding it...`);
        await client.execute(`ALTER TABLE "Lead" ADD COLUMN "${col.name}" ${col.type};`);
        console.log(`Column "${col.name}" added successfully.`);
        modified = true;
      } else {
        console.log(`Column "${col.name}" already exists.`);
      }
    }

    if (modified) {
      const newColumnsResult = await client.execute('PRAGMA table_info("Lead");');
      console.log('New columns in Lead table:', newColumnsResult.rows.map(row => row.name));
    } else {
      console.log('No database migrations were needed.');
    }

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.close();
  }
}

main();
