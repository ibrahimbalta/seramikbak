const fs = require('fs');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 1. DIMENSION NORMALIZATION ALGORITHM
 * Parses dimensions (e.g., "60x120 cm", "600x1200 mm", "20 * 120") into width/height in cm.
 * Sorts them so that width <= height (e.g. 60x120, not 120x60) for standardization.
 */
function normalizeDimensions(rawDim) {
  if (!rawDim) return { width: 60, height: 60 }; // Default fallback

  const cleanStr = rawDim.replace(/\s+/g, '').toLowerCase(); // Strip whitespaces
  const regex = /(\d+)(?:x|\*|-)(\d+)(cm|mm)?/;
  const match = cleanStr.match(regex);

  if (!match) return { width: 60, height: 60 };

  let width = parseInt(match[1], 10);
  let height = parseInt(match[2], 10);
  const unit = match[3] || 'cm'; // default unit is cm

  // If dimensions are in millimeters, divide by 10
  if (unit === 'mm' || width > 250 || height > 250) {
    width = Math.round(width / 10);
    height = Math.round(height / 10);
  }

  // Sort dimensions: smaller value first (width <= height)
  const sorted = [width, height].sort((a, b) => a - b);
  
  return {
    width: sorted[0],
    height: sorted[1]
  };
}

/**
 * 2. SURFACE FINISH SANITIZATION
 * Maps raw finish text into Mat, Parlak, or Lapatto.
 */
function normalizeFinish(rawFinish) {
  if (!rawFinish) return 'Mat';
  
  const f = rawFinish.trim().toLowerCase();
  
  if (f.includes('parlak') || f.includes('glossy') || f.includes('polished')) {
    return 'Parlak';
  }
  if (f.includes('lapatto') || f.includes('lappato') || f.includes('semi')) {
    return 'Lapatto';
  }
  
  return 'Mat'; // default fallback
}

/**
 * 3. COLOR CLASSIFIER
 * Maps raw colors to standard colors.
 */
function normalizeColor(rawColor) {
  if (!rawColor) return 'Gri';
  
  const c = rawColor.trim().toLowerCase();
  
  if (c.includes('antrasit') || c.includes('fume') || c.includes('füme') || c.includes('charcoal') || c.includes('siyah')) {
    return 'Antrasit';
  }
  if (c.includes('beyaz') || c.includes('white') || c.includes('calacatta') || c.includes('kar')) {
    return 'Beyaz';
  }
  if (c.includes('bej') || c.includes('beige') || c.includes('vista') || c.includes('krem')) {
    return 'Bej';
  }
  if (c.includes('kahve') || c.includes('brown') || c.includes('ahsap') || c.includes('ahşap') || c.includes('ceviz')) {
    return 'Kahverengi';
  }
  
  return 'Gri'; // default fallback
}

/**
 * 4. STREAM FEED PARSER (Asynchronous & Non-blocking)
 * Reads a massive file line-by-line (e.g. JSON Lines or XML elements),
 * normalizes parameters, and performs batch database upserts.
 */
async function processProductFeedStream(filePath, brandId) {
  console.log(`[Feed Parser] Starting feed parse stream: ${filePath}...`);
  const startTime = Date.now();

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batchBuffer = [];
  const BATCH_SIZE = 100;
  let totalProcessed = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      // Assuming feed is formatted as JSON Lines (one product JSON per line)
      const rawProduct = JSON.parse(line);

      // Apply Normalization layer
      const { width, height } = normalizeDimensions(rawProduct.dimensions || rawProduct.size);
      const finish = normalizeFinish(rawProduct.finish || rawProduct.surface);
      const color = normalizeColor(rawProduct.color);
      
      const cleanProduct = {
        name: rawProduct.name,
        code: rawProduct.code || `FEED-${Math.random().toString(36).substring(7).toUpperCase()}`,
        brandId: brandId,
        width: width,
        height: height,
        color: color,
        finish: finish,
        style: rawProduct.style || 'Beton',
        area: rawProduct.area || 'Banyo,Mutfak',
        imageUrl: rawProduct.imageUrl || '/textures/vista_bej.jpg',
        textureUrl: rawProduct.textureUrl || '/textures/vista_bej.jpg',
        isPremium: false
      };

      batchBuffer.push(cleanProduct);

      // Process batch upsert
      if (batchBuffer.length >= BATCH_SIZE) {
        await executeBatchUpsert(batchBuffer);
        totalProcessed += batchBuffer.length;
        console.log(`[Feed Parser] Upserted batch: ${totalProcessed} products synced...`);
        batchBuffer = []; // reset buffer
      }

    } catch (parseErr) {
      console.error(`[Feed Parser] Error parsing feed line: ${parseErr.message}`);
    }
  }

  // Handle remaining items in buffer
  if (batchBuffer.length > 0) {
    await executeBatchUpsert(batchBuffer);
    totalProcessed += batchBuffer.length;
    console.log(`[Feed Parser] Upserted final batch: ${totalProcessed} products synced...`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Feed Parser] Completed stream synchronization in ${duration}s. Total synced: ${totalProcessed} products.`);
}

/**
 * 5. BATCH TRANSACTIONAL UPSERT
 * Executes batch upserts inside a database transaction to prevent round-trip locking.
 */
async function executeBatchUpsert(productsList) {
  // We use Prisma Transaction to ensure all operations run efficiently
  const operations = productsList.map(prod => {
    return prisma.product.upsert({
      where: { code: prod.code },
      update: {
        name: prod.name,
        width: prod.width,
        height: prod.height,
        color: prod.color,
        finish: prod.finish,
        style: prod.style,
        area: prod.area,
        imageUrl: prod.imageUrl,
        textureUrl: prod.textureUrl
      },
      create: prod
    });
  });

  try {
    await prisma.$transaction(operations);
  } catch (dbErr) {
    console.error(`[Feed Parser] Database batch transaction failed: ${dbErr.message}`);
    // If batch transaction fails, fall back to individual upserts so one faulty line doesn't block the rest
    for (const prod of productsList) {
      try {
        await prisma.product.upsert({
          where: { code: prod.code },
          update: prod,
          create: prod
        });
      } catch (err) {
        console.error(`[Feed Parser] Single upsert fallback failed for Sku ${prod.code}: ${err.message}`);
      }
    }
  }
}

// Module Exports for Integration
module.exports = {
  processProductFeedStream,
  normalizeDimensions,
  normalizeFinish,
  normalizeColor
};
