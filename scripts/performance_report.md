# SeramikBak Yük Testi Sonuçları

*Test Tarihi: 16.07.2026 12:42:04*
*Test Süresi: Her seviye için 10 saniye*

Bu testler local ortamda SQLite veritabanı ile derlenmiş Next.js prodüksiyon sunucusu üzerinde yapılmıştır.

## Senaryo: Ana Sayfa (GET /)

| Eşzamanlı Kullanıcı (VU) | Ort. Gecikme (Latency) | 99% Gecikme (p99) | İstek / Saniye (RPS) | Toplam İstek | Hata / Başarısız |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **10** | 17.1 ms | 45.0 ms | 569.3 | 5703 | <span style="color:green">0</span> |
| **50** | 114.1 ms | 338.0 ms | 435.9 | 4409 | <span style="color:green">0</span> |
| **250** | 358.6 ms | 534.0 ms | 697.5 | 7225 | <span style="color:green">0</span> |
| **1000** | 2624.6 ms | 3982.0 ms | 351.0 | 4159 | <span style="color:green">0</span> |

## Senaryo: Arama API (GET /api/search?q=mat)

| Eşzamanlı Kullanıcı (VU) | Ort. Gecikme (Latency) | 99% Gecikme (p99) | İstek / Saniye (RPS) | Toplam İstek | Hata / Başarısız |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **10** | 6415.6 ms | 6802.0 ms | 1.0 | 20 | <span style="color:green">0</span> |
| **50** | 0.0 ms | 0.0 ms | 0.0 | 80 | <span style="color:red">60</span> |
| **250** | 0.0 ms | 0.0 ms | 0.0 | 447 | <span style="color:red">394</span> |
| **1000** | 0.0 ms | 0.0 ms | 0.0 | 2000 | <span style="color:red">2000</span> |

