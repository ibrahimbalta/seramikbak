# Tasarım Dokümanı: Odamda Canlı Gör (Instant Room Visualizer) & Akıllı Metraj

Bu doküman, SeramikBak AR özelliğinin sahte kamera lazer metre modelinden çıkartılarak, kullanıcıların odalarını seçtikleri seramikle canlı giydirmesini sağlayan, basit metraj ve en yakın bayi teklifi sunan modern **Odamda Canlı Gör (Instant Room Visualizer)** sistemine dönüştürülmesini tanımlar.

---

## 1. Problem ve Hedefler

### Problem
- Standart web kameraları donanımsal derinlik sensörüne sahip olmadığı için kamera görüntüsünden lazer metre gibi ölçüm çıkarmaya çalışmak yapay ve yanıltıcı hissettirmektedir.
- Kullanıcıların asıl ihtiyacı odasını ölçmek değil; baktığı seramiğin kendi banyosuna/mutfağına yakışıp yakışmayacağını görmek, ne kadar malzeme gerektiğini öğrenmek ve en yakın bayiden teklif almaktır.

### Hedefler
1. **Göz Alıcı Canlı Oda Giydirme:** Kamera açıldığı anda seçili seramiğin gerçekçi doku, parlaklık ve derz çizgileriyle kullanıcının duvarında veya zemininde canlanması.
2. **Fotoğraf Çek & Odana Döşe:** Kullanıcının telefonu sabit tutma zorunluluğunu ortadan kaldıran dondurma ve galeri fotoğrafı yükleme desteği.
3. **Gerçekçi & Pratik Metraj:** Kullanıcıyı uğraştırmadan hazır oda şablonları (Küçük Banyo 4m², Standart Banyo 6m², Mutfak Tezgahı 2m²) veya basit En × Boy girişiyle net kutu sayısı (+%10 fire), Kalekim yapıştırıcı ve derz ihtiyacını çıkarma.
4. **En Yakın Bayiye WhatsApp Teklifi:** Bu ürünü stoğunda/teşhirinde bulunduran en yakın bayiye tek tıkla hazır metraj ve görsel içeren WhatsApp teklif mesajı yönlendirme.
5. **Sıfır Kamera Sızıntısı:** Modal kapatıldığında kamera donanımının anında kapanması garantisi.

---

## 2. Kullanıcı Akışı ve Arayüz Tasarımı

### Adım 1: Modal Açılışı & Canlı Kamera
- Kullanıcı ürün kartında veya detayında **"AR / Canlı Gör"** butonuna basar.
- Kamera anında açılır.
- Üst Barda:
  * Ürün görseli, adı, ebadı (Örn: *VitrA Calacatta 60x120 cm*)
  * Yüzey Seçimi: `[ 🧱 Duvar Kaplama ]` | `[ 🔲 Zemin Kaplama ]`
  * Sağ üstte kapatma butonu (`X`)
- Kamera Üzerinde Canlı Döşeme:
  * Seçili seramik zemin veya duvar perspektifine göre gerçekçi derz çizgileriyle yerleşir.
  * Döşeme Stili Butonları: `[ Düz ]` `[ Çapraz ]` `[ Balıksırtı ]`
  * Derz Rengi Seçici: Altın, Beyaz, Gri, Antrasit

### Adım 2: Fotoğraf Çek & Dondur (Opsiyonel ama Çok Faydalı)
- `📸 Fotoğraf Çek & Odana Döşe`: Canlı görüntüyü dondurur. Kullanıcı kamerayı sallamadan farklı seramik modellerini odasında rahatça dener.
- `📥 Odamı İndir`: Döşenmiş odayı yüksek çözünürlüklü kaydeder.
- `🖼️ Galeriden Fotoğraf Yükle`: Kamerası olmayan veya önceden çektiği banyo fotoğrafını denemek isteyenler için dosya yükleme desteği.

### Adım 3: Akıllı Metraj & Malzeme Hesabı
- Kullanıcı kamerayla cetvelcilik oynamaz; odasının yaklaşık ölçüsünü seçer:
  * Hızlı Şablonlar:
    - `🚿 Küçük Banyo / WC (4 m²)`
    - `🛁 Standart Banyo (6 m²)`
    - `👑 Ebeveyn Banyosu (9 m²)`
    - `🍳 Mutfak Tezgah Arası (2 m²)`
    - `🌿 Teras / Balkon (8 m²)`
  * Manuel Hızlı Giriş: `En: 2.4 m` × `Boy: 2.6 m`
  * Hızlı Boşluk Düşme: `+ 🚪 Kapı (-1.8 m²)`, `+ 🪟 Pencere (-1.2 m²)`, `+ 🚿 Duşakabin (-2.0 m²)`.
- Sistem anında net hesabı çıkarır:
  * Net Kaplama Alanı (m²)
  * Gerekli Seramik: **X Kutu** (+%10 fire dahil)
  * Kalekim Yapıştırıcı: **Y Çuval (25kg)**
  * Derz Dolgusu: **Z kg**
  * Tahmini Malzeme Bütçesi: **... ₺**

### Adım 4: En Yakın Yetkili Bayi Eşleşmesi ve Teklif
- Sistem kullanıcının konumuna en yakın, bu ürünü stoğunda/teşhirinde bulunduran yetkili bayiyi otomatik bulur.
- Ekranda:
  * `🏢 [Bayi Adı] (Kadıköy - 2.4 km mesafede)`
  * `✅ Bu seramik bu bayinin yetkili stoğunda / teşhirinde mevcuttur`
  * `📞 Telefon: 05xx xxx xx xx`
- Butonlar:
  * `📲 WhatsApp ile Teklif Al`: Tek tıkla ürün adı, metraj, kutu sayısı, yapıştırıcı ihtiyacı ve müşteri bilgileriyle hazır WhatsApp mesajı açar.
  * `💾 Sisteme Kaydet & Bayiye İlet`: Teklifi veritabanına lead olarak kaydeder.

---

## 3. Bileşen Mimarisi

```
src/
├── components/
│   ├── WebARModal.jsx              # Giriş noktası sarmalayıcısı (temiz pass-through)
│   └── ARRoomScannerModal.jsx      # Ana "Odamda Canlı Gör" bileşeni
│       ├── Header & Product Info
│       ├── Live Camera & Perspective Canvas Engine
│       │   ├── Straight / Diagonal / Herringbone Laying
│       │   ├── Freeze Frame & Gallery Upload
│       │   └── High-res Snapshot Download
│       ├── Quick Room Sizer & Material Calculator
│       │   ├── Presets (Banyo, Mutfak, Teras)
│       │   ├── Cutouts Subtraction (Kapı, Pencere)
│       │   └── Exact Box & Adhesive Computation
│       └── Nearest Dealer Matcher & WhatsApp Quote
│           └── Integration with /api/dealers/nearest
```

---

## 4. Kamera Yaşam Döngüsü (Sıfır Sızıntı Garantisi)
- `streamRef.current` ve `videoRef.current.srcObject` üzerinden tüm medya kanalları kapatılır.
- Modal kapatıldığında, ESC basıldığında veya sekmeden çıkıldığında donanım ışığı anında söner.
