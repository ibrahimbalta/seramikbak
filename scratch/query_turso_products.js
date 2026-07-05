const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Read and parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const cleanLine = line.trim();
  if (cleanLine && !cleanLine.startsWith('#')) {
    const idx = cleanLine.indexOf('=');
    if (idx !== -1) {
      const key = cleanLine.substring(0, idx).trim();
      const val = cleanLine.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

async function main() {
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN
  });
  
  const seedNames = [
    'Calacatta Gold',
    'Borneo Antrasit',
    'Travertino Classico',
    'Natural Oak',
    'Concrete Light Grey',
    'Verona Grey',
    'Vintage Wood',
    'Marmara Beyazı',
    'Royal Grey',
    'Sand Travertine',
    'Antik Mermer'
  ];
  
  console.log("Checking seeded products existence in Turso:");
  for (const name of seedNames) {
    const res = await client.execute({
      sql: "SELECT name, code FROM Product WHERE name = ? OR name LIKE ? LIMIT 1",
      args: [name, `%${name}%`]
    });
    if (res.rows.length > 0) {
      console.log(`✅ [FOUND] "${name}" matches "${res.rows[0].name}" (code: ${res.rows[0].code})`);
    } else {
      console.log(`❌ [NOT FOUND] "${name}"`);
    }
  }
}

main().catch(console.error);
