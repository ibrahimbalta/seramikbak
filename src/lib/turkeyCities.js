// 81 İl ve İlçe Koordinat Veritabanı
export const TURKEY_CITIES = [
  { name: 'Adana', lat: 37.0000, lng: 35.3213, isMajor: false },
  { name: 'Adıyaman', lat: 37.7648, lng: 38.2786, isMajor: false },
  { name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567, isMajor: false },
  { name: 'Ağrı', lat: 39.7191, lng: 43.0503, isMajor: false },
  { name: 'Amasya', lat: 40.6533, lng: 35.8330, isMajor: false },
  { name: 'Ankara', lat: 39.9208, lng: 32.8541, isMajor: true },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133, isMajor: true },
  { name: 'Artvin', lat: 41.1828, lng: 41.8183, isMajor: false },
  { name: 'Aydın', lat: 37.8560, lng: 27.8416, isMajor: false },
  { name: 'Balıkesir', lat: 39.6484, lng: 27.8826, isMajor: false },
  { name: 'Bilecik', lat: 40.1451, lng: 29.9799, isMajor: false },
  { name: 'Bingöl', lat: 38.8847, lng: 40.4982, isMajor: false },
  { name: 'Bitlis', lat: 38.4006, lng: 42.1095, isMajor: false },
  { name: 'Bolu', lat: 40.7350, lng: 31.6061, isMajor: false },
  { name: 'Burdur', lat: 37.7203, lng: 30.2908, isMajor: false },
  { name: 'Bursa', lat: 40.1885, lng: 29.0610, isMajor: true },
  { name: 'Çanakkale', lat: 40.1553, lng: 26.4142, isMajor: false },
  { name: 'Çankırı', lat: 40.6013, lng: 33.6134, isMajor: false },
  { name: 'Çorum', lat: 40.5506, lng: 34.9556, isMajor: false },
  { name: 'Denizli', lat: 37.7765, lng: 29.0864, isMajor: false },
  { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306, isMajor: false },
  { name: 'Edirne', lat: 41.6771, lng: 26.5557, isMajor: false },
  { name: 'Elazığ', lat: 38.6810, lng: 39.2264, isMajor: false },
  { name: 'Erzincan', lat: 39.7500, lng: 39.5000, isMajor: false },
  { name: 'Erzurum', lat: 39.9000, lng: 41.2700, isMajor: false },
  { name: 'Eskişehir', lat: 39.7767, lng: 30.5206, isMajor: true },
  { name: 'Gaziantep', lat: 37.0662, lng: 37.3833, isMajor: true },
  { name: 'Giresun', lat: 40.9128, lng: 38.3895, isMajor: false },
  { name: 'Gümüşhane', lat: 40.4600, lng: 39.4700, isMajor: false },
  { name: 'Hakkâri', lat: 37.5833, lng: 43.7333, isMajor: false },
  { name: 'Hatay', lat: 36.4018, lng: 36.3498, isMajor: false },
  { name: 'Isparta', lat: 37.7648, lng: 30.5566, isMajor: false },
  { name: 'Mersin', lat: 36.8121, lng: 34.6415, isMajor: false },
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784, isMajor: true },
  { name: 'İzmir', lat: 38.4237, lng: 27.1428, isMajor: true },
  { name: 'Kars', lat: 40.6167, lng: 43.1000, isMajor: false },
  { name: 'Kastamonu', lat: 41.3887, lng: 33.7827, isMajor: false },
  { name: 'Kayseri', lat: 38.7312, lng: 35.4787, isMajor: true },
  { name: 'Kırklareli', lat: 41.7333, lng: 27.2167, isMajor: false },
  { name: 'Kırşehir', lat: 39.1425, lng: 34.1709, isMajor: false },
  { name: 'Kocaeli', lat: 40.8533, lng: 29.8815, isMajor: true },
  { name: 'Konya', lat: 37.8667, lng: 32.4833, isMajor: true },
  { name: 'Kütahya', lat: 39.4167, lng: 29.9833, isMajor: false },
  { name: 'Malatya', lat: 38.3552, lng: 38.3095, isMajor: false },
  { name: 'Manisa', lat: 38.6191, lng: 27.4289, isMajor: false },
  { name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371, isMajor: false },
  { name: 'Mardin', lat: 37.3212, lng: 40.7245, isMajor: false },
  { name: 'Muğla', lat: 37.2153, lng: 28.3636, isMajor: true },
  { name: 'Muş', lat: 38.7432, lng: 41.5064, isMajor: false },
  { name: 'Nevşehir', lat: 38.6244, lng: 34.7141, isMajor: false },
  { name: 'Niğde', lat: 37.9667, lng: 34.6833, isMajor: false },
  { name: 'Ordu', lat: 40.9839, lng: 37.8764, isMajor: false },
  { name: 'Rize', lat: 41.0201, lng: 40.5234, isMajor: false },
  { name: 'Sakarya', lat: 40.7569, lng: 30.3783, isMajor: false },
  { name: 'Samsun', lat: 41.2928, lng: 36.3313, isMajor: true },
  { name: 'Siirt', lat: 37.9333, lng: 41.9500, isMajor: false },
  { name: 'Sinop', lat: 42.0231, lng: 35.1531, isMajor: false },
  { name: 'Sivas', lat: 39.7477, lng: 37.0179, isMajor: false },
  { name: 'Tekirdağ', lat: 40.9833, lng: 27.5167, isMajor: false },
  { name: 'Tokat', lat: 40.3167, lng: 36.5500, isMajor: false },
  { name: 'Trabzon', lat: 41.0027, lng: 39.7168, isMajor: true },
  { name: 'Tunceli', lat: 39.1079, lng: 39.5401, isMajor: false },
  { name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969, isMajor: false },
  { name: 'Uşak', lat: 38.6823, lng: 29.4082, isMajor: false },
  { name: 'Van', lat: 38.4891, lng: 43.4089, isMajor: false },
  { name: 'Yozgat', lat: 39.8181, lng: 34.8147, isMajor: false },
  { name: 'Zonguldak', lat: 41.4564, lng: 31.7987, isMajor: false },
  { name: 'Aksaray', lat: 38.3687, lng: 34.0370, isMajor: false },
  { name: 'Bayburt', lat: 40.2552, lng: 40.2249, isMajor: false },
  { name: 'Karaman', lat: 37.1759, lng: 33.2287, isMajor: false },
  { name: 'Kırıkkale', lat: 39.8468, lng: 33.5153, isMajor: false },
  { name: 'Batman', lat: 37.8812, lng: 41.1294, isMajor: false },
  { name: 'Şırnak', lat: 37.5164, lng: 42.4918, isMajor: false },
  { name: 'Bartın', lat: 41.6344, lng: 32.3375, isMajor: false },
  { name: 'Ardahan', lat: 41.1105, lng: 42.7022, isMajor: false },
  { name: 'Iğdır', lat: 39.9196, lng: 44.0454, isMajor: false },
  { name: 'Yalova', lat: 40.6500, lng: 29.2667, isMajor: false },
  { name: 'Karabük', lat: 41.2061, lng: 32.6204, isMajor: false },
  { name: 'Kilis', lat: 36.7184, lng: 37.1212, isMajor: false },
  { name: 'Osmaniye', lat: 37.0742, lng: 36.2472, isMajor: false },
  { name: 'Düzce', lat: 40.8438, lng: 31.1565, isMajor: false }
];

// İki koordinat arası kuş uçuşu mesafe (km cinsinden)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Dünya yarıçapı km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Koordinata en yakın ili bulur
export function findNearestCity(lat, lng) {
  let nearest = TURKEY_CITIES[33]; // Varsayılan İstanbul
  let minDistance = Infinity;

  for (const city of TURKEY_CITIES) {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = city;
    }
  }

  return { ...nearest, distanceKm: minDistance };
}
