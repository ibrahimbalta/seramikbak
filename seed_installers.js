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
    notes: "18 yıllık usta tecrübesiyle lazerli terazi ile sıfır kod sapmasıyla granit ve seramik kaplama yapıyoruz."
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
    notes: "VitrA ve Kalebodur yetkili sertifikalı uygulama ustası. Temiz ve garantili işçilik."
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
    notes: "Müteahhitlik projelerinde ve konut yenilemelerinde hızlı, lazer terazili ve eksiksiz teslimat."
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
    notes: "Ege ve Bien seramik sertifikalı ustası. Havuz ve ıslak mekan su izolasyonlu kaplama."
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
    notes: "Otel ve müstakil villa projelerinde mimari seramik kaplama uzmanı."
  }
];

async function seedInstallers() {
  console.log("Seeding installers...");
  for (const inst of SEED_INSTALLERS) {
    const existing = await prisma.installer.findFirst({
      where: { phone: inst.phone }
    });
    if (!existing) {
      await prisma.installer.create({ data: inst });
      console.log(`Created installer: ${inst.name} (${inst.city})`);
    }
  }
  console.log("Done seeding installers!");
  await prisma.$disconnect();
}

seedInstallers().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
