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
  
  // Test query parameter contains search logic exactly like Prisma does:
  // where: { OR: [ { name: { contains: 'Calacatta Gold' } } ] }
  // which translates to: name LIKE '%Calacatta Gold%'
  const testQueries = ['Calacatta Gold', 'Travertino classico', 'DuraTiles MYSTIQUE Multi Color'];
  
  for (const q of testQueries) {
    const res = await client.execute({
      sql: "SELECT id, name, code, brandId FROM Product WHERE name LIKE ? OR code LIKE ? OR style LIKE ? OR color LIKE ?",
      args: [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
    });
    console.log(`Search result count for "${q}":`, res.rows.length);
    if (res.rows.length > 0) {
      console.log(`First match:`, res.rows[0]);
    }
  }
}

main().catch(console.error);
