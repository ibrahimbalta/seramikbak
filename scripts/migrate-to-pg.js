const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@libsql/client');
const { PrismaClient } = require('@prisma/client');

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined in your .env file.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL (PostgreSQL) must be defined in your .env file.");
  process.exit(1);
}

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient();

// Helper functions for type conversions
const toBool = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val;
  if (val === 1 || val === '1' || String(val).toLowerCase() === 'true') return true;
  return false;
};

const toDate = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const toNum = (val) => {
  if (val === null || val === undefined || val === '') return null;
  return Number(val);
};

const toInt = (val) => {
  if (val === null || val === undefined || val === '') return null;
  return parseInt(val, 10);
};

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function run() {
  console.log("🚀 Starting optimized database migration from Turso to PostgreSQL...");

  try {
    // 0. CLEAR TARGET TABLES
    console.log("🧹 Clearing target PostgreSQL database tables...");
    await prisma.dealerInventory.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.analyticsLog.deleteMany({});
    await prisma.adCampaign.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.saaSConfig.deleteMany({});
    await prisma.dealerSaaSConfig.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    await prisma.projectRequest.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.dealer.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    console.log("🧹 Target database cleared successfully.");

    // 1. BRAND
    console.log("📥 Migrating 'Brand' table...");
    const brands = (await libsql.execute("SELECT * FROM Brand")).rows;
    console.log(`Found ${brands.length} brands in Turso.`);
    if (brands.length > 0) {
      const data = brands.map(b => ({
        id: String(b.id),
        name: String(b.name),
        logoUrl: b.logoUrl ? String(b.logoUrl) : null,
        username: b.username ? String(b.username) : null,
        password: String(b.password),
        createdAt: toDate(b.createdAt) || new Date(),
        updatedAt: toDate(b.updatedAt) || new Date(),
      }));
      await prisma.brand.createMany({ data });
    }
    console.log("✅ 'Brand' table migrated.");

    // 2. PRODUCT
    console.log("📥 Migrating 'Product' table...");
    const products = (await libsql.execute("SELECT * FROM Product")).rows;
    console.log(`Found ${products.length} products in Turso.`);
    if (products.length > 0) {
      const data = products.map(p => ({
        id: String(p.id),
        name: String(p.name),
        code: String(p.code),
        brandId: String(p.brandId),
        width: toNum(p.width),
        height: toNum(p.height),
        color: String(p.color),
        finish: String(p.finish),
        style: String(p.style),
        area: String(p.area),
        imageUrl: String(p.imageUrl),
        textureUrl: p.textureUrl ? String(p.textureUrl) : null,
        isPremium: toBool(p.isPremium) || false,
        trendyolPrice: toNum(p.trendyolPrice),
        trendyolUrl: p.trendyolUrl ? String(p.trendyolUrl) : null,
        hepsiburadaPrice: toNum(p.hepsiburadaPrice),
        hepsiburadaUrl: p.hepsiburadaUrl ? String(p.hepsiburadaUrl) : null,
        n11Price: toNum(p.n11Price),
        n11Url: p.n11Url ? String(p.n11Url) : null,
        koctasPrice: toNum(p.koctasPrice),
        koctasUrl: p.koctasUrl ? String(p.koctasUrl) : null,
        bauhausPrice: toNum(p.bauhausPrice),
        bauhausUrl: p.bauhausUrl ? String(p.bauhausUrl) : null,
        peiRating: toInt(p.peiRating),
        slipResistance: p.slipResistance ? String(p.slipResistance) : null,
        frostResistance: toBool(p.frostResistance),
        thickness: toNum(p.thickness),
        rectified: toBool(p.rectified),
        createdAt: toDate(p.createdAt) || new Date(),
        updatedAt: toDate(p.updatedAt) || new Date(),
      }));
      const chunks = chunkArray(data, 500);
      let count = 0;
      for (const chunk of chunks) {
        await prisma.product.createMany({ data: chunk });
        count += chunk.length;
        console.log(`Progress: Migrated ${count}/${data.length} products...`);
      }
    }
    console.log("✅ 'Product' table migrated.");

    // 3. DEALER
    console.log("📥 Migrating 'Dealer' table...");
    const dealers = (await libsql.execute("SELECT * FROM Dealer")).rows;
    console.log(`Found ${dealers.length} dealers in Turso.`);
    if (dealers.length > 0) {
      const data = dealers.map(d => ({
        id: String(d.id),
        name: String(d.name),
        brandId: String(d.brandId),
        phone: String(d.phone),
        email: d.email ? String(d.email) : null,
        password: String(d.password),
        status: String(d.status),
        address: String(d.address),
        city: String(d.city),
        district: String(d.district),
        lat: toNum(d.lat),
        lng: toNum(d.lng),
        xmlFeedUrl: d.xmlFeedUrl ? String(d.xmlFeedUrl) : null,
        logoUrl: d.logoUrl ? String(d.logoUrl) : null,
        showroomImages: d.showroomImages ? String(d.showroomImages) : null,
        virtualTourUrl: d.virtualTourUrl ? String(d.virtualTourUrl) : null,
        specialConcepts: d.specialConcepts ? String(d.specialConcepts) : null,
        aboutText: d.aboutText ? String(d.aboutText) : null,
        logisticsServices: d.logisticsServices ? String(d.logisticsServices) : null,
        featuredProducts: d.featuredProducts ? String(d.featuredProducts) : null,
        dealerCampaigns: d.dealerCampaigns ? String(d.dealerCampaigns) : null,
        referenceProjects: d.referenceProjects ? String(d.referenceProjects) : null,
        dealerFaqs: d.dealerFaqs ? String(d.dealerFaqs) : null,
        createdAt: toDate(d.createdAt) || new Date(),
        updatedAt: toDate(d.updatedAt) || new Date(),
      }));
      await prisma.dealer.createMany({ data });
    }
    console.log("✅ 'Dealer' table migrated.");

    // 4. USER
    console.log("📥 Migrating 'User' table...");
    const users = (await libsql.execute("SELECT * FROM User")).rows;
    console.log(`Found ${users.length} users in Turso.`);
    if (users.length > 0) {
      const data = users.map(u => ({
        id: String(u.id),
        name: String(u.name),
        email: String(u.email),
        password: String(u.password),
        createdAt: toDate(u.createdAt) || new Date(),
        updatedAt: toDate(u.updatedAt) || new Date(),
      }));
      await prisma.user.createMany({ data });
    }
    console.log("✅ 'User' table migrated.");

    // 5. PROJECT REQUEST
    console.log("📥 Migrating 'ProjectRequest' table...");
    const projects = (await libsql.execute("SELECT * FROM ProjectRequest")).rows;
    console.log(`Found ${projects.length} project requests in Turso.`);
    if (projects.length > 0) {
      const data = projects.map(pr => ({
        id: String(pr.id),
        companyName: String(pr.companyName),
        contactName: String(pr.contactName),
        contactPhone: String(pr.contactPhone),
        contactEmail: String(pr.contactEmail),
        projectName: String(pr.projectName),
        projectType: String(pr.projectType),
        city: String(pr.city),
        district: String(pr.district),
        constructionStep: String(pr.constructionStep),
        quantityM2: toInt(pr.quantityM2),
        ceramicStyles: String(pr.ceramicStyles),
        ceramicSizes: String(pr.ceramicSizes),
        ceramicColors: pr.ceramicColors ? String(pr.ceramicColors) : null,
        ceramicFinishes: pr.ceramicFinishes ? String(pr.ceramicFinishes) : null,
        usageAreas: String(pr.usageAreas),
        budgetM2: String(pr.budgetM2),
        deliveryTimeline: String(pr.deliveryTimeline),
        notes: pr.notes ? String(pr.notes) : null,
        status: String(pr.status),
        createdAt: toDate(pr.createdAt) || new Date(),
        updatedAt: toDate(pr.updatedAt) || new Date(),
      }));
      await prisma.projectRequest.createMany({ data });
    }
    console.log("✅ 'ProjectRequest' table migrated.");

    // 6. SYSTEM SETTING
    console.log("📥 Migrating 'SystemSetting' table...");
    const settings = (await libsql.execute("SELECT * FROM SystemSetting")).rows;
    console.log(`Found ${settings.length} system settings in Turso.`);
    if (settings.length > 0) {
      const data = settings.map(s => ({
        id: String(s.id),
        key: String(s.key),
        value: String(s.value),
        createdAt: toDate(s.createdAt) || new Date(),
        updatedAt: toDate(s.updatedAt) || new Date(),
      }));
      await prisma.systemSetting.createMany({ data });
    }
    console.log("✅ 'SystemSetting' table migrated.");

    // 7. DEALER SAAS CONFIG
    console.log("📥 Migrating 'DealerSaaSConfig' table...");
    const dealerConfigs = (await libsql.execute("SELECT * FROM DealerSaaSConfig")).rows;
    console.log(`Found ${dealerConfigs.length} dealer SaaS configs in Turso.`);
    if (dealerConfigs.length > 0) {
      const data = dealerConfigs.map(dc => ({
        id: String(dc.id),
        dealerId: String(dc.dealerId),
        plan: String(dc.plan),
        status: String(dc.status),
        expiresAt: toDate(dc.expiresAt) || new Date(),
        pendingPlan: dc.pendingPlan ? String(dc.pendingPlan) : null,
        pendingStatus: dc.pendingStatus ? String(dc.pendingStatus) : null,
        paymentSender: dc.paymentSender ? String(dc.paymentSender) : null,
        paymentDate: dc.paymentDate ? String(dc.paymentDate) : null,
        paymentNote: dc.paymentNote ? String(dc.paymentNote) : null,
        createdAt: toDate(dc.createdAt) || new Date(),
        updatedAt: toDate(dc.updatedAt) || new Date(),
      }));
      await prisma.dealerSaaSConfig.createMany({ data });
    }
    console.log("✅ 'DealerSaaSConfig' table migrated.");

    // 8. SAAS CONFIG
    console.log("📥 Migrating 'SaaSConfig' table...");
    const brandConfigs = (await libsql.execute("SELECT * FROM SaaSConfig")).rows;
    console.log(`Found ${brandConfigs.length} brand SaaS configs in Turso.`);
    if (brandConfigs.length > 0) {
      const data = brandConfigs.map(bc => ({
        id: String(bc.id),
        brandId: String(bc.brandId),
        plan: String(bc.plan),
        status: String(bc.status),
        expiresAt: toDate(bc.expiresAt) || new Date(),
        pendingPlan: bc.pendingPlan ? String(bc.pendingPlan) : null,
        pendingStatus: bc.pendingStatus ? String(bc.pendingStatus) : null,
        paymentSender: bc.paymentSender ? String(bc.paymentSender) : null,
        paymentDate: bc.paymentDate ? String(bc.paymentDate) : null,
        paymentNote: bc.paymentNote ? String(bc.paymentNote) : null,
        createdAt: toDate(bc.createdAt) || new Date(),
        updatedAt: toDate(bc.updatedAt) || new Date(),
      }));
      await prisma.saaSConfig.createMany({ data });
    }
    console.log("✅ 'SaaSConfig' table migrated.");

    // 9. LEAD
    console.log("📥 Migrating 'Lead' table...");
    const leads = (await libsql.execute("SELECT * FROM Lead")).rows;
    console.log(`Found ${leads.length} leads in Turso.`);
    if (leads.length > 0) {
      const data = leads.map(l => ({
        id: String(l.id),
        productId: String(l.productId),
        dealerId: String(l.dealerId),
        clientName: String(l.clientName),
        clientPhone: String(l.clientPhone),
        clientEmail: String(l.clientEmail),
        notes: l.notes ? String(l.notes) : null,
        status: String(l.status),
        requestedUsta: toBool(l.requestedUsta) || false,
        requestedArchitect: toBool(l.requestedArchitect) || false,
        projectDimensions: l.projectDimensions ? String(l.projectDimensions) : null,
        projectPhotoUrl: l.projectPhotoUrl ? String(l.projectPhotoUrl) : null,
        createdAt: toDate(l.createdAt) || new Date(),
        updatedAt: toDate(l.updatedAt) || new Date(),
      }));
      await prisma.lead.createMany({ data });
    }
    console.log("✅ 'Lead' table migrated.");

    // 10. AD CAMPAIGN
    console.log("📥 Migrating 'AdCampaign' table...");
    const campaigns = (await libsql.execute("SELECT * FROM AdCampaign")).rows;
    console.log(`Found ${campaigns.length} campaigns in Turso.`);
    if (campaigns.length > 0) {
      const data = campaigns.map(c => ({
        id: String(c.id),
        brandId: String(c.brandId),
        productId: String(c.productId),
        bidAmount: toNum(c.bidAmount) || 0,
        status: String(c.status),
        budget: toNum(c.budget) || 0,
        clicks: toInt(c.clicks) || 0,
        impressions: toInt(c.impressions) || 0,
        durationDays: toInt(c.durationDays) || 7,
        paymentRef: c.paymentRef ? String(c.paymentRef) : null,
        price: toNum(c.price) || 0,
        expiresAt: toDate(c.expiresAt),
        createdAt: toDate(c.createdAt) || new Date(),
        updatedAt: toDate(c.updatedAt) || new Date(),
      }));
      await prisma.adCampaign.createMany({ data });
    }
    console.log("✅ 'AdCampaign' table migrated.");

    // 11. ANALYTICS LOG
    console.log("📥 Migrating 'AnalyticsLog' table...");
    const logs = (await libsql.execute("SELECT * FROM AnalyticsLog")).rows;
    console.log(`Found ${logs.length} analytics logs in Turso.`);
    if (logs.length > 0) {
      const data = logs.map(log => ({
        id: String(log.id),
        action: String(log.action),
        productId: log.productId ? String(log.productId) : null,
        brandId: log.brandId ? String(log.brandId) : null,
        query: log.query ? String(log.query) : null,
        city: log.city ? String(log.city) : null,
        createdAt: toDate(log.createdAt) || new Date(),
      }));
      const chunks = chunkArray(data, 500);
      let count = 0;
      for (const chunk of chunks) {
        await prisma.analyticsLog.createMany({ data: chunk });
        count += chunk.length;
        console.log(`Progress: Migrated ${count}/${data.length} logs...`);
      }
    }
    console.log("✅ 'AnalyticsLog' table migrated.");

    // 12. FAVORITE
    console.log("📥 Migrating 'Favorite' table...");
    const favorites = (await libsql.execute("SELECT * FROM Favorite")).rows;
    console.log(`Found ${favorites.length} favorites in Turso.`);
    if (favorites.length > 0) {
      const data = favorites.map(f => ({
        id: String(f.id),
        userId: String(f.userId),
        productId: String(f.productId),
        createdAt: toDate(f.createdAt) || new Date(),
      }));
      await prisma.favorite.createMany({ data });
    }
    console.log("✅ 'Favorite' table migrated.");

    // 13. DEALER INVENTORY
    console.log("📥 Migrating 'DealerInventory' table...");
    const inventories = (await libsql.execute("SELECT * FROM DealerInventory")).rows;
    console.log(`Found ${inventories.length} inventories in Turso.`);
    if (inventories.length > 0) {
      const data = inventories.map(i => ({
        id: String(i.id),
        dealerId: String(i.dealerId),
        productId: String(i.productId),
        stock: toNum(i.stock) || 0,
        price: toNum(i.price),
        status: String(i.status),
        createdAt: toDate(i.createdAt) || new Date(),
        updatedAt: toDate(i.updatedAt) || new Date(),
      }));
      const chunks = chunkArray(data, 500);
      let count = 0;
      for (const chunk of chunks) {
        await prisma.dealerInventory.createMany({ data: chunk });
        count += chunk.length;
        console.log(`Progress: Migrated ${count}/${data.length} inventories...`);
      }
    }
    console.log("✅ 'DealerInventory' table migrated.");

    console.log("🎉 Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    await prisma.$disconnect();
    libsql.close();
  }
}

run();
