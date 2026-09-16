import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const brandDealersSeed = [
  // 1. Güral Seramik
  {
    brandNames: ['Güral Seramik', 'Güral', 'gural-seramik'],
    dealers: [
      {
        name: 'Güral Seramik Bartın Yetkili Bayi - Güral Yapı',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Kırtepe Mah. Cumhuriyet Cad. No:42 Merkez',
        lat: 41.6358,
        lng: 32.3375,
        phone: '0378 227 15 20',
        email: 'bartin.gural@seramikbak.com',
        aboutText: 'Güral Seramik resmi Bartın yetkili ana bayisi ve teşhir showroomu.'
      },
      {
        name: 'Güral Seramik Kartal Depo & Showroom',
        city: 'İstanbul',
        district: 'Kartal',
        address: 'E-5 Yan Yol No:10 Kartal',
        lat: 40.8988,
        lng: 29.1834,
        phone: '0216 777 88 99',
        email: 'gural.kartal@seramikbak.com',
        aboutText: 'Klasik Seri Seramikler, Büyük Proje Depo Teslimat'
      },
      {
        name: 'Güral Seramik Rüzgarlı Merkez Showroom',
        city: 'Ankara',
        district: 'Altındağ',
        address: 'Rüzgarlı Cad. No:18 Altındağ',
        lat: 39.9450,
        lng: 32.8520,
        phone: '0312 311 22 33',
        email: 'ankara.gural@seramikbak.com',
        aboutText: 'Güral Seramik İç Anadolu bölge proje merkezi.'
      }
    ]
  },

  // 2. NG Kütahya Seramik
  {
    brandNames: ['NG Kütahya Seramik', 'Kütahya Seramik', 'ng-kutahya-seramik'],
    dealers: [
      {
        name: 'NG Kütahya Seramik Bartın Showroom - Karadeniz Seramik',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Demirciler Mah. Hükümet Cad. No:15 Merkez',
        lat: 41.6385,
        lng: 32.3412,
        phone: '0378 228 30 40',
        email: 'bartin.kutahya@seramikbak.com',
        aboutText: 'NG Kütahya Seramik Bartın yetkili konsept showroomu.'
      },
      {
        name: 'NG Kütahya Seramik Kadıköy Bayi',
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Bağdat Cad. No:45 Kadıköy',
        lat: 40.9901,
        lng: 29.0278,
        phone: '0216 123 45 67',
        email: 'kutahya.kadikoy@seramikbak.com',
        aboutText: 'Büyük Ebatlı Porselen Karolar, Modern Banyo Teşhirleri'
      },
      {
        name: 'NG Kütahya Seramik Çankaya Showroom',
        city: 'Ankara',
        district: 'Çankaya',
        address: 'Turan Güneş Bulvarı No:62 Çankaya',
        lat: 39.8920,
        lng: 32.8550,
        phone: '0312 440 10 20',
        email: 'ankara.kutahya@seramikbak.com',
        aboutText: 'NG Kütahya Seramik Ankara amiral showroomu.'
      }
    ]
  },

  // 3. Bien Seramik
  {
    brandNames: ['Bien Seramik', 'Bien', 'bien-seramik'],
    dealers: [
      {
        name: 'Bien Seramik Bartın Concept Bayi',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Kemerköprü Mah. Bülent Ecevit Bulvarı No:28 Merkez',
        lat: 41.6320,
        lng: 32.3350,
        phone: '0378 227 88 90',
        email: 'bartin.bien@seramikbak.com',
        aboutText: 'Bien Seramik Bartın yetkili mağazası ve mimari teşhir alanı.'
      },
      {
        name: 'Bien Seramik Ümraniye Yetkili Satıcı',
        city: 'İstanbul',
        district: 'Ümraniye',
        address: 'Alemdağ Cad. No:190 Ümraniye',
        lat: 41.0252,
        lng: 29.0963,
        phone: '0216 333 44 55',
        email: 'bien.umraniye@seramikbak.com',
        aboutText: 'Ahşap Görünümlü Seramikler, Islak Hacim Çözümleri'
      }
    ]
  },

  // 4. VitrA
  {
    brandNames: ['VitrA', 'vitra'],
    dealers: [
      {
        name: 'VitrA Bartın Yetkili Satıcısı - Ece Banyo Yapı',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Tersane Cad. No:14 Bartın',
        lat: 41.6372,
        lng: 32.3398,
        phone: '0378 227 45 60',
        email: 'bartin.vitra@seramikbak.com',
        aboutText: 'VitrA karo seramik, banyo mobilyaları ve armatür yetkili bayisi.'
      },
      {
        name: 'VitrA Nişantaşı Concept Store',
        city: 'İstanbul',
        district: 'Şişli',
        address: 'Valikonağı Cad. No:101 Şişli',
        lat: 41.0526,
        lng: 28.9912,
        phone: '0212 345 67 89',
        email: 'vitra.nisantasi@seramikbak.com',
        aboutText: 'VitrA Exclusive Tasarımlar, Akıllı Banyo Teknolojileri'
      }
    ]
  },

  // 5. Ege Seramik
  {
    brandNames: ['Ege Seramik', 'Ege', 'ege-seramik'],
    dealers: [
      {
        name: 'Ege Seramik Bartın Yetkili Bayi - Doğan Yapı',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Hendekyanı Cad. No:55 Merkez',
        lat: 41.6341,
        lng: 32.3330,
        phone: '0378 228 11 22',
        email: 'bartin.ege@seramikbak.com',
        aboutText: 'Ege Seramik Bartın ana yetkili satıcısı.'
      },
      {
        name: 'Ege Seramik Ataşehir Merkez Bayi',
        city: 'İstanbul',
        district: 'Ataşehir',
        address: 'Atatürk Mah. No:3 Ataşehir',
        lat: 40.9950,
        lng: 29.1170,
        phone: '0216 555 66 77',
        email: 'ege.atasehir@seramikbak.com',
        aboutText: 'Rustik ve Etnik Desenler, Bahçe ve Teras Seramikleri'
      }
    ]
  },

  // 6. Çanakkale Seramik
  {
    brandNames: ['Çanakkale Seramik', 'canakkale-seramik'],
    dealers: [
      {
        name: 'Çanakkale Seramik Bartın Kale Bayi - Kale Mağazası',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Bülent Ecevit Bulvarı No:60 Merkez',
        lat: 41.6310,
        lng: 32.3380,
        phone: '0378 227 99 00',
        email: 'bartin.canakkale@seramikbak.com',
        aboutText: 'Çanakkale Seramik ve Kale Grubu Bartın yetkili mağazası.'
      },
      {
        name: 'Çanakkale Seramik Kadıköy Showroom',
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Fahrettin Kerim Gökay Cad. No:110 Kadıköy',
        lat: 40.9830,
        lng: 29.0420,
        phone: '0216 418 20 30',
        email: 'kadikoy.canakkale@seramikbak.com',
        aboutText: 'Kale Grubu Çanakkale Seramik konsept mağazası.'
      }
    ]
  },

  // 7. Kalebodur
  {
    brandNames: ['Kalebodur', 'kalebodur'],
    dealers: [
      {
        name: 'Kalebodur Bartın Mimari Çözüm Merkezi',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Bülent Ecevit Bulvarı No:60/B Merkez',
        lat: 41.6312,
        lng: 32.3382,
        phone: '0378 227 99 02',
        email: 'bartin.kalebodur@seramikbak.com',
        aboutText: 'Kalebodur porselen seramik ve dış cephe çözümleri Bartın yetkili bayisi.'
      },
      {
        name: 'Kalebodur Levent Mimarlık Merkezi',
        city: 'İstanbul',
        district: 'Beşiktaş',
        address: 'Büyükdere Cad. No:140 Levent',
        lat: 41.0780,
        lng: 29.0110,
        phone: '0212 325 50 00',
        email: 'levent.kalebodur@seramikbak.com',
        aboutText: 'Kalebodur profesyonel mimari seramik showroomu.'
      }
    ]
  },

  // 8. Yurtbay Seramik
  {
    brandNames: ['Yurtbay Seramik', 'Yurtbay', 'yurtbay-seramik'],
    dealers: [
      {
        name: 'Yurtbay Seramik Bartın Ana Bayi - Yurtbay Yapı',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Çaydüzü Mah. Zonguldak Yolu Üzeri No:12 Merkez',
        lat: 41.6420,
        lng: 32.3290,
        phone: '0378 228 50 60',
        email: 'bartin.yurtbay@seramikbak.com',
        aboutText: 'Yurtbay Seramik Karadeniz bölge satış ve teşhir noktası.'
      },
      {
        name: 'Yurtbay Seramik Ümraniye Bölge Showroom',
        city: 'İstanbul',
        district: 'Ümraniye',
        address: 'Tavukçuyolu Cad. No:82 Ümraniye',
        lat: 41.0180,
        lng: 29.1350,
        phone: '0216 466 70 80',
        email: 'umraniye.yurtbay@seramikbak.com',
        aboutText: 'Yurtbay Seramik İstanbul Anadolu bölge yetkili bayisi.'
      }
    ]
  },

  // 9. Qua Granite
  {
    brandNames: ['Qua Granite', 'Qua', 'qua-granite'],
    dealers: [
      {
        name: 'Qua Granite Çelebi Yapı Market',
        city: 'Bartın',
        district: 'Kozcağız',
        address: 'Kozcağız Beldesi Terminal Karşısı Bartın',
        lat: 41.4735,
        lng: 32.3418,
        phone: '0378 233 10 20',
        email: 'celebi.yapi@seramikbak.com',
        aboutText: 'Qua Granite Bartın ve çevre iller yetkili ana bayisi.'
      },
      {
        name: 'Qua Granite Maltepe Showroom',
        city: 'İstanbul',
        district: 'Maltepe',
        address: 'Bağdat Cad. No:310 Maltepe',
        lat: 40.9250,
        lng: 29.1410,
        phone: '0216 383 90 00',
        email: 'maltepe.qua@seramikbak.com',
        aboutText: 'Qua Granite büyük ebat granit ve porselen sergi alanı.'
      }
    ]
  },

  // 10. Termal Seramik
  {
    brandNames: ['Termal Seramik', 'Termal', 'termal-seramik'],
    dealers: [
      {
        name: 'Termal Seramik Bartın Yetkili Bayi',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Gölbucağı Mah. No:18 Merkez',
        lat: 41.6280,
        lng: 32.3440,
        phone: '0378 227 30 70',
        email: 'bartin.termal@seramikbak.com',
        aboutText: 'Termal Seramik Bartın yetkili satış noktası.'
      }
    ]
  },

  // 11. Uşak Seramik
  {
    brandNames: ['Uşak Seramik', 'Usak Seramik', 'usak-seramik'],
    dealers: [
      {
        name: 'Uşak Seramik Bartın Yetkili Satıcısı',
        city: 'Bartın',
        district: 'Merkez',
        address: 'Karaköy Mah. Sanayi Cad. No:9 Merkez',
        lat: 41.6450,
        lng: 32.3480,
        phone: '0378 228 40 50',
        email: 'bartin.usak@seramikbak.com',
        aboutText: 'Uşak Seramik Bartın teşhir ve proje bayisi.'
      }
    ]
  }
];

async function main() {
  console.log('Fetching all brands from database...');
  const allBrands = await prisma.brand.findMany();
  console.log(`Found ${allBrands.length} brands:`, allBrands.map(b => `${b.name} (${b.id})`).join(', '));

  for (const group of brandDealersSeed) {
    const matchedBrand = allBrands.find(b => {
      const bName = b.name.toLowerCase().trim();
      const bSlug = (b.slug || '').toLowerCase().trim();
      return group.brandNames.some(alias => {
        const a = alias.toLowerCase().trim();
        return bName === a || bSlug === a || bName.includes(a);
      });
    });

    if (!matchedBrand) {
      console.log(`Brand match NOT found for alias: ${group.brandNames.join(', ')}`);
      continue;
    }

    console.log(`\nAdding dealers for brand: ${matchedBrand.name} (${matchedBrand.id})`);

    for (const d of group.dealers) {
      const existing = await prisma.dealer.findFirst({
        where: {
          brandId: matchedBrand.id,
          name: d.name
        }
      });

      if (existing) {
        console.log(`- Updating existing dealer: ${d.name}`);
        await prisma.dealer.update({
          where: { id: existing.id },
          data: {
            city: d.city,
            district: d.district,
            address: d.address,
            lat: d.lat,
            lng: d.lng,
            phone: d.phone,
            email: d.email,
            status: 'APPROVED',
            aboutText: d.aboutText,
            logoUrl: matchedBrand.logoUrl || null
          }
        });
      } else {
        console.log(`+ Creating new dealer: ${d.name}`);
        await prisma.dealer.create({
          data: {
            name: d.name,
            brandId: matchedBrand.id,
            password: 'bayi123',
            city: d.city,
            district: d.district,
            address: d.address,
            lat: d.lat,
            lng: d.lng,
            phone: d.phone,
            email: d.email,
            status: 'APPROVED',
            aboutText: d.aboutText,
            logoUrl: matchedBrand.logoUrl || null
          }
        });
      }
    }
  }

  // Count dealers per brand
  console.log('\n--- Current Dealer Counts By Brand ---');
  for (const brand of allBrands) {
    const count = await prisma.dealer.count({
      where: { brandId: brand.id, status: { in: ['APPROVED', 'approved'] } }
    });
    console.log(`${brand.name}: ${count} approved dealer(s)`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
