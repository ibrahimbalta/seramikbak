const { Queue, Worker, QueueEvents } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { normalizeDimensions, normalizeFinish, normalizeColor } = require('./feedParser');

const prisma = new PrismaClient();

// Redis connection configurations
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined
};

// Toggle to use mock in-memory queue if Redis server is offline
let useMockQueue = false;

// 1. Queue initialization
let productQueue;
try {
  productQueue = new Queue('product-ingestion', { 
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3, // retry 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 5000 // start retry delay at 5s, then 10s, then 20s
      },
      removeOnComplete: true, // clear successfully processed jobs from Redis memory
      removeOnFail: 100 // retain last 100 failed logs for diagnostics
    }
  });
  console.log('[Queue Worker] BullMQ Queue initialized (connecting to Redis)...');
} catch (e) {
  console.warn('[Queue Worker] Redis connection failed. Enabling client-side Mock Queue fallback.');
  useMockQueue = true;
}

// Mock Queue Implementation for offline test support
const mockJobsList = [];
const mockQueueProducer = {
  add: async (name, data) => {
    const job = { id: `mock-job-${Math.random().toString(36).substring(5)}`, name, data, attempts: 0 };
    mockJobsList.push(job);
    // Trigger async mock consumer
    setTimeout(() => processMockJob(job), 100);
    return job;
  }
};

// 2. Queue Producer Helper
async function enqueueProductIngestion(productData) {
  if (useMockQueue) {
    return await mockQueueProducer.add('ingest-item', productData);
  }
  
  try {
    const job = await productQueue.add('ingest-item', productData);
    console.log(`[Queue Producer] Enqueued job: ${job.id} for Product SKU: ${productData.code}`);
    return job;
  } catch (err) {
    console.warn(`[Queue Producer] Redis push failed. Falling back to Mock Queue: ${err.message}`);
    useMockQueue = true;
    return await mockQueueProducer.add('ingest-item', productData);
  }
}

// 3. Queue Consumer / Worker
let productWorker;
if (!useMockQueue) {
  try {
    productWorker = new Worker('product-ingestion', async (job) => {
      const product = job.data;
      console.log(`[Queue Worker] Processing Job ${job.id} - SKU: ${product.code}`);
      
      // Execute normalization pipeline
      const normalized = normalizeAndValidateProduct(product);
      
      // Upsert to database
      await prisma.product.upsert({
        where: { code: normalized.code },
        update: normalized,
        create: normalized
      });
      
      return { success: true, sku: normalized.code };
    }, { connection: redisConnection });

    // Listeners for monitoring
    productWorker.on('completed', (job, result) => {
      console.log(`[Queue Worker] Job ${job.id} completed successfully. Sku: ${result.sku}`);
    });

    productWorker.on('failed', (job, err) => {
      console.error(`[Queue Worker] Job ${job.id} failed: ${err.message}. Retrying via backoff policy...`);
    });
  } catch (e) {
    useMockQueue = true;
  }
}

// 4. Mock Consumer logic
async function processMockJob(job) {
  const product = job.data;
  console.log(`[Mock Queue Worker] Processing Mock Job ${job.id} - SKU: ${product.code}`);
  
  try {
    const normalized = normalizeAndValidateProduct(product);
    
    // Attempt database upsert
    await prisma.product.upsert({
      where: { code: normalized.code },
      update: normalized,
      create: normalized
    });
    
    console.log(`[Mock Queue Worker] Mock Job ${job.id} completed successfully. Sku: ${normalized.code}`);
  } catch (err) {
    console.error(`[Mock Queue Worker] Mock Job ${job.id} failed: ${err.message}`);
    // Simulated retry policy
    if (job.attempts < 2) {
      job.attempts++;
      console.log(`[Mock Queue Worker] Re-queueing job ${job.id} (Attempt ${job.attempts + 1})...`);
      setTimeout(() => processMockJob(job), 3000);
    } else {
      console.error(`[Mock Queue Worker] Job ${job.id} failed permanently after 3 attempts.`);
    }
  }
}

// 5. Ingestion normalization helper
function normalizeAndValidateProduct(rawProd) {
  const { width, height } = normalizeDimensions(rawProd.dimensions || rawProd.size);
  const finish = normalizeFinish(rawProd.finish || rawProd.surface);
  const color = normalizeColor(rawProd.color);

  return {
    name: rawProd.name || 'İsimsiz Ürün',
    code: rawProd.code,
    brandId: rawProd.brandId,
    width,
    height,
    color,
    finish,
    style: rawProd.style || 'Beton',
    area: rawProd.area || 'Banyo,Mutfak',
    imageUrl: rawProd.imageUrl || '/textures/vista_bej.jpg',
    textureUrl: rawProd.textureUrl || '/textures/vista_bej.jpg',
    isPremium: false
  };
}

module.exports = {
  enqueueProductIngestion,
  redisConnection
};
