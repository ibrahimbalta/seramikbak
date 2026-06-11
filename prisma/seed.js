const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

let prisma;

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log('Clearing existing database...');
  await prisma.lead.deleteMany();
  await prisma.analyticsLog.deleteMany();
  await prisma.adCampaign.deleteMany();
  await prisma.saaSConfig.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();

  console.log('Seeding brands...');
  const kutahya = await prisma.brand.create({
    data: { name: 'NG Kütahya Seramik', logoUrl: '/logos/kutahya.png', username: 'kutahya', password: 'kutahya123' }
  });
  const bien = await prisma.brand.create({
    data: { name: 'Bien Seramik', logoUrl: '/logos/bien.png', username: 'bien', password: 'bien123' }
  });
  const ege = await prisma.brand.create({
    data: { name: 'Ege Seramik', logoUrl: '/logos/ege.png', username: 'ege', password: 'ege123' }
  });
  const gural = await prisma.brand.create({
    data: { name: 'Güral Seramik', logoUrl: '/logos/gural.png', username: 'gural', password: 'gural123' }
  });
  const vitra = await prisma.brand.create({
    data: { name: 'VitrA', logoUrl: '/logos/vitra.png', username: 'vitra', password: 'vitra123' }
  });
  const qua = await prisma.brand.create({
    data: { name: 'Qua Granite', logoUrl: '/logos/qua.png', username: 'qua', password: 'qua123' }
  });
  const yurtbay = await prisma.brand.create({
    data: { name: 'Yurtbay Seramik', logoUrl: '/logos/yurtbay.png', username: 'yurtbay', password: 'yurtbay123' }
  });
  const canakkale = await prisma.brand.create({
    data: { name: 'Çanakkale Seramik', logoUrl: '/logos/canakkale.png', username: 'canakkale', password: 'canakkale123' }
  });
  const kalebodur = await prisma.brand.create({
    data: { name: 'Kalebodur', logoUrl: '/logos/kalebodur.png', username: 'kalebodur', password: 'kalebodur123' }
  });
  const termal = await prisma.brand.create({
    data: { name: 'Termal Seramik', logoUrl: '/logos/termal.png', username: 'termal', password: 'termal123' }
  });
  const usak = await prisma.brand.create({
    data: { name: 'Uşak Seramik', logoUrl: '/logos/usak.png', username: 'usak', password: 'usak123' }
  });

  console.log('Seeding products...');
  // 1. Calacatta Gold
  const prod1 = await prisma.product.create({
    data: {
      name: 'Calacatta Gold',
      code: 'KUT-CAL-GLD',
      brandId: kutahya.id,
      width: 60,
      height: 120,
      color: 'Beyaz',
      finish: 'Mat',
      style: 'Mermer',
      area: 'Banyo,Mutfak,Salon',
      imageUrl: '/textures/calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      isPremium: true,
      peiRating: 4,
      slipResistance: 'R9',
      frostResistance: true,
      thickness: 9.5,
      rectified: true
    }
  });

  // 2. Borneo Antrasit
  const prod2 = await prisma.product.create({
    data: {
      name: 'Borneo Antrasit',
      code: 'BIEN-BOR-ANT',
      brandId: bien.id,
      width: 60,
      height: 120,
      color: 'Antrasit',
      finish: 'Mat',
      style: 'Mermer',
      area: 'Banyo,Salon',
      imageUrl: '/textures/borneo_antrasit.jpg',
      textureUrl: '/textures/borneo_antrasit.jpg',
      isPremium: true,
      peiRating: 3,
      slipResistance: 'R10',
      frostResistance: true,
      thickness: 10.0,
      rectified: true
    }
  });

  // 3. Travertino Classico
  const prod3 = await prisma.product.create({
    data: {
      name: 'Travertino Classico',
      code: 'EGE-TRA-CLA',
      brandId: ege.id,
      width: 60,
      height: 120,
      color: 'Bej',
      finish: 'Mat',
      style: 'Beton',
      area: 'Mutfak,Koridor,Salon',
      imageUrl: '/textures/travertino_classico.jpg',
      textureUrl: '/textures/travertino_classico.jpg',
      isPremium: true,
      peiRating: 4,
      slipResistance: 'R10',
      frostResistance: true,
      thickness: 9.5,
      rectified: true
    }
  });

  // 4. Natural Oak
  const prod4 = await prisma.product.create({
    data: {
      name: 'Natural Oak',
      code: 'BIEN-NAT-OAK',
      brandId: bien.id,
      width: 20,
      height: 120,
      color: 'Kahverengi',
      finish: 'Mat',
      style: 'Ahşap',
      area: 'Salon,Balkon,Yatak Odası',
      imageUrl: '/textures/natural_oak.jpg',
      textureUrl: '/textures/natural_oak.jpg',
      isPremium: true,
      peiRating: 4,
      slipResistance: 'R11',
      frostResistance: true,
      thickness: 9.0,
      rectified: false
    }
  });

  // 5. Concrete Light Grey
  const prod5 = await prisma.product.create({
    data: {
      name: 'Concrete Light Grey',
      code: 'VIT-CON-GRY',
      brandId: vitra.id,
      width: 60,
      height: 120,
      color: 'Gri',
      finish: 'Mat',
      style: 'Beton',
      area: 'Mutfak,Banyo,Koridor',
      imageUrl: '/textures/concrete_light_grey.jpg',
      textureUrl: '/textures/concrete_light_grey.jpg',
      isPremium: true,
      peiRating: 5,
      slipResistance: 'R10',
      frostResistance: true,
      thickness: 9.0,
      rectified: true
    }
  });

  // 6. Verona Grey (Qua Granite)
  const prod6 = await prisma.product.create({
    data: {
      name: 'Verona Grey',
      code: 'QUA-VER-GRY',
      brandId: qua.id,
      width: 60,
      height: 120,
      color: 'Gri',
      finish: 'Parlak',
      style: 'Mermer',
      area: 'Salon,Koridor,Mutfak',
      imageUrl: '/textures/loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      isPremium: false,
      peiRating: 3,
      slipResistance: 'R9',
      frostResistance: true,
      thickness: 9.5,
      rectified: true
    }
  });

  // 7. Vintage Wood (Yurtbay Seramik)
  const prod7 = await prisma.product.create({
    data: {
      name: 'Vintage Wood',
      code: 'YURT-VIN-WOD',
      brandId: yurtbay.id,
      width: 20,
      height: 120,
      color: 'Kahverengi',
      finish: 'Mat',
      style: 'Ahşap',
      area: 'Balkon,Salon,Koridor',
      imageUrl: '/textures/teak_ahsap.jpg',
      textureUrl: '/textures/teak_ahsap.jpg',
      isPremium: false,
      peiRating: 4,
      slipResistance: 'R11',
      frostResistance: true,
      thickness: 9.0,
      rectified: false
    }
  });

  // 8. Marmara Beyazı (Çanakkale Seramik)
  const prod8 = await prisma.product.create({
    data: {
      name: 'Marmara Beyazı',
      code: 'CNAK-MAR-WHT',
      brandId: canakkale.id,
      width: 60,
      height: 60,
      color: 'Beyaz',
      finish: 'Parlak',
      style: 'Mermer',
      area: 'Banyo,Mutfak',
      imageUrl: '/textures/calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      isPremium: false,
      peiRating: 3,
      slipResistance: 'R9',
      frostResistance: false,
      thickness: 8.5,
      rectified: true
    }
  });

  // 9. Royal Grey (Kalebodur)
  const prod9 = await prisma.product.create({
    data: {
      name: 'Royal Grey',
      code: 'KALE-ROY-GRY',
      brandId: kalebodur.id,
      width: 80,
      height: 80,
      color: 'Gri',
      finish: 'Mat',
      style: 'Beton',
      area: 'Mutfak,Banyo,Salon',
      imageUrl: '/textures/concrete_light_grey.jpg',
      textureUrl: '/textures/concrete_light_grey.jpg',
      isPremium: false,
      peiRating: 5,
      slipResistance: 'R10',
      frostResistance: true,
      thickness: 10.5,
      rectified: true
    }
  });

  // 10. Sand Travertine (Termal Seramik)
  const prod10 = await prisma.product.create({
    data: {
      name: 'Sand Travertine',
      code: 'TERM-SND-TRV',
      brandId: termal.id,
      width: 60,
      height: 120,
      color: 'Bej',
      finish: 'Lapatto',
      style: 'Taş',
      area: 'Balkon,Salon,Teras',
      imageUrl: '/textures/vista_bej.jpg',
      textureUrl: '/textures/vista_bej.jpg',
      isPremium: false,
      peiRating: 4,
      slipResistance: 'R10',
      frostResistance: true,
      thickness: 9.0,
      rectified: true
    }
  });

  // 11. Antik Mermer (Uşak Seramik)
  const prod11 = await prisma.product.create({
    data: {
      name: 'Antik Mermer',
      code: 'USAK-ANT-MRB',
      brandId: usak.id,
      width: 30,
      height: 60,
      color: 'Beyaz',
      finish: 'Mat',
      style: 'Mermer',
      area: 'Banyo,Koridor',
      imageUrl: '/textures/calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      isPremium: false,
      peiRating: 3,
      slipResistance: 'R9',
      frostResistance: false,
      thickness: 8.0,
      rectified: false
    }
  });

  console.log('Seeding dealers (locations around Istanbul)...');
  const dealersData = [
    // Kütahya Dealers
    { name: 'NG Kütahya Seramik Kadıköy Bayi', brandId: kutahya.id, phone: '0216 123 45 67', address: 'Bağdat Cad. No:45 Kadıköy', city: 'İstanbul', district: 'Kadıköy', lat: 40.9901, lng: 29.0278 },
    { name: 'NG Kütahya Seramik Beşiktaş Showroom', brandId: kutahya.id, phone: '0212 987 65 43', address: 'Barbaros Bulvarı No:12 Beşiktaş', city: 'İstanbul', district: 'Beşiktaş', lat: 41.0428, lng: 29.0075 },
    
    // Bien Dealers
    { name: 'Bien Seramik Ümraniye Yetkili Satıcı', brandId: bien.id, phone: '0216 333 44 55', address: 'Alemdağ Cad. No:190 Ümraniye', city: 'İstanbul', district: 'Ümraniye', lat: 41.0252, lng: 29.0963 },
    { name: 'Bien Seramik Şişli Concept Store', brandId: bien.id, phone: '0212 222 33 44', address: 'Büyükdere Cad. No:88 Şişli', city: 'İstanbul', district: 'Şişli', lat: 41.0602, lng: 28.9876 },
    
    // Ege Dealers
    { name: 'Ege Seramik Ataşehir Merkez Bayi', brandId: ege.id, phone: '0216 555 66 77', address: 'Atatürk Mah. No:3 Ataşehir', city: 'İstanbul', district: 'Ataşehir', lat: 40.9950, lng: 29.1170 },
    { name: 'Ege Seramik Kağıthane Showroom', brandId: ege.id, phone: '0212 444 55 66', address: 'Cendere Cad. No:54 Kağıthane', city: 'İstanbul', district: 'Kağıthane', lat: 41.0815, lng: 28.9740 },
    
    // Güral Dealers
    { name: 'Güral Seramik Kartal Depo & Showroom', brandId: gural.id, phone: '0216 777 88 99', address: 'E-5 Yan Yol No:10 Kartal', city: 'İstanbul', district: 'Kartal', lat: 40.8988, lng: 29.1834 },
    
    // VitrA Dealers
    { name: 'VitrA Nişantaşı Concept Store', brandId: vitra.id, phone: '0212 345 67 89', address: 'Valikonağı Cad. No:101 Şişli', city: 'İstanbul', district: 'Şişli', lat: 41.0526, lng: 28.9912 }
  ];

  for (const dealer of dealersData) {
    await prisma.dealer.create({ data: dealer });
  }

  console.log('Seeding SaaS configurations...');
  await prisma.saaSConfig.create({ data: { brandId: kutahya.id, plan: 'ENTERPRISE', status: 'ACTIVE', expiresAt: new Date('2027-12-31') } });
  await prisma.saaSConfig.create({ data: { brandId: bien.id, plan: 'PRO', status: 'ACTIVE', expiresAt: new Date('2027-06-30') } });
  await prisma.saaSConfig.create({ data: { brandId: ege.id, plan: 'PRO', status: 'ACTIVE', expiresAt: new Date('2027-09-15') } });
  await prisma.saaSConfig.create({ data: { brandId: vitra.id, plan: 'ENTERPRISE', status: 'ACTIVE', expiresAt: new Date('2027-10-30') } });
  await prisma.saaSConfig.create({ data: { brandId: qua.id, plan: 'PRO', status: 'ACTIVE', expiresAt: new Date('2027-08-15') } });
  await prisma.saaSConfig.create({ data: { brandId: yurtbay.id, plan: 'FREE', status: 'ACTIVE', expiresAt: new Date('2027-05-15') } });
  await prisma.saaSConfig.create({ data: { brandId: canakkale.id, plan: 'PRO', status: 'ACTIVE', expiresAt: new Date('2027-11-15') } });
  await prisma.saaSConfig.create({ data: { brandId: kalebodur.id, plan: 'ENTERPRISE', status: 'ACTIVE', expiresAt: new Date('2027-12-15') } });
  await prisma.saaSConfig.create({ data: { brandId: termal.id, plan: 'FREE', status: 'ACTIVE', expiresAt: new Date('2027-04-15') } });
  await prisma.saaSConfig.create({ data: { brandId: usak.id, plan: 'PRO', status: 'ACTIVE', expiresAt: new Date('2027-07-15') } });

  console.log('Seeding Ad campaigns...');
  await prisma.adCampaign.create({ data: { brandId: kutahya.id, productId: prod1.id, bidAmount: 2.50, status: 'ACTIVE', budget: 1500.0, clicks: 120, impressions: 3400 } });
  await prisma.adCampaign.create({ data: { brandId: bien.id, productId: prod2.id, bidAmount: 1.80, status: 'ACTIVE', budget: 800.0, clicks: 84, impressions: 2100 } });
  await prisma.adCampaign.create({ data: { brandId: vitra.id, productId: prod5.id, bidAmount: 2.10, status: 'ACTIVE', budget: 1200.0, clicks: 95, impressions: 2300 } });

  console.log('Seeding analytics logs...');
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
  const queries = ['Calacatta Gold', 'Borneo Antrasit', 'Travertino Classico', 'Natural Oak', 'Concrete Light Grey', 'Verona Grey', 'Vintage Wood', 'Antik Mermer'];
  const products = [prod1, prod2, prod3, prod4, prod5, prod6, prod7, prod8, prod9, prod10, prod11];

  // Seed SEARCH actions
  for (let i = 0; i < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    await prisma.analyticsLog.create({
      data: {
        action: 'SEARCH',
        query: queries[Math.floor(Math.random() * queries.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        createdAt: date
      }
    });
  }

  // Seed VIEW, CLICK, LEAD actions
  for (let i = 0; i < 300; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const actions = ['VIEW', 'VIEW', 'VIEW', 'CLICK', 'LEAD'];
    const act = actions[Math.floor(Math.random() * actions.length)];

    await prisma.analyticsLog.create({
      data: {
        action: act,
        productId: randomProduct.id,
        brandId: randomProduct.brandId,
        city: cities[Math.floor(Math.random() * cities.length)],
        createdAt: date
      }
    });
  }

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
