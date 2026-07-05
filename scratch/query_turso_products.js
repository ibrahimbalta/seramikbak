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
  
  const searchNames = ['Travertino Classico', 'Calacatta Gold', 'Concrete Light Grey', 'Natural Oak', 'Borneo Antrasit'];
  
  for (const name of searchNames) {
    const res = await client.execute({
      sql: "SELECT id, name, code FROM Product WHERE name LIKE ? LIMIT 3",
      args: [`%${name}%`]
    });
    console.log(`Query for "${name}":`, res.rows);
  }
}

main().catch(console.error);
