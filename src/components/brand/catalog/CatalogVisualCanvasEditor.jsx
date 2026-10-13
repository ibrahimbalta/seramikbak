'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Trash2,
  Copy,
  Plus,
  MoveUp,
  MoveDown,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Grid,
  Save,
  Eye,
  Layers,
  Sparkles,
  Check,
  Palette,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  QrCode,
  Sliders,
  ChevronRight,
  ChevronLeft,
  LayoutTemplate,
  Box,
  CornerDownRight,
  CheckCircle2,
  Move,
  RotateCcw,
  BookOpen
} from 'lucide-react';

// ============================================================================
// ANA KATALOG ŞABLONLARI (10 ADET KURUMSAL MATBAA ŞABLONU)
// ============================================================================
export const CATALOG_MASTER_TEMPLATES = [
  {
    id: 'milano',
    name: 'Milano Lookbook',
    badge: '120×280 & Dev Ebat Matbaa Baskısı',
    tag: 'MİMARLAR & TASARIMCILAR',
    desc: 'İtalyan Cersaie ve Milano matbaa standardında 2 sayfalı mimari monograf mizanpajı: Sol sayfada yaşam alanı uygulaması ve teknik şartname matrisi; sağ sayfada tam boy dikey plaka ve varyasyonlar.',
    accent: '#b4823c',
    mockupImg: '/renders/modern_living_natural_oak.jpg',
    bgColor: '#18181b',
    format: 'A4 Dikey Çift Sayfa'
  },
  {
    id: 'deco',
    name: 'Deco Exclusive',
    badge: 'Bien Kare Monograf & Dekofon',
    tag: 'EXCLUSIVE & LÜKS KONSEPT',
    desc: 'Bien Seramik Exclusive dergi standardında kare (1:1) editoryal katalog: Sol sayfada tam boy mekan fotoğrafı, sağ sayfada geniş harf aralıklı koleksiyon başlığı, kare REC/M yüzey rozetleri ve dekofon karolar.',
    accent: '#0f172a',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    bgColor: '#ffffff',
    format: '1:1 Kare Editoryal'
  },
  {
    id: 'lidya',
    name: 'Lidya Pro Technic',
    badge: 'Mimari Modüler & Şartname',
    tag: 'MİMARİ PROJELER & ŞARTNAME',
    desc: 'Mimari şartname ve teknik matris standardında modüler seramik kataloğu: Renk mühendisliği (Colour engineering), RAL renk paletleri, tel kafes modüler formlar ve R9-R12 kaymazlık matrisleri.',
    accent: '#059669',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    bgColor: '#ffffff',
    format: 'A4 Dikey Mimari Matris'
  },
  {
    id: 'spec-sheet',
    name: 'Architectural Spec Sheet',
    badge: 'TS EN 14411 & BIM',
    tag: 'İHALE & ŞARTNAME',
    desc: 'Mimarlar, mühendisler ve kamu ihale dosyaları için CAD/BIM standartlarında teknik matris. TS EN 14411 uygunluğu, PEI aşınma, R kaymazlık, kutu/palet metrajı.',
    accent: '#0284c7',
    mockupImg: '/renders/luxury_bathroom_loft_beton.jpg',
    bgColor: '#ffffff',
    format: 'A4 Yatay / Dikey CAD/BIM'
  },
  {
    id: 'showroom',
    name: 'Showroom & Collection',
    badge: 'Perakende & Bayi Satış',
    tag: 'MAĞAZA & MÜŞTERİ',
    desc: 'Bayi teşhirleri ve mağaza satış ekipleri için yan yana ürün kartları, önerilen mekan etiketleri (Banyo, Mutfak, Salon), derz eşleştirmeleri ve perakende liste etiketleri.',
    accent: '#d97706',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    bgColor: '#ffffff',
    format: 'A4 Dikey Bayi Kataloğu'
  },
  {
    id: 'global-export',
    name: 'Global Export & B2B',
    badge: 'Konteyner & Lojistik',
    tag: 'GLOBAL İHRACAT',
    desc: 'Yurtdışı distribütörler ve ihracat fuarları için çok dilli (EN/DE/AR) format. 20ft/40ft konteyner yükleme kapasiteleri, GTİP / HS Kodu (6907), CE / ISO sertifikaları.',
    accent: '#2563eb',
    mockupImg: '/renders/luxury_bathroom_natural_oak.jpg',
    bgColor: '#ffffff',
    format: 'A4 Dikey Çok Dilli'
  },
  {
    id: 'verona',
    name: 'Verona Natural Stone & Marble',
    badge: 'Bookmatch & Damar Eşleme',
    tag: 'İTALYAN MERMER & REZİDANS',
    desc: 'İtalyan Verona ocakları kalitesinde lüks doğal taş lookbook: Simetrik bookmatch kelebek damar takibi, altın parıltılı lüks iç mekanlar, honlu/cilalı yüzey karşılaştırmaları.',
    accent: '#c59b27',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    bgColor: '#18181b',
    format: 'A4 Dikey Bookmatch Lookbook'
  },
  {
    id: 'nordic',
    name: 'Nordic Concrete & Industrial Loft',
    badge: 'Çimento & Terrazzo Monograf',
    tag: 'BRÜT BETON & LOFT MİMARİ',
    desc: 'Modern endüstriyel mimari için minimalist brüt beton serisi: Geniş antrasit/gri spektrumlar, çimento ve mikro-terrazzo dokuları ile çağdaş kentsel mekan tasarım rehberi.',
    accent: '#475569',
    mockupImg: '/renders/luxury_bathroom_loft_beton.jpg',
    bgColor: '#f8fafc',
    format: 'A4 Dikey Minimalist Grid'
  },
  {
    id: 'artisan',
    name: 'Artisan Boutique & Mediterranean Zellige',
    badge: 'Rölyef & Parlak Sır Koleksiyonu',
    tag: 'AKDENİZ ÇİNİ & BUTİK KARO',
    desc: 'Geleneksel Akdeniz zellige ve butik seramik sanatı: Parlak dalgalı sırlar, canlı kobalt & adaçayı tonları, balıksırtı/altıgen dizilimler ve otel/kafe butik mizanpajı.',
    accent: '#0d9488',
    mockupImg: '/renders/modern_living_natural_oak.jpg',
    bgColor: '#fdfbf7',
    format: 'A4 Dikey Butik Çini'
  },
  {
    id: 'outdoor',
    name: 'Outdoor 20mm & Landscape Architecture',
    badge: 'R11-C Kaymazlık & Kuru Montaj',
    tag: '2 CM KALIN DIŞ MEKAN & TERAS',
    desc: 'Bahçe, teras, havuz kenarları için 20 mm ekstra mukavemetli porselen plaka şartnamesi: Yükseltilmiş döşeme ayakları, çim/çakıl üzeri kuru montaj şeması ve don dayanımı.',
    accent: '#15803d',
    mockupImg: '/renders/luxury_bathroom_natural_oak.jpg',
    bgColor: '#ffffff',
    format: 'A4 Dikey Peyzaj Şartnamesi'
  }
];

export const generateTemplateElementsForPage = (templateId, pageType, brandInfo = {}, product = null) => {
  const brandName = (brandInfo.name || 'SERAMİK').toUpperCase();
  const prodName = product?.name || 'CALACATTA GOLD';
  const prodImg = product?.imageUrl || product?.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
  const prodDim = product?.width && product?.height ? `${product.width}×${product.height} cm` : '120×280 cm';
  const prodFinish = product?.finish || 'Full Lappato';
  const prodCode = product?.code || product?.sku || 'SER-2026';

  switch (templateId) {
    case 'deco':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 30,
          content: `${brandName} EXCLUSIVE • 2026 COLLECTION`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.3em',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 85,
          width: 495,
          height: 50,
          content: prodName,
          fontSize: 28,
          fontWeight: '900',
          letterSpacing: '0.08em',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 145,
          width: 495,
          height: 420,
          src: prodImg,
          borderRadius: 4,
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 50,
          y: 580,
          width: 495,
          height: 180,
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 600,
          width: 445,
          height: 140,
          content: `EBAT & DETAYLAR: ${prodDim} • ${prodFinish} • Kod: ${prodCode}\n\nDEKOFON VE YÜZEY SEÇENEKLERİ:\n• Kare Monografik Yüzey (REC / M)\n• Uyumlu Bordür ve Mozaik Seçenekleri\n• Banyo, Mutfak ve Otel Projeleri İçin Lüks Doku`,
          fontSize: 12,
          fontWeight: '600',
          color: '#334155',
          align: 'left',
          locked: false
        }
      ];

    case 'lidya':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 30,
          content: `${brandName} PRO TECHNIC • MODULAR ARCHITECTURE`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.2em',
          color: '#059669',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 85,
          width: 495,
          height: 45,
          content: `${prodName} — COLOUR ENGINEERING`,
          fontSize: 24,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 140,
          width: 320,
          height: 400,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 385,
          y: 140,
          width: 160,
          height: 400,
          color: '#ecfdf5',
          borderColor: '#a7f3d0',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 395,
          y: 155,
          width: 140,
          height: 370,
          content: `TEKNİK PARAMETRELER:\n\n• Ebat: ${prodDim}\n• RAL Kodu: RAL 7016\n• Kaymazlık: R10 / R11\n• Yüzey: ${prodFinish}\n• Su Emme: ≤ %0.1\n• Kırılma: ≥ 2500 N\n• PEI Değeri: Sınıf 4\n• Tel Kafes Modüler\n• BIM / Revit Uyumlu`,
          fontSize: 11,
          fontWeight: '600',
          color: '#065f46',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-6`,
          type: 'box',
          x: 50,
          y: 560,
          width: 495,
          height: 190,
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          locked: false
        },
        {
          id: `el-${Date.now()}-7`,
          type: 'text',
          x: 75,
          y: 580,
          width: 445,
          height: 150,
          content: 'ŞARTNAME NOTU:\nKamusal projeler, metro istasyonları, havalimanları ve yoğun yaya trafiğine sahip ticari alanlar için TS EN 14411 Ek G standartlarına tam uygun mimari porselen karo şartnamesi.',
          fontSize: 12,
          fontWeight: '500',
          color: '#1e293b',
          align: 'left',
          locked: false
        }
      ];

    case 'verona':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 25,
          content: `${brandName} • VERONA NATURAL MARBLE LOOKBOOK`,
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: '0.25em',
          color: '#c59b27',
          align: 'center',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 80,
          width: 495,
          height: 45,
          content: `${prodName} BOOKMATCH A / B`,
          fontSize: 26,
          fontWeight: '800',
          color: '#ffffff',
          align: 'center',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 135,
          width: 240,
          height: 460,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'image',
          x: 305,
          y: 135,
          width: 240,
          height: 460,
          src: '/renders/luxury_bathroom_calacatta_gold.jpg',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'box',
          x: 50,
          y: 610,
          width: 495,
          height: 160,
          color: '#27272a',
          borderColor: '#3f3f46',
          locked: false
        },
        {
          id: `el-${Date.now()}-6`,
          type: 'text',
          x: 75,
          y: 630,
          width: 445,
          height: 120,
          content: `DAMAR EŞLEŞTİRME & HEVESKÂR DETAY:\n• Ebat: ${prodDim} Dev Plaka Porselen\n• Yüzey: Full Lappato Parlak Ayna Cilası\n• Kitap Açılımı (Bookmatch) Simetrisi ile Kesintisiz Damar Takibi\n• Lüks Rezidans, Lobi, Şömine ve Banyo Zemin/Duvar Uygulamaları`,
          fontSize: 12,
          fontWeight: '500',
          color: '#e4e4e7',
          align: 'left',
          locked: false
        }
      ];

    case 'nordic':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 25,
          content: `${brandName} • NORDIC ARCHITECTURAL CONCRETE`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.2em',
          color: '#475569',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 80,
          width: 495,
          height: 45,
          content: `${prodName} — BRÜT BETON & LOFT`,
          fontSize: 24,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 135,
          width: 495,
          height: 390,
          src: '/renders/luxury_bathroom_loft_beton.jpg',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 50,
          y: 545,
          width: 495,
          height: 210,
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 565,
          width: 445,
          height: 170,
          content: `İSKANDİNAV MİMARİ SERİSİ:\n• Ebat Seçenekleri: 60×120 cm / 80×80 cm / 120×120 cm\n• Yüzey: Mat Rölyefli / Doğal Çimento Dokusu\n• Kaymazlık: R10 A+B\n• Akustik ve Dayanıklılık: Yüksek Aşınma Mukavemeti PEI 4\n• Kullanım: Loft Daireler, Ofisler, Kafeler ve Modern Konutlar`,
          fontSize: 12,
          fontWeight: '500',
          color: '#1e293b',
          align: 'left',
          locked: false
        }
      ];

    case 'artisan':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 25,
          content: `${brandName} • ARTISAN MEDITERRANEAN ZELLIGE`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.2em',
          color: '#0d9488',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 80,
          width: 495,
          height: 45,
          content: `${prodName} — BUTİK SIRLI KARO`,
          fontSize: 24,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 135,
          width: 495,
          height: 400,
          src: '/renders/modern_living_natural_oak.jpg',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 50,
          y: 550,
          width: 495,
          height: 200,
          color: '#f0fdfa',
          borderColor: '#99f6e4',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 570,
          width: 445,
          height: 160,
          content: `GELENEKSEL EL İŞÇİLİĞİ VE PARLAK SIR:\n• Modüler Formlar: 7.5×30 cm Balıksırtı / 15×15 cm Zellige\n• Yüzey Parlaklığı: Dalgalı Parlak El İşi Sır (Artisanal Glaze)\n• Renk Varyasyonu: V3 - Zengin Ton Geçişleri\n• Kullanım Alanı: Butik Oteller, Mutfak Tezgah Arası, Banyo Nişleri`,
          fontSize: 12,
          fontWeight: '600',
          color: '#134e4a',
          align: 'left',
          locked: false
        }
      ];

    case 'outdoor':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 25,
          content: `${brandName} • 20MM OUTDOOR & LANDSCAPE`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.2em',
          color: '#15803d',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 80,
          width: 495,
          height: 45,
          content: `${prodName} — 2 CM DIŞ MEKAN`,
          fontSize: 24,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 135,
          width: 495,
          height: 380,
          src: '/renders/luxury_bathroom_natural_oak.jpg',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 50,
          y: 535,
          width: 495,
          height: 220,
          color: '#f0fdf4',
          borderColor: '#bbf7d0',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 555,
          width: 445,
          height: 180,
          content: `20 MM EKSTRA MUKAVEMETLİ DIŞ MEKAN STANDARDI:\n• Kalınlık: 20 mm (Kırılma Yükü: > 10.000 N)\n• Montaj Türü: Çim / Çakıl Üzeri Kuru Montaj & Yükseltilmiş Döşeme\n• Kaymazlık Sınıfı: R11 A+B+C (Islak Zemin & Havuz Kenarı)\n• Dayanım: %100 Donmaya, Tuza, Klora ve Ağır Yüke Dirençli\n• Ebat: 60×60×2 cm / 60×120×2 cm`,
          fontSize: 12,
          fontWeight: '600',
          color: '#14532d',
          align: 'left',
          locked: false
        }
      ];

    case 'spec-sheet':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 35,
          content: `${brandName} ARCHITECTURAL SPECIFICATION`,
          fontSize: 20,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 85,
          width: 495,
          height: 25,
          content: 'TS EN 14411 EK G — GRUP BIa PORSELEN TEKNİK ŞARTNAME MATRİSİ',
          fontSize: 10,
          fontWeight: '700',
          color: '#0284c7',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'box',
          x: 50,
          y: 120,
          width: 495,
          height: 640,
          color: '#f8fafc',
          borderColor: '#cbd5e1',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'text',
          x: 75,
          y: 145,
          width: 445,
          height: 590,
          content: `ÜRÜN GRUBU: ${prodName} (${prodDim})\n\n1. FİZİKSEL & MEKANİK PERFORMANS:\n• Su Emme Oranı: ≤ %0.08\n• Kırılma Dayanımı: ≥ 2400 N\n• Eğilme Mukavemeti: ≥ 48 N/mm²\n• Yüzey Sertliği (Mohs): 7 - 8\n\n2. GÜVENLİK VE STANDARTLAR:\n• Kaymazlık Değeri: R10 / R11 seçenekleri\n• PEI Aşınma Dayanımı: Sınıf 4 (Yoğun Trafik)\n• Kimyasal ve Asit Direnci: A Sınıfı\n• Yanmazlık Standardı: A1FL (Hiç Yanmaz)\n\n3. LOJİSTİK VE KUTU BİLGİSİ:\n• Koli Metrajı: 2.88 m²\n• Koli İçi Adet: 2 Adet\n• Palet Ağırlığı: 1140 kg / 24 Kutu`,
          fontSize: 12,
          fontWeight: '500',
          color: '#1e293b',
          align: 'left',
          locked: false
        }
      ];

    case 'showroom':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 35,
          content: `${brandName} SHOWROOM & MAĞAZA KATALOĞU`,
          fontSize: 22,
          fontWeight: '800',
          color: '#0f172a',
          align: 'center',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'image',
          x: 50,
          y: 105,
          width: 235,
          height: 420,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 310,
          y: 105,
          width: 235,
          height: 420,
          src: '/renders/luxury_bathroom_albatros_antrasit.jpg',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'text',
          x: 50,
          y: 545,
          width: 235,
          height: 100,
          content: `${prodName}\n${prodDim} • ${prodFinish}\nÖneri: Banyo / Mutfak`,
          fontSize: 13,
          fontWeight: '700',
          color: '#0f172a',
          align: 'center',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 310,
          y: 545,
          width: 235,
          height: 100,
          content: `ALBATROS ANTRASİT\n120×280 cm • Mat\nÖneri: Salon / Lobi`,
          fontSize: 13,
          fontWeight: '700',
          color: '#0f172a',
          align: 'center',
          locked: false
        }
      ];

    case 'global-export':
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 30,
          content: `${brandName} • GLOBAL EXPORT SPECIFICATION`,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: '0.2em',
          color: '#2563eb',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 50,
          y: 85,
          width: 495,
          height: 45,
          content: `${prodName} (HS CODE: 6907.21)`,
          fontSize: 22,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'image',
          x: 50,
          y: 140,
          width: 495,
          height: 350,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'box',
          x: 50,
          y: 505,
          width: 495,
          height: 250,
          color: '#eff6ff',
          borderColor: '#bfdbfe',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 525,
          width: 445,
          height: 210,
          content: `INTERNATIONAL CONTAINER LOADING (20ft / 40ft):\n• Slab Dimensions: ${prodDim} / Thickness: 9 mm\n• Surface Finish: ${prodFinish} / Rectified\n• 20ft Container Capacity: 22 Pallets (~1,850 m²)\n• 40ft HC Container Capacity: 26 Pallets (~2,180 m²)\n• Compliance: CE Certificate, ISO 9001, TS EN 14411 Group BIa\n• Export Packaging: Euro Wooden Crates with Protective Film`,
          fontSize: 12,
          fontWeight: '600',
          color: '#1e3a8a',
          align: 'left',
          locked: false
        }
      ];

    case 'milano':
    default:
      return [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 45,
          width: 400,
          height: 40,
          content: prodName,
          fontSize: 26,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 455,
          y: 50,
          width: 90,
          height: 26,
          content: 'MILANO SLAB',
          fontSize: 10,
          fontWeight: '800',
          color: '#ffffff',
          bgColor: '#b4823c',
          align: 'center',
          locked: false
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'text',
          x: 50,
          y: 85,
          width: 495,
          height: 25,
          content: `${brandName} İtalyan mimari serisi • ${prodDim} • ${prodFinish}`,
          fontSize: 12,
          fontWeight: '600',
          color: '#64748b',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'image',
          x: 50,
          y: 120,
          width: 495,
          height: 380,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'box',
          x: 50,
          y: 525,
          width: 495,
          height: 240,
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          locked: false
        },
        {
          id: `el-${Date.now()}-6`,
          type: 'text',
          x: 75,
          y: 545,
          width: 445,
          height: 195,
          content: `TEKNİK STANDARTLAR:\n• Ebat: ${prodDim}\n• Kalınlık: 6 mm / 9 mm İnce Porselen\n• Yüzey: ${prodFinish} / Rektifiyeli\n• Kaymazlık: R9 / PEI 4\n• Kullanım: Lobi, Banyo, Mutfak Tezgahı, Dış Cephe\n• Sertifikasyon: TS EN 14411 Grup BIa`,
          fontSize: 13,
          fontWeight: '500',
          color: '#1e293b',
          align: 'left',
          locked: false
        }
      ];
  }
};

// ============================================================================
// MATBAA DÜZEYİNDE HAZIR MİZANPAJ ŞABLONLARI (PRESET LAYOUT TEMPLATES)
// ============================================================================
const PRESET_TEMPLATES = [
  {
    id: 'cover-milano',
    name: 'Milano Minimalist Kapak',
    badge: 'Kapak',
    category: 'cover',
    desc: 'Lüks koyu slate zemin, altın tipografi ve büyük mimari mekan fotoğrafı.',
    bgColor: '#18181b',
    elements: [
      {
        id: 'el-c1',
        type: 'text',
        x: 50,
        y: 60,
        width: 495,
        height: 25,
        content: 'BİEN SERAMİK • ARCHITECTURAL MONOGRAPH',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: '0.25em',
        color: '#b4823c',
        align: 'center',
        locked: false
      },
      {
        id: 'el-c2',
        type: 'text',
        x: 50,
        y: 95,
        width: 495,
        height: 80,
        content: '2026 GENEL KOLEKSİYON',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: '0.05em',
        color: '#ffffff',
        align: 'center',
        locked: false
      },
      {
        id: 'el-c3',
        type: 'line',
        x: 235,
        y: 185,
        width: 125,
        height: 2,
        color: '#b4823c',
        locked: false
      },
      {
        id: 'el-c4',
        type: 'image',
        x: 50,
        y: 215,
        width: 495,
        height: 510,
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
        borderRadius: 0,
        locked: false
      },
      {
        id: 'el-c5',
        type: 'text',
        x: 50,
        y: 755,
        width: 495,
        height: 35,
        content: 'PORSELEN DEV PLAKALAR • DOĞAL TAŞ SERİLERİ • TS EN 14411',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: '0.15em',
        color: '#a1a1aa',
        align: 'center',
        locked: false
      }
    ]
  },
  {
    id: 'product-single-slab',
    name: '120×280 Dev Plaka & Mekan',
    badge: 'Ürün',
    category: 'product',
    desc: 'Büyük mekan görseli, yan yana dikey plaka silueti ve teknik tablo.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-s1',
        type: 'text',
        x: 50,
        y: 45,
        width: 400,
        height: 40,
        content: 'CALACATTA GOLD',
        fontSize: 26,
        fontWeight: '800',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-s2',
        type: 'text',
        x: 455,
        y: 50,
        width: 90,
        height: 26,
        content: 'BOOKMATCH',
        fontSize: 10,
        fontWeight: '800',
        color: '#ffffff',
        bgColor: '#0f172a',
        align: 'center',
        locked: false
      },
      {
        id: 'el-s3',
        type: 'text',
        x: 50,
        y: 85,
        width: 495,
        height: 25,
        content: 'İtalyan mermer dokusu • 120x280 cm • Full Lappato & Mat',
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        align: 'left',
        locked: false
      },
      {
        id: 'el-s4',
        type: 'image',
        x: 50,
        y: 120,
        width: 495,
        height: 380,
        src: '/renders/modern_living_natural_oak.jpg',
        locked: false
      },
      {
        id: 'el-s5',
        type: 'box',
        x: 50,
        y: 525,
        width: 495,
        height: 240,
        color: '#f8fafc',
        borderColor: '#e2e8f0',
        locked: false
      },
      {
        id: 'el-s6',
        type: 'text',
        x: 75,
        y: 545,
        width: 445,
        height: 195,
        content: 'TEKNİK STANDARTLAR:\n• Ebat: 120×280 cm / 60×120 cm\n• Kalınlık: 6 mm İnce Porselen\n• Yüzey: Full Lappato Parlak / Rektifiyeli\n• Kaymazlık: R9 / PEI 4\n• Kullanım: Lobi, Banyo, Mutfak Tezgahı, Dış Cephe',
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'product-dual-grid',
    name: '2\'li Karşılaştırmalı Koleksiyon',
    badge: 'Koleksiyon',
    category: 'product',
    desc: 'Yan yana iki seramik modelinin görseli, ebat ve renk bilgisi.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-d1',
        type: 'text',
        x: 50,
        y: 50,
        width: 495,
        height: 35,
        content: 'MERMER DOKULU PORSELEN SERİLERİ',
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
        align: 'center',
        locked: false
      },
      {
        id: 'el-d2',
        type: 'image',
        x: 50,
        y: 105,
        width: 235,
        height: 420,
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
        locked: false
      },
      {
        id: 'el-d3',
        type: 'image',
        x: 310,
        y: 105,
        width: 235,
        height: 420,
        src: '/renders/luxury_bathroom_albatros_antrasit.jpg',
        locked: false
      },
      {
        id: 'el-d4',
        type: 'text',
        x: 50,
        y: 545,
        width: 235,
        height: 80,
        content: 'CALACATTA BEYAZ\n120×280 cm • Parlak\nKod: 55018167RP',
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        align: 'center',
        locked: false
      },
      {
        id: 'el-d5',
        type: 'text',
        x: 310,
        y: 545,
        width: 235,
        height: 80,
        content: 'ALBATROS ANTRASİT\n120×280 cm • Mat\nKod: 55018244RP',
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        align: 'center',
        locked: false
      }
    ]
  },
  {
    id: 'specs-matrix',
    name: 'Teknik Şartname & Standartlar',
    badge: 'Şartname',
    category: 'specs',
    desc: 'TS EN 14411 uygunluk tablosu, kutu metrajları ve lojistik matrisi.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-m1',
        type: 'text',
        x: 50,
        y: 50,
        width: 495,
        height: 40,
        content: 'TEKNİK ÖZELLİKLER VE ŞARTNAME MATRİSİ',
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-m2',
        type: 'text',
        x: 50,
        y: 90,
        width: 495,
        height: 25,
        content: 'TS EN 14411 EK G — GRUP BIa PORSELEN KARO STANDARDI',
        fontSize: 11,
        fontWeight: '700',
        color: '#b4823c',
        align: 'left',
        locked: false
      },
      {
        id: 'el-m3',
        type: 'box',
        x: 50,
        y: 130,
        width: 495,
        height: 600,
        color: '#f8fafc',
        borderColor: '#cbd5e1',
        locked: false
      },
      {
        id: 'el-m4',
        type: 'text',
        x: 75,
        y: 155,
        width: 445,
        height: 550,
        content: 'STANDART TEST KRİTERLERİ (EN ISO 10545):\n\n• Su Emme Oranı: ≤ %0.1 (Yüksek Porselen Sınıfı)\n• Kırılma Dayanımı: ≥ 2200 N\n• Eğilme Mukavemeti: ≥ 45 N/mm²\n• Yüzey Aşınma Dayanımı (PEI): Sınıf 4 - 5\n• Derin Aşınma Dayanımı: ≤ 135 mm³\n• Isıl Şok Dayanımı: Tam Dayanıklı\n• Donma Dayanımı: Donmaya Karşı Tam Dirençli\n• Leke Tutma Dayanımı: Minimum Sınıf 5\n• Kimyasallara Direnç: A Sınıfı\n• Kaymazlık (DIN 51130): R9 / R10 / R11 seçenekleri\n\nPAKETLEME VE LOJİSTİK BİLGİLERİ:\n• Kutu İçi Adet: 1 Plaka\n• Kutu Metrajı: 3.36 m² (120x280 cm)\n• Palet Kapasitesi: 24 Kutu (80.64 m²)\n• Palet Ağırlığı: ~1180 kg',
        fontSize: 12,
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  }
];

const DEFAULT_PAGES = [
  PRESET_TEMPLATES[0],
  PRESET_TEMPLATES[1]
];

const BADGE_PRESETS = [
  'YENİ KOLEKSİYON',
  'BOOKMATCH A/B',
  'DEV PLAKA 120×280',
  '160×320 SLAB',
  'R10 A+B KAYMAZ',
  'FULL LAPPATO',
  'EXCLUSIVE',
  'TS EN 14411'
];

export default function CatalogVisualCanvasEditor({
  initialPages,
  brandProducts = [],
  brandInfo = {},
  currentTemplateId = 'milano',
  onSelectTemplate,
  onChangePages,
  onSaveDraft
}) {
  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPages) && initialPages.length > 0) return initialPages;
    return DEFAULT_PAGES;
  });

  const [activePageIdx, setActivePageIdx] = useState(0);
  const [selectedElId, setSelectedElId] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('templates'); // 'templates' | 'products' | 'pages' | 'badges'
  const [templateSubTab, setTemplateSubTab] = useState('concepts'); // 'concepts' (Ana Şablonlar) | 'layouts' (Sayfa Mizanpajları)
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId || 'milano');
  const [showGrid, setShowGrid] = useState(true);
  const [showBleed, setShowBleed] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // 0.75, 1, 1.25
  const [productSearch, setProductSearch] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Kaydedildi');

  useEffect(() => {
    if (currentTemplateId) {
      setSelectedTemplateId(currentTemplateId);
    }
  }, [currentTemplateId]);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const canvasRef = useRef(null);
  const dragInfoRef = useRef(null);

  const currentPage = pages[activePageIdx] || pages[0];
  const selectedEl = currentPage?.elements?.find((e) => e.id === selectedElId) || null;

  // Sync back to parent
  useEffect(() => {
    if (onChangePages) {
      onChangePages(pages);
    }
    setAutoSaveStatus('Otomatik kaydedildi');
  }, [pages]);

  const pushHistory = (newPages) => {
    setHistory((prev) => [...prev.slice(-19), pages]);
    setFuture([]);
    setPages(newPages);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [pages, ...prev]);
    setPages(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, pages]);
    setPages(next);
  };

  // Add an element
  const addElement = (type, extra = {}) => {
    const newEl = {
      id: `el-${Date.now()}`,
      type,
      x: 60,
      y: 120,
      width: type === 'text' ? 360 : type === 'line' ? 240 : 260,
      height: type === 'text' ? 50 : type === 'line' ? 3 : 200,
      content: type === 'text' ? 'Başlık veya Metin Alanı' : '',
      fontSize: 16,
      fontWeight: '700',
      color: type === 'box' ? '#f8fafc' : currentPage.bgColor === '#18181b' ? '#ffffff' : '#0f172a',
      borderColor: '#cbd5e1',
      align: 'left',
      src: extra.src || '/renders/luxury_bathroom_calacatta_gold.jpg',
      locked: false,
      ...extra
    };

    const updated = pages.map((p, idx) =>
      idx === activePageIdx ? { ...p, elements: [...(p.elements || []), newEl] } : p
    );
    pushHistory(updated);
    setSelectedElId(newEl.id);
  };

  const updateSelectedElement = (patch) => {
    if (!selectedElId) return;
    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        elements: p.elements.map((el) => (el.id === selectedElId ? { ...el, ...patch } : el))
      };
    });
    pushHistory(updated);
  };

  const deleteSelectedElement = () => {
    if (!selectedElId) return;
    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        elements: p.elements.filter((el) => el.id !== selectedElId)
      };
    });
    pushHistory(updated);
    setSelectedElId(null);
  };

  // Alignment helpers (Center horizontal, align left, etc.)
  const alignElement = (alignment) => {
    if (!selectedEl) return;
    let patch = {};
    if (alignment === 'center-h') {
      patch = { x: Math.round((595 - selectedEl.width) / 2) };
    } else if (alignment === 'left') {
      patch = { x: 50 };
    } else if (alignment === 'right') {
      patch = { x: 595 - 50 - selectedEl.width };
    } else if (alignment === 'center-v') {
      patch = { y: Math.round((842 - selectedEl.height) / 2) };
    } else if (alignment === 'top') {
      patch = { y: 50 };
    } else if (alignment === 'bottom') {
      patch = { y: 842 - 50 - selectedEl.height };
    }
    updateSelectedElement(patch);
  };

  const changeLayerOrder = (direction) => {
    if (!selectedElId) return;
    const els = [...currentPage.elements];
    const idx = els.findIndex((e) => e.id === selectedElId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= els.length) return;
    const temp = els[idx];
    els[idx] = els[targetIdx];
    els[targetIdx] = temp;

    const updated = pages.map((p, i) => (i === activePageIdx ? { ...p, elements: els } : p));
    pushHistory(updated);
  };

  // Apply a preset template to the active page
  const handleApplyPresetTemplate = (preset) => {
    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        title: preset.name,
        type: preset.category,
        bgColor: preset.bgColor,
        elements: preset.elements.map((el) => ({
          ...el,
          id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        }))
      };
    });
    pushHistory(updated);
    setSelectedElId(null);
  };

  // Master Template Handlers
  const handleSelectMasterTemplate = (tmplId) => {
    setSelectedTemplateId(tmplId);
    if (onSelectTemplate) {
      onSelectTemplate(tmplId);
    }
    const tmplObj = CATALOG_MASTER_TEMPLATES.find((t) => t.id === tmplId);
    setAutoSaveStatus(`Aktif şablon: ${tmplObj?.name || tmplId}`);
  };

  const handleApplyMasterTemplateToPage = (tmplId) => {
    const tmplObj = CATALOG_MASTER_TEMPLATES.find((t) => t.id === tmplId) || CATALOG_MASTER_TEMPLATES[0];
    handleSelectMasterTemplate(tmplId);
    const sampleProduct = brandProducts[activePageIdx % Math.max(1, brandProducts.length)] || brandProducts[0] || null;
    const elements = generateTemplateElementsForPage(tmplId, 'product', brandInfo, sampleProduct);

    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        title: `${tmplObj.name} - Sayfa #${idx + 1}`,
        type: 'product',
        bgColor: tmplObj.bgColor || '#ffffff',
        elements
      };
    });
    pushHistory(updated);
    setSelectedElId(null);
    setAutoSaveStatus(`"${tmplObj.name}" sayfaya uygulandı`);
  };

  const handleApplyMasterTemplateToAllPages = (tmplId) => {
    const tmplObj = CATALOG_MASTER_TEMPLATES.find((t) => t.id === tmplId) || CATALOG_MASTER_TEMPLATES[0];
    handleSelectMasterTemplate(tmplId);
    const brandName = (brandInfo.name || 'SERAMİK').toUpperCase();
    const p1 = brandProducts[0] || null;
    const p2 = brandProducts[1] || brandProducts[0] || null;

    const newPages = [
      // 1. Kapak
      {
        id: `page-cover-${Date.now()}`,
        title: `${tmplObj.name} • Kapak`,
        type: 'cover',
        bgColor: tmplObj.bgColor || '#18181b',
        elements: [
          {
            id: `el-cov-1`,
            type: 'text',
            x: 50,
            y: 60,
            width: 495,
            height: 25,
            content: `${brandName} • 2026 GENERAL CATALOGUE`,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: '0.25em',
            color: tmplObj.accent || '#b4823c',
            align: 'center',
            locked: false
          },
          {
            id: `el-cov-2`,
            type: 'text',
            x: 50,
            y: 95,
            width: 495,
            height: 65,
            content: tmplObj.name.toUpperCase(),
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: '0.05em',
            color: tmplObj.bgColor === '#18181b' || tmplObj.bgColor === '#1c1917' ? '#ffffff' : '#0f172a',
            align: 'center',
            locked: false
          },
          {
            id: `el-cov-3`,
            type: 'line',
            x: 235,
            y: 175,
            width: 125,
            height: 2,
            color: tmplObj.accent || '#b4823c',
            locked: false
          },
          {
            id: `el-cov-4`,
            type: 'image',
            x: 50,
            y: 200,
            width: 495,
            height: 520,
            src: tmplObj.mockupImg || '/renders/luxury_bathroom_calacatta_gold.jpg',
            borderRadius: 0,
            locked: false
          },
          {
            id: `el-cov-5`,
            type: 'text',
            x: 50,
            y: 745,
            width: 495,
            height: 35,
            content: `PORSELEN DEV PLAKALAR • ${tmplObj.tag} • TS EN 14411`,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: '0.15em',
            color: '#a1a1aa',
            align: 'center',
            locked: false
          }
        ]
      },
      // 2. Ürün Sayfası 1
      {
        id: `page-prod1-${Date.now()}`,
        title: `${tmplObj.name} • Ürün 1`,
        type: 'product',
        bgColor: tmplObj.bgColor === '#18181b' || tmplObj.bgColor === '#1c1917' ? tmplObj.bgColor : '#ffffff',
        elements: generateTemplateElementsForPage(tmplId, 'product', brandInfo, p1)
      },
      // 3. Ürün Sayfası 2
      {
        id: `page-prod2-${Date.now()}`,
        title: `${tmplObj.name} • Ürün 2`,
        type: 'product',
        bgColor: tmplObj.bgColor === '#18181b' || tmplObj.bgColor === '#1c1917' ? tmplObj.bgColor : '#ffffff',
        elements: generateTemplateElementsForPage(tmplId, 'product', brandInfo, p2)
      },
      // 4. Teknik Şartname & Matris
      {
        id: `page-specs-${Date.now()}`,
        title: `${tmplObj.name} • Teknik Şartname`,
        type: 'specs',
        bgColor: '#ffffff',
        elements: PRESET_TEMPLATES.find((p) => p.id === 'specs-matrix')?.elements || []
      },
      // 5. Arka Kapak & İletişim
      {
        id: `page-contact-${Date.now()}`,
        title: `${tmplObj.name} • İletişim & QR`,
        type: 'contact',
        bgColor: tmplObj.bgColor === '#18181b' || tmplObj.bgColor === '#1c1917' ? tmplObj.bgColor : '#090d16',
        elements: [
          {
            id: `el-con-1`,
            type: 'text',
            x: 50,
            y: 120,
            width: 495,
            height: 40,
            content: brandName,
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: '0.1em',
            color: '#ffffff',
            align: 'center',
            locked: false
          },
          {
            id: `el-con-2`,
            type: 'line',
            x: 235,
            y: 180,
            width: 125,
            height: 2,
            color: tmplObj.accent || '#b4823c',
            locked: false
          },
          {
            id: `el-con-3`,
            type: 'text',
            x: 50,
            y: 220,
            width: 495,
            height: 120,
            content: 'DİJİTAL KATALOG & B2B MİMARİ MERKEZİ\n\nFabrika: Organize Sanayi Bölgesi\nWeb: www.seramikbak.com\nE-Posta: mimari@seramikbak.com',
            fontSize: 14,
            fontWeight: '600',
            color: '#cbd5e1',
            align: 'center',
            locked: false
          },
          {
            id: `el-con-4`,
            type: 'box',
            x: 217,
            y: 380,
            width: 160,
            height: 160,
            color: '#ffffff',
            borderColor: '#e2e8f0',
            borderRadius: 16,
            locked: false
          },
          {
            id: `el-con-5`,
            type: 'text',
            x: 50,
            y: 570,
            width: 495,
            height: 40,
            content: 'Kataloğu Mobil Cihazınızda 3D İncelemek İçin QR Kodu Okutun',
            fontSize: 12,
            fontWeight: '700',
            color: '#94a3b8',
            align: 'center',
            locked: false
          }
        ]
      }
    ];

    pushHistory(newPages);
    setActivePageIdx(0);
    setSelectedElId(null);
    setAutoSaveStatus(`Tüm katalog "${tmplObj.name}" şablonuna dönüştürüldü`);
  };

  // Insert real brand product onto canvas with aesthetic layout
  const handleInsertProduct = (prod) => {
    const prodImg = prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
    const mainText = `${prod.name}\n${prod.width || 60}×${prod.height || 120} cm • ${prod.finish || 'Parlak'}`;
    const skuText = `SKU: ${prod.sku || prod.code || 'BN-5501'}`;

    // Add image
    addElement('image', {
      src: prodImg,
      x: 50,
      y: 120,
      width: 495,
      height: 380
    });

    // Add info banner
    setTimeout(() => {
      addElement('text', {
        content: mainText,
        x: 50,
        y: 520,
        width: 350,
        height: 60,
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a'
      });
      addElement('text', {
        content: skuText,
        x: 420,
        y: 525,
        width: 125,
        height: 30,
        fontSize: 12,
        fontWeight: '700',
        color: '#b4823c',
        align: 'right'
      });
    }, 40);
  };

  // Keyboard navigation & Shortcuts (Delete, Escape, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElId) {
          e.preventDefault();
          deleteSelectedElement();
        }
      } else if (e.key === 'Escape') {
        setSelectedElId(null);
      } else if (selectedEl) {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateSelectedElement({ x: Math.max(0, selectedEl.x - step) });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateSelectedElement({ x: Math.min(595 - selectedEl.width, selectedEl.x + step) });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateSelectedElement({ y: Math.max(0, selectedEl.y - step) });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateSelectedElement({ y: Math.min(842 - selectedEl.height, selectedEl.y + step) });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElId, selectedEl]);

  // Dragging & Resizing Handlers
  const handleMouseDownElement = (e, el, mode = 'move') => {
    e.stopPropagation();
    setSelectedElId(el.id);
    if (el.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const origW = el.width;
    const origH = el.height;

    dragInfoRef.current = { id: el.id, mode, startX, startY, origX, origY, origW, origH };

    const handleMouseMove = (moveEvent) => {
      if (!dragInfoRef.current) return;
      const dx = (moveEvent.clientX - dragInfoRef.current.startX) / zoomLevel;
      const dy = (moveEvent.clientY - dragInfoRef.current.startY) / zoomLevel;

      const snap = (val) => (showGrid ? Math.round(val / 5) * 5 : Math.round(val));

      setPages((prevPages) =>
        prevPages.map((p, pIdx) => {
          if (pIdx !== activePageIdx) return p;
          return {
            ...p,
            elements: p.elements.map((item) => {
              if (item.id !== dragInfoRef.current.id) return item;
              if (dragInfoRef.current.mode === 'move') {
                return {
                  ...item,
                  x: Math.max(0, Math.min(595 - item.width, snap(dragInfoRef.current.origX + dx))),
                  y: Math.max(0, Math.min(842 - item.height, snap(dragInfoRef.current.origY + dy)))
                };
              } else {
                return {
                  ...item,
                  width: Math.max(30, snap(dragInfoRef.current.origW + dx)),
                  height: Math.max(4, snap(dragInfoRef.current.origH + dy))
                };
              }
            })
          };
        })
      );
    };

    const handleMouseUp = () => {
      dragInfoRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return brandProducts;
    const q = productSearch.toLowerCase();
    return brandProducts.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [brandProducts, productSearch]);

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-neutral-100 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP STUDIO CONTROL BAR (SİMETRİK VE ŞIK IN-DESIGN / FIGMA ARAÇ ÇUBUĞU)   */}
      {/* ========================================================================= */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between gap-3 text-xs">
        {/* Left: Studio Branding & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-extrabold tracking-wide uppercase text-white font-mono text-[11px]">
              STUDIO PRO
            </span>
          </div>

          <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

          {/* Active Template Badge & Quick Switcher */}
          <button
            type="button"
            onClick={() => {
              setActiveLeftTab('templates');
              setTemplateSubTab('concepts');
            }}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-800 hover:border-amber-400/50 transition cursor-pointer text-xs"
            title="Şablon Değiştir"
          >
            <LayoutTemplate size={13} className="text-amber-400" />
            <span className="text-[10px] text-neutral-400 font-medium hidden md:inline">Şablon:</span>
            <span className="font-bold text-amber-300 truncate max-w-[130px]">
              {CATALOG_MASTER_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Milano Lookbook'}
            </span>
          </button>

          <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

          {/* Zoom controls */}
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer"
              title="Uzaklaş"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-neutral-300 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition cursor-pointer"
              title="Yakınlaş"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[10px] font-bold text-amber-400 hover:bg-neutral-800 rounded transition cursor-pointer"
              title="100% Sığdır"
            >
              1:1
            </button>
          </div>
        </div>

        {/* Center: Add Elements Bar (Simetrik Tuş Takımı) */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 gap-1">
          <button
            type="button"
            onClick={() => addElement('text')}
            className="px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Metin Ekle"
          >
            <Type size={14} className="text-amber-400" />
            <span className="hidden md:inline">Metin</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('image')}
            className="px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Görsel Ekle"
          >
            <ImageIcon size={14} className="text-sky-400" />
            <span className="hidden md:inline">Görsel</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('box')}
            className="px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Blok / Kutu Ekle"
          >
            <Square size={14} className="text-emerald-400" />
            <span className="hidden md:inline">Kutu</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('line')}
            className="px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Çizgi / Ayraç Ekle"
          >
            <Minus size={14} className="text-purple-400" />
            <span className="hidden md:inline">Çizgi</span>
          </button>
        </div>

        {/* Right: History, Guides & Save Draft */}
        <div className="flex items-center gap-2">
          {/* Grid Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              showGrid
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Kılavuz Izgarası (Grid)"
          >
            <Grid size={14} />
          </button>

          {/* Bleed / Print Margin Toggle */}
          <button
            type="button"
            onClick={() => setShowBleed(!showBleed)}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
              showBleed
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Matbaa Güvenli Alan & Kesim Payı (Bleed)"
          >
            Matbaa Kesim Çizgisi
          </button>

          <div className="h-5 w-px bg-neutral-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Geri Al (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="İleri Al (Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {onSaveDraft && (
            <button
              type="button"
              onClick={() => onSaveDraft(pages)}
              className="px-3.5 py-2 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer ml-1"
            >
              <Save size={13} />
              <span>Kaydet</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-PANEL WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row min-h-[720px] max-h-[820px] overflow-hidden">
        {/* ==================== LEFT TOOLBOX PANEL (320px) ==================== */}
        <div className="w-full lg:w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between flex-shrink-0">
          <div>
            {/* Left Nav Tabs */}
            <div className="grid grid-cols-4 p-2 bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-bold">
              {[
                { id: 'templates', label: 'Şablonlar', icon: LayoutTemplate },
                { id: 'products', label: 'Ürünler', icon: Box },
                { id: 'pages', label: 'Sayfalar', icon: Layers },
                { id: 'badges', label: 'Rozetler', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeLeftTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLeftTab(tab.id)}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition cursor-pointer ${
                      isActive
                        ? 'bg-neutral-800 text-amber-400 font-extrabold shadow-inner'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: 1. HAZIR MİZANPAJ VE KATALOG ŞABLONLARI */}
            {activeLeftTab === 'templates' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[660px]">
                {/* Sub Tab Switcher: Ana Katalog Şablonları vs Sayfa Mizanpajları */}
                <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTemplateSubTab('concepts')}
                    className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                      templateSubTab === 'concepts'
                        ? 'bg-amber-500 text-neutral-950 font-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Katalog Şablonları ({CATALOG_MASTER_TEMPLATES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateSubTab('layouts')}
                    className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                      templateSubTab === 'layouts'
                        ? 'bg-neutral-800 text-amber-300 font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Sayfa Mizanpajları
                  </button>
                </div>

                {/* VIEW 1: GÖRSELDEKİ ANA KATALOG ŞABLONLARI (10 ADET) */}
                {templateSubTab === 'concepts' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Kataloğunuz için kurumsal matbaa şablonu seçin veya aktif sayfaya/tüm kataloğa uygulayın:
                    </p>

                    <div className="space-y-3">
                      {CATALOG_MASTER_TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <div
                            key={tmpl.id}
                            className={`rounded-xl border-2 transition overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#b4823c] bg-neutral-900 shadow-lg ring-1 ring-[#b4823c]/40'
                                : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
                            }`}
                          >
                            {/* Card Header with Image Banner & Tag matching screenshot */}
                            <div
                              className="h-28 w-full p-3 flex flex-col justify-between text-white relative cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, rgba(9, 13, 22, 0.90) 0%, rgba(17, 24, 39, 0.75) 100%), url(${tmpl.mockupImg}) center/cover no-repeat`
                              }}
                              onClick={() => handleSelectMasterTemplate(tmpl.id)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-black/60 uppercase text-amber-300 tracking-wider">
                                  {tmpl.tag}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#b4823c] text-white flex items-center justify-center font-bold text-xs shadow">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-serif font-extrabold text-white">
                                  {tmpl.name}
                                </p>
                                <span className="text-[9px] font-mono text-neutral-300">
                                  {tmpl.badge}
                                </span>
                              </div>
                            </div>

                            {/* Card Body & Description */}
                            <div className="p-3 flex-1 flex flex-col justify-between bg-neutral-900/90">
                              <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">
                                {tmpl.desc}
                              </p>

                              {/* Interactive Action Buttons */}
                              <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectMasterTemplate(tmpl.id)}
                                    className={`text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                      isSelected
                                        ? 'text-amber-400 font-extrabold'
                                        : 'text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    <span>{isSelected ? '✓ Aktif Şablon' : 'Bu Şablonu Seç'}</span>
                                  </button>
                                  <span className="text-[10px] text-neutral-500 font-mono">Baskı & Web</span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleApplyMasterTemplateToPage(tmpl.id)}
                                    className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 text-[10px] font-bold text-center transition cursor-pointer"
                                    title="Seçili sayfaya bu şablonun mizanpajını uygular"
                                  >
                                    Sayfaya Uygula
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyMasterTemplateToAllPages(tmpl.id)}
                                    className="px-2 py-1.5 rounded-lg bg-[#b4823c]/20 hover:bg-[#b4823c]/30 text-amber-300 hover:text-amber-100 text-[10px] font-bold text-center border border-[#b4823c]/40 transition cursor-pointer"
                                    title="Tüm kataloğu bu şablonun tam sayfa setine dönüştürür"
                                  >
                                    Tüm Kataloğu Kur
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VIEW 2: TEKİL SAYFA MİZANPAJLARI (PRESET LAYOUTS) */}
                {templateSubTab === 'layouts' && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-neutral-400">
                      Aktif sayfaya eklemek istediğiniz mizanpaj bloğunu seçin:
                    </p>
                    {PRESET_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleApplyPresetTemplate(tmpl)}
                        className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800/90 hover:border-amber-400/60 text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300">
                            {tmpl.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                          {tmpl.desc}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition">
                          <span>Sayfaya Uygula</span>
                          <ChevronRight size={12} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. GERÇEK ÜRÜN KÜTÜPHANESİ */}
            {activeLeftTab === 'products' && (
              <div className="p-3.5 space-y-3 flex flex-col max-h-[620px]">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Ürün adı veya kod ara..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-amber-500"
                  />
                </div>

                <p className="text-[11px] text-neutral-400">
                  Tıkladığınız ürün şık bir görsel & teknik kart olarak tuvale eklenir:
                </p>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleInsertProduct(prod)}
                      className="w-full p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 hover:border-amber-400/50 flex items-center gap-3 text-left transition group cursor-pointer"
                    >
                      <img
                        src={prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-700 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {prod.width}×{prod.height} cm • {prod.finish || 'Mat'}
                        </p>
                      </div>
                      <Plus size={14} className="text-amber-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. SAYFALAR DİZİNİ */}
            {activeLeftTab === 'pages' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[620px]">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-300">
                    Katalog Sayfaları ({pages.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newP = {
                        id: `page-${Date.now()}`,
                        title: `Sayfa #${pages.length + 1}`,
                        type: 'product',
                        bgColor: '#ffffff',
                        elements: []
                      };
                      pushHistory([...pages, newP]);
                      setActivePageIdx(pages.length);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Sayfa Ekle</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {pages.map((p, idx) => {
                    const isActive = idx === activePageIdx;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePageIdx(idx);
                          setSelectedElId(null);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? 'bg-neutral-800 border-amber-500 text-white font-bold ring-1 ring-amber-500/30'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded bg-neutral-800 text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs truncate">{p.title}</span>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = {
                                ...p,
                                id: `page-${Date.now()}`,
                                title: `${p.title} (Kopya)`,
                                elements: p.elements.map((el) => ({
                                  ...el,
                                  id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
                                }))
                              };
                              const arr = [...pages];
                              arr.splice(idx + 1, 0, copy);
                              pushHistory(arr);
                              setActivePageIdx(idx + 1);
                            }}
                            className="p-1 hover:text-sky-400 text-neutral-500"
                            title="Çoğalt"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (pages.length <= 1) return alert('En az 1 sayfa kalmalıdır.');
                              const arr = pages.filter((_, i) => i !== idx);
                              pushHistory(arr);
                              setActivePageIdx(Math.max(0, idx - 1));
                            }}
                            className="p-1 hover:text-rose-400 text-neutral-500"
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. ROZETLER & GRAFİK ÖĞELER */}
            {activeLeftTab === 'badges' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[620px]">
                <div className="pb-1 border-b border-neutral-800">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    MİMARİ & MATBAA ROZETLERİ
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Sayfaya tek tıkla şık rozet ekleyin:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {BADGE_PRESETS.map((badgeText) => (
                    <button
                      key={badgeText}
                      type="button"
                      onClick={() =>
                        addElement('text', {
                          content: badgeText,
                          fontSize: 10,
                          fontWeight: '800',
                          color: '#ffffff',
                          bgColor: '#0f172a',
                          width: 140,
                          height: 28,
                          align: 'center'
                        })
                      }
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-amber-400/50 flex items-center justify-between text-left transition cursor-pointer"
                    >
                      <span className="text-xs font-bold text-amber-300 font-mono">{badgeText}</span>
                      <Plus size={13} className="text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom helper */}
          <div className="p-3 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
            <span>A4 Standart: 210 × 297 mm</span>
          </div>
        </div>

        {/* ==================== CENTER CANVAS WORKSPACE ==================== */}
        <div
          className="flex-1 bg-neutral-900/90 p-4 sm:p-8 flex items-center justify-center overflow-auto relative"
          onClick={() => setSelectedElId(null)}
        >
          {/* Symmetrical Canvas Wrapper with Scale Transform */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease'
            }}
            className="flex-shrink-0"
          >
            <div
              ref={canvasRef}
              style={{
                width: '595px',
                height: '842px',
                backgroundColor: currentPage?.bgColor || '#ffffff',
                backgroundImage: showGrid
                  ? 'radial-gradient(rgba(148, 163, 184, 0.35) 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '20px 20px'
              }}
              className="relative shadow-2xl border border-neutral-700/80 select-none overflow-hidden"
            >
              {/* Optional Bleed Line (Matbaa Kesim Payı Çerçevesi: 20px iç margin) */}
              {showBleed && (
                <div className="absolute inset-[20px] border border-dashed border-red-500/25 pointer-events-none z-50">
                  <span className="absolute top-1 left-1 text-[8px] font-mono text-red-400/50 uppercase tracking-widest">
                    GÜVENLİ ALAN (BLEED MARGIN)
                  </span>
                </div>
              )}

              {/* Elements on Canvas */}
              {currentPage?.elements?.map((el) => {
                const isSelected = el.id === selectedElId;

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDownElement(e, el, 'move')}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      cursor: el.locked ? 'not-allowed' : 'move'
                    }}
                    className={`group ${
                      isSelected
                        ? 'ring-2 ring-amber-500 z-30'
                        : 'hover:ring-1 hover:ring-amber-400/50 z-10'
                    }`}
                  >
                    {/* Render by element type */}
                    {el.type === 'text' && (
                      <div
                        style={{
                          fontSize: `${el.fontSize || 14}px`,
                          fontWeight: el.fontWeight || '600',
                          color: el.color || '#0f172a',
                          backgroundColor: el.bgColor || 'transparent',
                          textAlign: el.align || 'left',
                          letterSpacing: el.letterSpacing || 'normal',
                          width: '100%',
                          height: '100%',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.35
                        }}
                        className="p-1 overflow-hidden"
                      >
                        {el.content}
                      </div>
                    )}

                    {el.type === 'image' && (
                      <img
                        src={el.src}
                        alt=""
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}

                    {el.type === 'box' && (
                      <div
                        style={{
                          backgroundColor: el.color || '#f8fafc',
                          borderColor: el.borderColor || '#cbd5e1'
                        }}
                        className="w-full h-full border"
                      />
                    )}

                    {el.type === 'line' && (
                      <div
                        style={{
                          backgroundColor: el.color || '#b4823c',
                          height: `${el.height || 2}px`
                        }}
                        className="w-full"
                      />
                    )}

                    {/* Resize Handle (Bottom-Right) */}
                    {isSelected && !el.locked && (
                      <div
                        onMouseDown={(e) => handleMouseDownElement(e, el, 'resize')}
                        className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-40"
                        title="Boyutlandır"
                      />
                    )}
                  </div>
                );
              })}

              {/* Bottom Page Number Marker */}
              <div className="absolute bottom-3 right-6 text-[10px] font-mono text-neutral-400 pointer-events-none">
                Sayfa {activePageIdx + 1} / {pages.length}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT INSPECTOR PANEL (300px) ==================== */}
        <div className="w-full lg:w-76 bg-neutral-950 border-l border-neutral-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
          <div className="pb-2 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              {selectedEl ? `SEÇİLİ ÖĞE: ${selectedEl.type.toUpperCase()}` : 'SAYFA ÖZELLİKLERİ'}
            </span>
            {selectedEl && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateSelectedElement({ locked: !selectedEl.locked })}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                  title={selectedEl.locked ? 'Kilidi Aç' : 'Kilitle'}
                >
                  {selectedEl.locked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedElement}
                  className="p-1 rounded text-rose-400 hover:text-rose-300"
                  title="Sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* INSPECTOR BODY */}
          {selectedEl ? (
            <div className="space-y-3.5 text-xs">
              {/* Text Content Editor */}
              {selectedEl.type === 'text' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                      Metin İçeriği
                    </label>
                    <textarea
                      rows={3}
                      value={selectedEl.content || ''}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Punto (px)
                      </label>
                      <input
                        type="number"
                        value={selectedEl.fontSize || 14}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Kalınlık
                      </label>
                      <select
                        value={selectedEl.fontWeight || '700'}
                        onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                      >
                        <option value="400">Regular (400)</option>
                        <option value="600">Semibold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                      </select>
                    </div>
                  </div>

                  {/* Alignment & Color */}
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Metin Rengi
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedEl.color || '#ffffff'}
                          onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[10px] text-neutral-300">
                          {selectedEl.color}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Hizalama
                      </label>
                      <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                        {['left', 'center', 'right'].map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => updateSelectedElement({ align: al })}
                            className={`p-1 rounded flex-1 text-center ${
                              (selectedEl.align || 'left') === al
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {al === 'left' ? 'L' : al === 'center' ? 'C' : 'R'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Image URL Editor */}
              {selectedEl.type === 'image' && (
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Görsel URL
                  </label>
                  <input
                    type="text"
                    value={selectedEl.src || ''}
                    onChange={(e) => updateSelectedElement({ src: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white"
                  />
                </div>
              )}

              {/* Box or Line color */}
              {(selectedEl.type === 'box' || selectedEl.type === 'line') && (
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Dolgu Rengi
                  </label>
                  <input
                    type="color"
                    value={selectedEl.color || '#b4823c'}
                    onChange={(e) => updateSelectedElement({ color: e.target.value })}
                    className="w-full h-8 rounded border border-neutral-700 cursor-pointer bg-transparent"
                  />
                </div>
              )}

              {/* Quick Alignment Tools (Simetrik Matbaa Yerleşimi) */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[10px] font-bold text-neutral-400 block mb-1.5">
                  Tuvale Simetrik Hizala
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => alignElement('left')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    Sol Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('center-h')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-amber-400 font-bold"
                  >
                    Yatay Ortala
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('right')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    Sağ Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('top')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    Üst Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('center-v')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-amber-400 font-bold"
                  >
                    Dikey Ortala
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('bottom')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300"
                  >
                    Alt Kenar
                  </button>
                </div>
              </div>

              {/* Layer Ordering */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[10px] font-bold text-neutral-400 block mb-1.5">
                  Katman Sırası
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => changeLayerOrder(1)}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 flex items-center justify-center gap-1"
                  >
                    <MoveUp size={11} />
                    <span>Öne Getir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLayerOrder(-1)}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 flex items-center justify-center gap-1"
                  >
                    <MoveDown size={11} />
                    <span>Arkaya Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Page Settings when no element is selected */
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                  Sayfa Başlığı
                </label>
                <input
                  type="text"
                  value={currentPage?.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPages((prev) =>
                      prev.map((p, idx) => (idx === activePageIdx ? { ...p, title: val } : p))
                    );
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                  Sayfa Arka Plan Rengi
                </label>
                <div className="flex items-center gap-2">
                  {['#ffffff', '#f8fafc', '#f5f5f4', '#18181b', '#0f172a'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        const updated = pages.map((p, idx) =>
                          idx === activePageIdx ? { ...p, bgColor: hex } : p
                        );
                        pushHistory(updated);
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 rounded-full border ${
                        currentPage?.bgColor === hex
                          ? 'ring-2 ring-amber-400 border-white'
                          : 'border-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-[11px] leading-relaxed">
                Düzenlemek istediğiniz metin, görsel veya şeklin üzerine tıklayarak grafik ve tipografi özelliklerini değiştirebilirsiniz.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
