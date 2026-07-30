const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SEED_INSTALLERS = [
  {
    name: "Ahmet Özkan Usta",
    companyName: "Özkan Seramik & Banyo Yenileme",
    phone: "0532 456 78 90",
    city: "İstanbul",
    district: "Kadıköy & Ataşehir",
    experienceYears: 18,
    specialties: "60x120 ve 120x240 Büyük Ebat Porselen, Banyo Seramiği, Derz & Su Yalıtımı",
    rating: 4.9,
    reviewCount: 38,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "280 ₺/m²",
    notes: "18 yıllık usta tecrübesiyle lazerli terazi ile sıfır kod sapmasıyla granit ve seramik kaplama yapıyoruz.",
    portfolioBeforeAfter: JSON.stringify([
      {
        title: "Kadıköy Ethemefendi Villa Banyo Yenileme",
        areaM2: "35 m²",
        duration: "4 Gün",
        ceramicUsed: "60x120 Calacatta Gold Porselen Granit",
        beforeUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        afterUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80"
      },
      {
        title: "Ataşehir Residence Mutfak Zemin Döşeme",
        areaM2: "22 m²",
        duration: "2 Gün",
        ceramicUsed: "80x80 Lapatto Beton Efekt Karo",
        beforeUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80",
        afterUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&auto=format&fit=crop&q=80"
      }
    ])
  },
  {
    name: "Mustafa Demir",
    companyName: "Demir Yapı & Seramik Uygulama",
    phone: "0533 987 65 43",
    city: "İstanbul",
    district: "Beşiktaş & Sarıyer",
    experienceYears: 15,
    specialties: "Lüks Banyo Seramiği, Tezgah Arası Mozaik, Teras Su İzolasyonu",
    rating: 5.0,
    reviewCount: 29,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "320 ₺/m²",
    notes: "VitrA ve Kalebodur yetkili sertifikalı uygulama ustası. Temiz ve garantili işçilik.",
    portfolioBeforeAfter: JSON.stringify([
      {
        title: "Bebek Yalı Dairesi Ebeveyn Banyosu",
        areaM2: "28 m²",
        duration: "3 Gün",
        ceramicUsed: "120x240 Onyx Bej Porselen Karo",
        beforeUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        afterUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&auto=format&fit=crop&q=80"
      }
    ])
  },
  {
    name: "Kemal & Hasan Usta Ekibi",
    companyName: "Usta Seramik Proje Grubu",
    phone: "0535 111 22 33",
    city: "Ankara",
    district: "Çankaya & Yenimahalle",
    experienceYears: 20,
    specialties: "Dış Cephe Seramik Giydirme, Zemin Graniti, Şantiye Proje Döşeme",
    rating: 4.8,
    reviewCount: 42,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "250 ₺/m²",
    notes: "Müteahhitlik projelerinde ve konut yenilemelerinde hızlı, lazer terazili ve eksiksiz teslimat.",
    portfolioBeforeAfter: JSON.stringify([
      {
        title: "Ümitköy Müstakil Ev Teras & Su İzolasyonu",
        areaM2: "65 m²",
        duration: "5 Gün",
        ceramicUsed: "60x60 Antrasit Kaydırmaz R11 Seramik",
        beforeUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80",
        afterUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&auto=format&fit=crop&q=80"
      }
    ])
  },
  {
    name: "Orhan Şahin Usta",
    companyName: "Şahin Usta Seramik Kaplama",
    phone: "0542 333 44 55",
    city: "İzmir",
    district: "Karşıyaka & Alsancak",
    experienceYears: 14,
    specialties: "Balkon & Havuz Seramiği, 60x120 Ebat Karo, Epoksi Derz Dolgu",
    rating: 4.9,
    reviewCount: 21,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "270 ₺/m²",
    notes: "Ege ve Bien seramik sertifikalı ustası. Havuz ve ıslak mekan su izolasyonlu kaplama.",
    portfolioBeforeAfter: JSON.stringify([
      {
        title: "Karşıyaka Daire Banyo & Balkon Karo Yenileme",
        areaM2: "40 m²",
        duration: "4 Gün",
        ceramicUsed: "60x120 Statuario Mermer Dokulu Seramik",
        beforeUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        afterUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80"
      }
    ])
  },
  {
    name: "Recep Yıldız",
    companyName: "Yıldız Dekorasayon & Seramik",
    phone: "0506 777 88 99",
    city: "Bursa",
    district: "Nilüfer & Osmangazi",
    experienceYears: 16,
    specialties: "Mutfak Tezgah Arası, Banyo Seramiği, 80x80 Porselen Granit",
    rating: 4.9,
    reviewCount: 19,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "260 ₺/m²",
    notes: "Sıfır fire ve temiz şantiye prensibiyle seramik döşeme ve fayans yenileme hizmeti."
  },
  {
    name: "Serkan Taşçı",
    companyName: "Akdeniz Seramik & Doğaltaş",
    phone: "0536 888 99 00",
    city: "Antalya",
    district: "Muratpaşa & Konyaaltı",
    experienceYears: 12,
    specialties: "Villa Banyo Yenileme, Havuz Porseleni, Ahşap Dokulu Seramik",
    rating: 5.0,
    reviewCount: 31,
    verified: true,
    guaranteeBadge: true,
    contractRateM2: "300 ₺/m²",
    notes: "Otel ve müstakil villa projelerinde mimari seramik kaplama uzmanı."
  }
];

async function seedInstallers() {
  console.log("Seeding / updating installers with portfolio and guarantee fields...");
  for (const inst of SEED_INSTALLERS) {
    const existing = await prisma.installer.findFirst({
      where: { phone: inst.phone }
    });
    if (existing) {
      await prisma.installer.update({
        where: { id: existing.id },
        data: {
          guaranteeBadge: inst.guaranteeBadge,
          contractRateM2: inst.contractRateM2,
          portfolioBeforeAfter: inst.portfolioBeforeAfter
        }
      });
      console.log(`Updated installer portfolio: ${inst.name}`);
    } else {
      await prisma.installer.create({ data: inst });
      console.log(`Created installer: ${inst.name} (${inst.city})`);
    }
  }
  console.log("Done seeding / updating installers!");
  await prisma.$disconnect();
}

seedInstallers().catch(err => {
  console.error(err);
  process.exit(1);
});
