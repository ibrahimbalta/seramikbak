# SeramikBak - SegFormer AI Python Mikroservisi

Bu mikroservis, SeramikBak **"Mekânımda Gör & Dene"** özelliği için NVIDIA SegFormer-B3 tabanlı derin öğrenme segmentasyonu ve OpenCV homografi & gölge korumalı seramik giydirme motoru sağlar.

## Özellikler
- **NVIDIA SegFormer-B3 (ADE20K)** ile piksel hassasiyetinde zemin ve duvar segmentasyonu.
- **Işık ve Gölge Koruma (`preserve_shadows`)**: Küvet, lavabo ve mobilya altlarındaki derin temas gölgelerini korur.
- **Yumuşak Maske Geçişi (`feather_mask`)**: Kenarlardaki sert piksel tırtıklanmalarını önler.
- **Doğal Pozlama Eşleme (`transfer_lighting`)**: Katalog çekimi seramik dokularını odanın ortam ışığına uyarır.

## Çalıştırma Seçenekleri

### Seçenek 1: Windows Batch ile Doğrudan Çalıştırma (Mevcut Ortam)
```cmd
run_service.bat
```
*(D:\floor_tile_env ve D:\floor_tile_env\hf_cache önbelleklerini otomatik kullanır)*

### Seçenek 2: Docker ile Çalıştırma
```bash
docker-compose up -d --build
```

Sunucu `http://127.0.0.1:8000` adresinde çalışır ve SeramikBak Next.js uygulaması bu adrese otomatik bağlanır.
