const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = (match[2] || '').trim();
  });
}

// Init Prisma Client
let prisma;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  prisma = new PrismaClient();
}

async function main() {
  const dealer = await prisma.dealer.findFirst();
  if (!dealer) {
    console.error('No dealer found in DB!');
    return;
  }
  console.log(`Using Dealer ID: ${dealer.id} (${dealer.name})`);

  // Direct webhook trigger logic (simulate POST request to URL)
  // Let's call the URL of local dev server (port 3005)
  const url = 'http://localhost:3005/api/webhooks/stripe';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'checkout.session.completed',
        dealerId: dealer.id,
        plan: 'STANDART',
        durationMonths: 12
      })
    });
    
    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

main().catch(console.error).finally(() => process.exit(0));
