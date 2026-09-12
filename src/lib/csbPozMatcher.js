/**
 * Çevre, Şehircilik ve İklim Değişikliği Bakanlığı (ÇŞB) 
 * Resmi İnşaat ve Tesisat Birim Fiyat Poz Eşleştirici
 */

export const CSB_POZ_LIST = [
  {
    pozNo: '15.280.1002',
    title: '60x120 cm ve Üzeri Büyük Ebat Sırlı Porselen Karo ile Döşeme ve Duvar Kaplaması Yapılması',
    description: 'TS EN 14411 Grup BIa standardında, su emme oranı E≤%0.5, rektifiyeli büyük ebat porselen karo ile C2TE S1 sınıfı elastik yapıştırıcı ve CG2WA sınıfı yüksek mukavemetli derz dolgusu kullanılarak kaplama yapılması.',
    unit: 'm²',
    standard: 'TS EN 14411 Grup BIa / TS EN 12004 C2TE S1 / TS EN 13888 CG2WA',
    suitability: 'Büyük ebat (60x120, 80x160, 120x120, 120x240 vb.) porselen karolar'
  },
  {
    pozNo: '15.280.1001',
    title: '30x60 cm ve 60x60 cm Sırlı Porselen Karo ile Döşeme Kaplaması Yapılması',
    description: 'TS EN 14411 standardına uygun, 1. sınıf rektifiyeli sırlı porselen karo ile şartnamesine uygun yapıştırıcı ve derz harcı kullanılarak döşeme kaplaması yapılması.',
    unit: 'm²',
    standard: 'TS EN 14411 Grup BIa / TS EN 12004',
    suitability: 'Standart ebat (30x60, 60x60, 45x45 vb.) porselen yer karoları'
  },
  {
    pozNo: '15.280.1003',
    title: 'Kaymaz Yüzeyli (R10/R11) Seramik Karo ile Islak Hacim Döşeme Kaplaması Yapılması',
    description: 'Banyo, mutfak, havuz çevresi ve açık teras gibi ıslak mahallerde DIN 51130 standardına göre en az R10/R11 kaymazlık sınıfında seramik karo ile kaplama yapılması.',
    unit: 'm²',
    standard: 'TS EN 14411 / DIN 51130 R10-R11',
    suitability: 'Islak hacim, banyo, teras ve teknik hacim kaymaz karoları'
  },
  {
    pozNo: '15.280.1004',
    title: '120x280 cm Dev Porselen Plaka (Slab) ile Eksiz Duvar ve Zemin Kaplaması Yapılması',
    description: 'Minimum 6 mm veya 9 mm et kalınlığında, ultra büyük ebat porselen plakaların çift taraflı yapıştırma metodu ve vakumlu taşıyıcı aparatlar ile uygulanması.',
    unit: 'm²',
    standard: 'TS EN 14411 Grup BIa / Özel İmalat Şartnamesi',
    suitability: 'Lüks lobi, banyo ve prestij mekanlar için dev porselen plakalar'
  },
  {
    pozNo: '15.275.1101',
    title: 'Polimer Emülsiyon Esaslı Çift Kat Su Yalıtımı Yapılması (Seramik Altı)',
    description: 'Islak mekanlarda seramik kaplama öncesi süpürgelik kotuna kadar en az iki kat elastik su yalıtım membranı ve köşelerde pah bandı uygulanması.',
    unit: 'm²',
    standard: 'TS EN 14891',
    suitability: 'Islak hacimler, banyolar ve balkonlar'
  },
  {
    pozNo: '15.285.1001',
    title: 'Porselen Karo ile Süpürgelik Yapılması (Üst Kenarı Yuvarlatılmış / Pahlı)',
    description: 'Döşeme karosu ile aynı renk ve dokuda, fabrika çıkışlı pahlı veya rektifiye porselen süpürgelik imalatı.',
    unit: 'm',
    standard: 'TS EN 14411',
    suitability: 'Tüm mekan süpürgelik imalatları'
  }
];

export function matchCSBPoz(product, usageArea = '') {
  const width = product?.width || 60;
  const height = product?.height || 120;
  const maxDim = Math.max(width, height);
  const finish = (product?.finish || '').toLowerCase();
  const area = (usageArea || '').toLowerCase();
  const slip = (product?.slipResistance || '').toUpperCase();

  // 120x280 or larger
  if (maxDim >= 240) {
    return CSB_POZ_LIST[3]; // 15.280.1004 Dev Slab
  }

  // Wet areas or anti-slip
  if (area.includes('ıslak') || area.includes('banyo') || area.includes('teras') || slip.includes('R10') || slip.includes('R11') || finish.includes('kaymaz')) {
    return CSB_POZ_LIST[2]; // 15.280.1003 Kaymaz
  }

  // 60x120 and large format
  if (maxDim >= 100 || (width >= 60 && height >= 120)) {
    return CSB_POZ_LIST[0]; // 15.280.1002 Büyük Ebat
  }

  // Standard 30x60, 60x60
  return CSB_POZ_LIST[1]; // 15.280.1001 Standart
}
