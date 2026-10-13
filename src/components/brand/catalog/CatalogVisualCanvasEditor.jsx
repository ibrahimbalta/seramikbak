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
  EyeOff,
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
  BookOpen,
  Upload,
  Table,
  FileText,
  Compass,
  X,
  ExternalLink,
  ChevronDown
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

// 8 CERAMIC SPECIFIC PRESET LAYOUTS
export const PRESET_TEMPLATES = [
  {
    id: 'cover-milano',
    name: '1. Premium Koleksiyon Kapağı',
    badge: 'Kapak',
    category: 'cover',
    desc: 'Koyu slate zemin, altın tipografi, büyük mekan fotoğrafı ve mimari monograf başlığı.',
    bgColor: '#18181b',
    elements: [
      {
        id: 'el-c1',
        type: 'text',
        x: 50,
        y: 60,
        width: 495,
        height: 25,
        content: 'SERAMİKBAK • ARCHITECTURAL MONOGRAPH',
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
        height: 75,
        content: '2026 GENEL KOLEKSİYON',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: '0.05em',
        color: '#ffffff',
        align: 'center',
        locked: false
      },
      {
        id: 'el-c3',
        type: 'line',
        x: 235,
        y: 180,
        width: 125,
        height: 2,
        color: '#b4823c',
        locked: false
      },
      {
        id: 'el-c4',
        type: 'image',
        x: 50,
        y: 205,
        width: 495,
        height: 520,
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
        borderRadius: 0,
        locked: false
      },
      {
        id: 'el-c5',
        type: 'text',
        x: 50,
        y: 750,
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
    id: 'concept-living-room',
    name: '2. Büyük Mekân Konsept Tanıtımı',
    badge: 'Konsept',
    category: 'concept',
    desc: 'Geniş editoryal mekan fotoğrafı, mimari konsept metni ve tasarımcı vizyon notu.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-con1',
        type: 'text',
        x: 50,
        y: 45,
        width: 495,
        height: 25,
        content: 'LIVING ARCHITECTURE & INTERIOR DESIGN',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: '0.2em',
        color: '#b4823c',
        align: 'left',
        locked: false
      },
      {
        id: 'el-con2',
        type: 'text',
        x: 50,
        y: 75,
        width: 495,
        height: 45,
        content: 'DOĞAL MEŞE VE SICAK TAŞ UYUMU',
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-con3',
        type: 'image',
        x: 50,
        y: 130,
        width: 495,
        height: 450,
        src: '/renders/modern_living_natural_oak.jpg',
        borderRadius: 0,
        locked: false
      },
      {
        id: 'el-con4',
        type: 'text',
        x: 50,
        y: 600,
        width: 320,
        height: 120,
        content: 'Modern mimaride iç mekan sınırlarını kaldıran geniş format porselen karolar, ahşabın sıcak dokusunu yüksek dayanımlı seramik gövde ile birleştiriyor. Geniş salonlar, lobi alanları ve rezidanslar için kusursuz yüzey kalitesi sunar.',
        fontSize: 12,
        fontWeight: '400',
        color: '#475569',
        align: 'left',
        lineHeight: 1.6,
        locked: false
      },
      {
        id: 'el-con5',
        type: 'box',
        x: 390,
        y: 600,
        width: 155,
        height: 120,
        color: '#f8fafc',
        borderColor: '#e2e8f0',
        locked: false
      },
      {
        id: 'el-con6',
        type: 'text',
        x: 405,
        y: 615,
        width: 125,
        height: 90,
        content: 'ÖNERİLEN KULLANIM:\n• Salon & Oturma Alanı\n• Butik Otel Lobisi\n• Yerden Isıtmaya Uygun\n• R10 A+B Kaymazlık',
        fontSize: 10,
        fontWeight: '700',
        color: '#0f172a',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'product-single-slab',
    name: '3. Tek Ürün Odaklı Dev Plaka (120×280)',
    badge: 'Dev Plaka',
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
        fontWeight: '900',
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
        content: 'İtalyan mermer dokusu • 120×280 cm • Full Lappato & Mat',
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
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
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
        content: 'TEKNİK STANDARTLAR:\n• Ebat: 120×280 cm / 60×120 cm\n• Kalınlık: 6 mm İnce Porselen & 9 mm Standart\n• Yüzey: Full Lappato Parlak / Rektifiyeli Kesim\n• Kaymazlık: R9 / Aşınma Direnci: PEI 4\n• Kullanım: Lobi, Banyo, Mutfak Tezgahı, Dış Cephe Kaplama',
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'product-dual-grid',
    name: '4. 2\'li / 4\'lü Karşılaştırmalı Koleksiyon',
    badge: 'Karşılaştırma',
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
    name: '5. Teknik Şartname & Matris (TS EN 14411)',
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
        content: 'STANDART TEST KRİTERLERİ (EN ISO 10545):\n\n• Su Emme Oranı: ≤ %0.1 (Yüksek Porselen Sınıfı)\n• Kırılma Dayanımı: ≥ 2200 N\n• Eğilme Mukavemeti: ≥ 45 N/mm²\n• Yüzey Aşınma Dayanımı (PEI): Sınıf 4 - 5\n• Derin Aşınma Dayanımı: ≤ 135 mm³\n• Isıl Şok Dayanımı: Tam Dayanıklı\n• Donma Dayanımı: Donmaya Karşı Tam Dirençli\n• Leke Tutma Dayanımı: Minimum Sınıf 5\n• Kimyasallara Direnç: A Sınıfı\n• Kaymazlık (DIN 51130): R9 / R10 / R11 seçenekleri\n\nPAKETLEME VE LOJİSTİK BİLGİLERİ:\n• Kutu İçi Adet: 1 Plaka\n• Kutu Metrajı: 3.36 m² (120×280 cm)\n• Palet Kapasitesi: 24 Kutu (80.64 m²)\n• Palet Ağırlığı: ~1180 kg',
        fontSize: 12,
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'variants-color-matrix',
    name: '6. Renk ve Ebat Varyantları Matrisi',
    badge: 'Varyantlar',
    category: 'specs',
    desc: 'Renk paleti, ebat seçenekleri (60×120, 120×280) ve yüzey varyasyonları matrisi.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-v1',
        type: 'text',
        x: 50,
        y: 45,
        width: 495,
        height: 35,
        content: 'RENK VE EBAT MATRİSİ',
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-v2',
        type: 'text',
        x: 50,
        y: 80,
        width: 495,
        height: 25,
        content: 'Proje ihtiyaçlarına göre üretilen modüler seramik spektrumu',
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        align: 'left',
        locked: false
      },
      {
        id: 'el-v3',
        type: 'box',
        x: 50,
        y: 125,
        width: 110,
        height: 140,
        color: '#f8fafc',
        borderColor: '#cbd5e1',
        locked: false
      },
      {
        id: 'el-v4',
        type: 'box',
        x: 175,
        y: 125,
        width: 110,
        height: 140,
        color: '#e2e8f0',
        borderColor: '#94a3b8',
        locked: false
      },
      {
        id: 'el-v5',
        type: 'box',
        x: 300,
        y: 125,
        width: 110,
        height: 140,
        color: '#334155',
        borderColor: '#1e293b',
        locked: false
      },
      {
        id: 'el-v6',
        type: 'box',
        x: 425,
        y: 125,
        width: 110,
        height: 140,
        color: '#1e293b',
        borderColor: '#0f172a',
        locked: false
      },
      {
        id: 'el-v7',
        type: 'text',
        x: 50,
        y: 280,
        width: 495,
        height: 200,
        content: 'MEVCUT MODÜLER EBATLAR:\n• 120×280 cm (6 mm / 9 mm)\n• 60×120 cm (9 mm / 10 mm)\n• 80×80 cm (9.5 mm)\n• 60×60 cm (9 mm)\n\nYÜZEY TÜRLERİ:\n• Full Lappato Parlak (Yansıtıcı Ayna Yüzey)\n• Soft Touch İpeksi Mat (Parmak İzi Tutmaz)\n• R11 Antislip Rölyefli (Dış Mekan & Havuz Kenarı)',
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'showroom-retail',
    name: '7. Bayi Kataloğu & Perakende Liste',
    badge: 'Bayi & Fiyat',
    category: 'product',
    desc: 'Bayi teşhir standı kodu, perakende m² liste fiyatı etiketi ve derz önerisi.',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-r1',
        type: 'text',
        x: 50,
        y: 45,
        width: 495,
        height: 35,
        content: '2026 BAYİ TEŞHİR & TAVSİYE PERAKENDE LİSTESİ',
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-r2',
        type: 'image',
        x: 50,
        y: 95,
        width: 495,
        height: 320,
        src: '/renders/luxury_bathroom_loft_beton.jpg',
        locked: false
      },
      {
        id: 'el-r3',
        type: 'box',
        x: 50,
        y: 440,
        width: 235,
        height: 200,
        color: '#f8fafc',
        borderColor: '#cbd5e1',
        locked: false
      },
      {
        id: 'el-r4',
        type: 'box',
        x: 310,
        y: 440,
        width: 235,
        height: 200,
        color: '#f8fafc',
        borderColor: '#cbd5e1',
        locked: false
      },
      {
        id: 'el-r5',
        type: 'text',
        x: 65,
        y: 455,
        width: 205,
        height: 170,
        content: 'LOFT BETON GRİ\n• Ebat: 60×120 cm\n• Yüzey: Mat R10\n• Koli Metrajı: 1.44 m²\n• Tavsiye Perakende: 1.250 TL/m²\n• Önerilen Derz: Gri No:112',
        fontSize: 11,
        fontWeight: '600',
        color: '#1e293b',
        align: 'left',
        locked: false
      },
      {
        id: 'el-r6',
        type: 'text',
        x: 325,
        y: 455,
        width: 205,
        height: 170,
        content: 'ALBATROS ANTRASİT\n• Ebat: 120×280 cm\n• Yüzey: Lappato\n• Koli Metrajı: 3.36 m²\n• Tavsiye Perakende: 2.450 TL/m²\n• Önerilen Derz: Siyah No:120',
        fontSize: 11,
        fontWeight: '600',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'back-cover-qr',
    name: '8. İletişim, Bayi Ağı ve 3D QR Arka Kapak',
    badge: 'Arka Kapak',
    category: 'cover',
    desc: 'Koyu zemin kurumsal arka kapak, 3D mekan görüntüleme QR kodu ve fabrika iletişim bilgileri.',
    bgColor: '#18181b',
    elements: [
      {
        id: 'el-b1',
        type: 'text',
        x: 50,
        y: 100,
        width: 495,
        height: 30,
        content: 'SERAMİKBAK TİCARET A.Ş.',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: '0.2em',
        color: '#b4823c',
        align: 'center',
        locked: false
      },
      {
        id: 'el-b2',
        type: 'text',
        x: 50,
        y: 135,
        width: 495,
        height: 40,
        content: 'MİMARİ VE TEKNİK ÇÖZÜMLER MERKEZİ',
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
        align: 'center',
        locked: false
      },
      {
        id: 'el-b3',
        type: 'line',
        x: 235,
        y: 190,
        width: 125,
        height: 2,
        color: '#b4823c',
        locked: false
      },
      {
        id: 'el-b4',
        type: 'qr',
        x: 220,
        y: 280,
        width: 155,
        height: 155,
        qrUrl: 'https://seramikbak.com/3d-viewer',
        locked: false
      },
      {
        id: 'el-b5',
        type: 'text',
        x: 50,
        y: 460,
        width: 495,
        height: 40,
        content: 'KAMERANIZLA OKUTUN\n3D Sanal Showroom ve Mekan Görselleştiriciyi Keşfedin',
        fontSize: 11,
        fontWeight: '700',
        color: '#ffffff',
        align: 'center',
        locked: false
      },
      {
        id: 'el-b6',
        type: 'text',
        x: 50,
        y: 650,
        width: 495,
        height: 120,
        content: 'GENEL MÜDÜRLÜK & FABRİKA:\nOrganize Sanayi Bölgesi 4. Cadde No: 12, Bilecik / Türkiye\nTel: +90 (228) 216 00 00 • E-posta: mimari@seramikbak.com\nWeb: www.seramikbak.com • Instagram: @seramikbak',
        fontSize: 10,
        fontWeight: '500',
        color: '#94a3b8',
        align: 'center',
        locked: false
      }
    ]
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
          fontWeight: '700',
          letterSpacing: '0.25em',
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
          height: 45,
          content: `${prodName} MONOGRAF`,
          fontSize: 26,
          fontWeight: '800',
          letterSpacing: '0.08em',
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
          height: 480,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-4`,
          type: 'text',
          x: 50,
          y: 640,
          width: 240,
          height: 90,
          content: `EBAT: ${prodDim}\nYÜZEY: ${prodFinish}\nKOD: ${prodCode}`,
          fontSize: 12,
          fontWeight: '700',
          color: '#0f172a',
          align: 'left',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 305,
          y: 640,
          width: 240,
          height: 90,
          content: 'DEKOFON VE KOMBİNASYON:\nUyumlu Yer Karosu: 60×120 cm\nDerz Önerisi: Açık Gri / 2 mm',
          fontSize: 12,
          fontWeight: '500',
          color: '#475569',
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
          y: 45,
          width: 495,
          height: 25,
          content: `${brandName} • PRO TECHNIC MATRİS`,
          fontSize: 10,
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
          y: 75,
          width: 495,
          height: 40,
          content: `${prodName} MODÜLER SERİ`,
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
          y: 125,
          width: 495,
          height: 360,
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
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 75,
          y: 525,
          width: 445,
          height: 210,
          content: `TEKNİK ŞARTNAME MATRİSİ:\n• Ebat: ${prodDim} / Kalınlık: 9 mm Rektifiyeli\n• Kaymazlık Sınıfı: R10 A+B & R11 Seçenekleri\n• Su Emme Değeri: E ≤ %0.1 (TS EN 14411 Ek G Grup BIa)\n• Aşınma Direnci (PEI): PEI 4 (Ağır Yaya Trafiği)\n• Kimyasal Dayanım: Asit ve Alkalilere Tam Dirençli\n• Renk Mühendisliği: RAL 7035 / RAL 7040 Eşdeğerliği`,
          fontSize: 12,
          fontWeight: '600',
          color: '#0f172a',
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
          height: 480,
          src: prodImg,
          locked: false
        },
        {
          id: `el-${Date.now()}-5`,
          type: 'text',
          x: 50,
          y: 620,
          width: 495,
          height: 90,
          content: `ŞARTNAME VE KULLANIM BİLGİSİ:\nÜrün Kodu: ${prodCode} • Ebat: ${prodDim} • Yüzey: ${prodFinish}\nKullanım Alanı: Ticari lobi, konut banyo, ıslak hacim, cephe kaplama`,
          fontSize: 12,
          fontWeight: '500',
          color: '#334155',
          align: 'left',
          locked: false
        }
      ];
  }
};

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
  'TS EN 14411',
  'DON DAYANIMI',
  'SU EMME < %0.1',
  'PEI 4-5 YÜKSEK TRAFİK',
  'REKTİFİYELİ 2 MM DERZ'
];

const SAMPLE_RENDERS = [
  { name: 'Calacatta Gold Lüks Banyo', src: '/renders/luxury_bathroom_calacatta_gold.jpg' },
  { name: 'Albatros Antrasit Slate Lobi', src: '/renders/luxury_bathroom_albatros_antrasit.jpg' },
  { name: 'Modern Yaşam Alanı Meşe', src: '/renders/modern_living_natural_oak.jpg' },
  { name: 'Loft Brüt Beton Mimari', src: '/renders/luxury_bathroom_loft_beton.jpg' },
  { name: 'Natural Oak Porselen Parke', src: '/renders/luxury_bathroom_natural_oak.jpg' }
];

export default function CatalogVisualCanvasEditor({
  initialPages,
  brandProducts = [],
  brandInfo = {},
  currentTemplateId = 'milano',
  onSelectTemplate,
  onChangePages,
  onSaveDraft,
  onPublish
}) {
  const isInternalUpdateRef = useRef(false);

  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPages) && initialPages.length > 0) {
      return initialPages
        .filter(Boolean)
        .map((p, pIdx) => ({
          ...p,
          id: p?.id || `page-${pIdx + 1}`,
          elements: Array.isArray(p?.elements) ? p.elements.filter(Boolean) : []
        }));
    }
    return DEFAULT_PAGES;
  });

  const [activePageIdx, setActivePageIdx] = useState(0);
  const [selectedElId, setSelectedElId] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('templates'); // 'templates' | 'pages' | 'products' | 'media' | 'elements' | 'layers'
  const [templateSubTab, setTemplateSubTab] = useState('concepts'); // 'concepts' | 'layouts'
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId || 'milano');
  
  // Canvas configuration
  const [pageFormat, setPageFormat] = useState('portrait'); // 'portrait' (595x842) | 'landscape' (842x595) | 'square' (700x700)
  const [showGrid, setShowGrid] = useState(true);
  const [showBleed, setShowBleed] = useState(true);
  const [showSmartGuides, setShowSmartGuides] = useState(true);
  const [snapLineX, setSnapLineX] = useState(null);
  const [snapLineY, setSnapLineY] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Kaydedildi');
  
  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPageIdx, setPreviewPageIdx] = useState(0);
  const [addPageDropdownOpen, setAddPageDropdownOpen] = useState(false);

  // Custom image upload
  const fileInputRef = useRef(null);

  const canvasWidth = pageFormat === 'landscape' ? 842 : pageFormat === 'square' ? 700 : 595;
  const canvasHeight = pageFormat === 'landscape' ? 595 : pageFormat === 'square' ? 700 : 842;

  useEffect(() => {
    if (currentTemplateId) {
      setSelectedTemplateId(currentTemplateId);
    }
  }, [currentTemplateId]);

  // Sync external initialPages if changed externally
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    if (Array.isArray(initialPages) && initialPages.length > 0) {
      setPages(
        initialPages
          .filter(Boolean)
          .map((p, pIdx) => ({
            ...p,
            id: p?.id || `page-${pIdx + 1}`,
            elements: Array.isArray(p?.elements) ? p.elements.filter(Boolean) : []
          }))
      );
    }
  }, [initialPages]);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const canvasRef = useRef(null);
  const dragInfoRef = useRef(null);

  const currentPage = pages[activePageIdx] || pages[0] || { elements: [] };
  const selectedEl = (currentPage?.elements || []).find((e) => e && e.id === selectedElId) || null;

  // Sync back to parent
  useEffect(() => {
    isInternalUpdateRef.current = true;
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

  // Atomic batch add elements (crash-proof)
  const addMultipleElements = (newEls) => {
    if (!Array.isArray(newEls) || newEls.length === 0) return;
    const cleanEls = newEls.filter(Boolean);
    if (cleanEls.length === 0) return;

    setPages((prevPages) => {
      const updated = prevPages.map((p, idx) => {
        if (idx !== activePageIdx) return p;
        const currentElements = Array.isArray(p?.elements) ? p.elements.filter(Boolean) : [];
        return {
          ...p,
          elements: [...currentElements, ...cleanEls]
        };
      });
      setHistory((prevHist) => [...prevHist.slice(-19), prevPages]);
      setFuture([]);
      return updated;
    });

    if (cleanEls[0]?.id) {
      setSelectedElId(cleanEls[0].id);
    }
  };

  // Add single element
  const addElement = (type, extra = {}) => {
    const defaultW = type === 'text' ? 360 : type === 'line' ? 240 : type === 'qr' ? 140 : 260;
    const defaultH = type === 'text' ? 50 : type === 'line' ? 3 : type === 'qr' ? 140 : 200;

    const newEl = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      x: Math.round((canvasWidth - defaultW) / 2),
      y: Math.round((canvasHeight - defaultH) / 2),
      width: defaultW,
      height: defaultH,
      content: type === 'text' ? 'Başlık veya Metin Alanı' : '',
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'Inter, sans-serif',
      color: type === 'box' ? '#f8fafc' : currentPage.bgColor === '#18181b' ? '#ffffff' : '#0f172a',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      align: 'left',
      letterSpacing: 'normal',
      opacity: 100,
      src: extra.src || '/renders/luxury_bathroom_calacatta_gold.jpg',
      qrUrl: extra.qrUrl || 'https://seramikbak.com',
      locked: false,
      hidden: false,
      ...extra
    };

    addMultipleElements([newEl]);
  };

  const updateSelectedElement = (patch) => {
    if (!selectedElId) return;
    setPages((prevPages) => {
      const updated = prevPages.map((p, idx) => {
        if (idx !== activePageIdx) return p;
        const currentElements = Array.isArray(p?.elements) ? p.elements.filter(Boolean) : [];
        return {
          ...p,
          elements: currentElements.map((el) => (el && el.id === selectedElId ? { ...el, ...patch } : el))
        };
      });
      setHistory((prevHist) => [...prevHist.slice(-19), prevPages]);
      setFuture([]);
      return updated;
    });
  };

  const deleteSelectedElement = () => {
    if (!selectedElId) return;
    setPages((prevPages) => {
      const updated = prevPages.map((p, idx) => {
        if (idx !== activePageIdx) return p;
        const currentElements = Array.isArray(p?.elements) ? p.elements.filter(Boolean) : [];
        return {
          ...p,
          elements: currentElements.filter((el) => el && el.id !== selectedElId)
        };
      });
      setHistory((prevHist) => [...prevHist.slice(-19), prevPages]);
      setFuture([]);
      return updated;
    });
    setSelectedElId(null);
  };

  // Alignment helpers
  const alignElement = (alignment) => {
    if (!selectedEl) return;
    let patch = {};
    if (alignment === 'center-h') {
      patch = { x: Math.round((canvasWidth - selectedEl.width) / 2) };
    } else if (alignment === 'left') {
      patch = { x: 50 };
    } else if (alignment === 'right') {
      patch = { x: canvasWidth - 50 - selectedEl.width };
    } else if (alignment === 'center-v') {
      patch = { y: Math.round((canvasHeight - selectedEl.height) / 2) };
    } else if (alignment === 'top') {
      patch = { y: 50 };
    } else if (alignment === 'bottom') {
      patch = { y: canvasHeight - 50 - selectedEl.height };
    }
    updateSelectedElement(patch);
  };

  const changeLayerOrder = (direction) => {
    if (!selectedElId) return;
    setPages((prevPages) => {
      const p = prevPages[activePageIdx];
      if (!p || !Array.isArray(p.elements)) return prevPages;
      const els = [...p.elements.filter(Boolean)];
      const idx = els.findIndex((e) => e && e.id === selectedElId);
      if (idx === -1) return prevPages;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= els.length) return prevPages;
      const temp = els[idx];
      els[idx] = els[targetIdx];
      els[targetIdx] = temp;

      const updated = prevPages.map((page, i) => (i === activePageIdx ? { ...page, elements: els } : page));
      setHistory((prevHist) => [...prevHist.slice(-19), prevPages]);
      setFuture([]);
      return updated;
    });
  };

  // Add Page with optional preset
  const handleAddNewPage = (preset = null) => {
    const newPage = preset
      ? {
          ...preset,
          id: `page-${Date.now()}`,
          elements: preset.elements.map((el) => ({
            ...el,
            id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          }))
        }
      : {
          id: `page-${Date.now()}`,
          title: `Sayfa #${pages.length + 1}`,
          type: 'product',
          bgColor: '#ffffff',
          elements: []
        };

    const newPages = [...pages, newPage];
    pushHistory(newPages);
    setActivePageIdx(newPages.length - 1);
    setSelectedElId(null);
    setAddPageDropdownOpen(false);
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
            locked: false
          },
          {
            id: `el-cov-5`,
            type: 'text',
            x: 50,
            y: 745,
            width: 495,
            height: 35,
            content: `${tmplObj.tag} • ARCHITECTURAL PORCELAIN SLABS`,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: '0.15em',
            color: '#a1a1aa',
            align: 'center',
            locked: false
          }
        ]
      },
      {
        id: `page-prod1-${Date.now()}`,
        title: `${tmplObj.name} • Ürün Sayfası #1`,
        type: 'product',
        bgColor: tmplObj.bgColor === '#18181b' ? '#18181b' : '#ffffff',
        elements: generateTemplateElementsForPage(tmplId, 'product', brandInfo, p1)
      },
      {
        id: `page-prod2-${Date.now()}`,
        title: `${tmplObj.name} • Ürün Sayfası #2`,
        type: 'product',
        bgColor: tmplObj.bgColor === '#18181b' ? '#18181b' : '#ffffff',
        elements: generateTemplateElementsForPage(tmplId, 'product', brandInfo, p2)
      },
      {
        id: `page-specs-${Date.now()}`,
        title: `${tmplObj.name} • Teknik Şartname`,
        type: 'specs',
        bgColor: '#ffffff',
        elements: PRESET_TEMPLATES.find((p) => p.id === 'specs-matrix')?.elements || []
      },
      {
        id: `page-back-${Date.now()}`,
        title: `${tmplObj.name} • Arka Kapak & QR`,
        type: 'cover',
        bgColor: '#18181b',
        elements: PRESET_TEMPLATES.find((p) => p.id === 'back-cover-qr')?.elements || []
      }
    ];

    pushHistory(newPages);
    setActivePageIdx(0);
    setSelectedElId(null);
    setAutoSaveStatus(`Tüm katalog "${tmplObj.name}" şablonuna dönüştürüldü`);
  };

  // Insert real brand product onto canvas (ATOMIC & CRASH-PROOF)
  const handleInsertProduct = (prod, mode = 'card') => {
    if (!prod) return;
    const prodImg = prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
    const mainText = `${prod.name || 'Seramik Karo'}\n${prod.width || 60}×${prod.height || 120} cm • ${prod.finish || 'Parlak'}`;
    const skuText = `SKU: ${prod.sku || prod.code || 'BN-5501'}`;
    const ts = Date.now();

    if (mode === 'slab') {
      // Large slab layout
      addMultipleElements([
        {
          id: `el-slab-img-${ts}`,
          type: 'image',
          src: prodImg,
          x: 175,
          y: 90,
          width: 245,
          height: 560,
          objectFit: 'cover',
          borderRadius: 0,
          locked: false,
          hidden: false
        },
        {
          id: `el-slab-txt-${ts}`,
          type: 'text',
          content: `${prod.name || 'DEV PLAKA'}\n${prod.width || 120}×${prod.height || 280} cm DEV PLAKA`,
          x: 50,
          y: 680,
          width: 495,
          height: 60,
          fontSize: 18,
          fontWeight: '800',
          color: '#0f172a',
          align: 'center',
          locked: false,
          hidden: false
        }
      ]);
    } else {
      // Standard product card
      addMultipleElements([
        {
          id: `el-card-img-${ts}`,
          type: 'image',
          src: prodImg,
          x: 50,
          y: 110,
          width: 495,
          height: 380,
          objectFit: 'cover',
          borderRadius: 0,
          locked: false,
          hidden: false
        },
        {
          id: `el-card-title-${ts}`,
          type: 'text',
          content: mainText,
          x: 50,
          y: 510,
          width: 340,
          height: 60,
          fontSize: 18,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false,
          hidden: false
        },
        {
          id: `el-card-sku-${ts}`,
          type: 'text',
          content: skuText,
          x: 400,
          y: 515,
          width: 145,
          height: 30,
          fontSize: 12,
          fontWeight: '700',
          color: '#b4823c',
          align: 'right',
          locked: false,
          hidden: false
        }
      ]);
    }
  };

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        addElement('image', {
          src: dataUrl,
          width: 380,
          height: 280
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Keyboard navigation & Shortcuts
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
          updateSelectedElement({ x: Math.min(canvasWidth - selectedEl.width, selectedEl.x + step) });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateSelectedElement({ y: Math.max(0, selectedEl.y - step) });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateSelectedElement({ y: Math.min(canvasHeight - selectedEl.height, selectedEl.y + step) });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElId, selectedEl, canvasWidth, canvasHeight]);

  // Dragging & Resizing Handlers with 4 corners and Snap Guides
  const handleMouseDownElement = (e, el, mode = 'move', corner = 'se') => {
    e.stopPropagation();
    setSelectedElId(el.id);
    if (el.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const origW = el.width;
    const origH = el.height;

    dragInfoRef.current = { id: el.id, mode, corner, startX, startY, origX, origY, origW, origH };

    const handleMouseMove = (moveEvent) => {
      const currentDrag = dragInfoRef.current;
      if (!currentDrag) return;
      const dx = (moveEvent.clientX - currentDrag.startX) / zoomLevel;
      const dy = (moveEvent.clientY - currentDrag.startY) / zoomLevel;

      const snap = (val) => (showGrid ? Math.round(val / 5) * 5 : Math.round(val));

      // Calculate Snap Lines (Center horizontal & vertical)
      if (currentDrag.mode === 'move' && showSmartGuides) {
        const currentCenterX = currentDrag.origX + dx + currentDrag.origW / 2;
        const currentCenterY = currentDrag.origY + dy + currentDrag.origH / 2;
        const pageCenterX = canvasWidth / 2;
        const pageCenterY = canvasHeight / 2;

        if (Math.abs(currentCenterX - pageCenterX) < 6) {
          setSnapLineX(pageCenterX);
        } else {
          setSnapLineX(null);
        }

        if (Math.abs(currentCenterY - pageCenterY) < 6) {
          setSnapLineY(pageCenterY);
        } else {
          setSnapLineY(null);
        }
      }

      setPages((prevPages) =>
        prevPages.map((p, pIdx) => {
          if (pIdx !== activePageIdx) return p;
          if (!p || !Array.isArray(p.elements)) return p;
          return {
            ...p,
            elements: p.elements.map((item) => {
              if (!item || !currentDrag || item.id !== currentDrag.id) return item;
              if (currentDrag.mode === 'move') {
                return {
                  ...item,
                  x: Math.max(0, Math.min(canvasWidth - (item.width || 50), snap(currentDrag.origX + dx))),
                  y: Math.max(0, Math.min(canvasHeight - (item.height || 50), snap(currentDrag.origY + dy)))
                };
              } else if (currentDrag.mode === 'resize') {
                const c = currentDrag.corner;
                let newX = item.x;
                let newY = item.y;
                let newW = item.width;
                let newH = item.height;

                if (c === 'se') {
                  newW = Math.max(20, snap(currentDrag.origW + dx));
                  newH = Math.max(4, snap(currentDrag.origH + dy));
                } else if (c === 'sw') {
                  newW = Math.max(20, snap(currentDrag.origW - dx));
                  newX = snap(currentDrag.origX + dx);
                  newH = Math.max(4, snap(currentDrag.origH + dy));
                } else if (c === 'ne') {
                  newW = Math.max(20, snap(currentDrag.origW + dx));
                  newH = Math.max(4, snap(currentDrag.origH - dy));
                  newY = snap(currentDrag.origY + dy);
                } else if (c === 'nw') {
                  newW = Math.max(20, snap(currentDrag.origW - dx));
                  newH = Math.max(4, snap(currentDrag.origH - dy));
                  newX = snap(currentDrag.origX + dx);
                  newY = snap(currentDrag.origY + dy);
                }

                return { ...item, x: newX, y: newY, width: newW, height: newH };
              }
              return item;
            })
          };
        })
      );
    };

    const handleMouseUp = () => {
      dragInfoRef.current = null;
      setSnapLineX(null);
      setSnapLineY(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const filteredProducts = useMemo(() => {
    let list = brandProducts;
    if (productCategoryFilter !== 'all') {
      list = list.filter((p) => p.category === productCategoryFilter || p.surface === productCategoryFilter);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
    }
    return list;
  }, [brandProducts, productSearch, productCategoryFilter]);

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-neutral-100 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP STUDIO CONTROL BAR (PROFESYONEL VE SİMETRİK MATBAA KONTROL PANELİ) */}
      {/* ========================================================================= */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between gap-3 text-xs">
        {/* Left: Studio Branding & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-extrabold tracking-wider uppercase text-white font-mono text-[11px]">
              STUDIO PRO
            </span>
          </div>

          <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

          {/* Active Template Quick Switcher */}
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

          {/* Orientation switch */}
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setPageFormat('portrait')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                pageFormat === 'portrait' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
              title="A4 Dikey (595×842 pt)"
            >
              A4 Dikey
            </button>
            <button
              type="button"
              onClick={() => setPageFormat('landscape')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                pageFormat === 'landscape' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
              title="A4 Yatay (842×595 pt)"
            >
              A4 Yatay
            </button>
            <button
              type="button"
              onClick={() => setPageFormat('square')}
              className={`px-2 py-1 rounded transition cursor-pointer hidden md:inline ${
                pageFormat === 'square' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
              }`}
              title="1:1 Kare (Deco Standardı)"
            >
              1:1 Kare
            </button>
          </div>

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

        {/* Center: Add Elements Bar */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 gap-1">
          <button
            type="button"
            onClick={() => addElement('text')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Metin Ekle"
          >
            <Type size={14} className="text-amber-400" />
            <span className="hidden md:inline">Metin</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('image')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Görsel Ekle"
          >
            <ImageIcon size={14} className="text-sky-400" />
            <span className="hidden md:inline">Görsel</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('box')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Blok / Kutu Ekle"
          >
            <Square size={14} className="text-emerald-400" />
            <span className="hidden md:inline">Kutu</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('line')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Çizgi / Ayraç Ekle"
          >
            <Minus size={14} className="text-purple-400" />
            <span className="hidden md:inline">Çizgi</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('qr')}
            className="px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="QR Kod Ekle"
          >
            <QrCode size={14} className="text-amber-400" />
            <span className="hidden md:inline">QR Kod</span>
          </button>
        </div>

        {/* Right: History, Guides & Preview */}
        <div className="flex items-center gap-2">
          {/* Smart Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowSmartGuides(!showSmartGuides)}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              showSmartGuides
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Akıllı Hizalama Çizgileri (Smart Guides)"
          >
            <Compass size={14} />
          </button>

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

          {/* Bleed Toggle */}
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
            Kesim Çizgisi
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

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => {
              setPreviewPageIdx(activePageIdx);
              setPreviewOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Kataloğu Tam Ekran İncele"
          >
            <Eye size={13} className="text-sky-400" />
            <span className="hidden sm:inline">Önizle</span>
          </button>

          {onSaveDraft && (
            <button
              type="button"
              onClick={() => onSaveDraft(pages)}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer ml-1"
            >
              <Save size={13} />
              <span>Kaydet</span>
            </button>
          )}

          {onPublish && (
            <button
              type="button"
              onClick={() => onPublish(pages)}
              className="px-3.5 py-2 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Yayınla</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-PANEL WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row min-h-[750px] max-h-[850px] overflow-hidden">
        {/* ==================== LEFT TOOLBOX PANEL (330px) ==================== */}
        <div className="w-full lg:w-84 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between flex-shrink-0">
          <div>
            {/* 6 Specialist Tabs */}
            <div className="grid grid-cols-6 p-1.5 bg-neutral-900/60 border-b border-neutral-800 text-[10px] font-bold">
              {[
                { id: 'templates', label: 'Şablon', icon: LayoutTemplate },
                { id: 'pages', label: 'Sayfa', icon: Layers },
                { id: 'products', label: 'Ürün', icon: Box },
                { id: 'media', label: 'Görsel', icon: ImageIcon },
                { id: 'elements', label: 'Öğe', icon: Sparkles },
                { id: 'layers', label: 'Katman', icon: Sliders }
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
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: ŞABLONLAR & MİZANPAJLAR */}
            {activeLeftTab === 'templates' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[690px]">
                {/* Sub Tab Switcher */}
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
                    Sayfa Mizanpajları ({PRESET_TEMPLATES.length})
                  </button>
                </div>

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

                            <div className="p-3 flex-1 flex flex-col justify-between bg-neutral-900/90">
                              <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">
                                {tmpl.desc}
                              </p>

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

                {templateSubTab === 'layouts' && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-neutral-400">
                      Aktif sayfaya uygulamak istediğiniz seramik sayfa mizanpajını seçin:
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
                          <span>Bu Mizanpajı Sayfaya Uygula</span>
                          <ChevronRight size={12} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: SAYFALAR LİSTESİ & KÜÇÜK ÖNİZLEMELER */}
            {activeLeftTab === 'pages' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[690px]">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-300">
                    Katalog Sayfaları ({pages.length})
                  </span>
                  
                  {/* Add Page Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddPageDropdownOpen(!addPageDropdownOpen)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Sayfa Ekle</span>
                      <ChevronDown size={11} />
                    </button>

                    {addPageDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 text-left">
                        <button
                          type="button"
                          onClick={() => handleAddNewPage(null)}
                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Square size={13} className="text-amber-400" />
                          <span>Boş Sayfa Ekle</span>
                        </button>
                        <div className="h-px bg-neutral-800 my-1" />
                        <span className="text-[10px] font-mono text-neutral-400 px-2 block">HAZIR SERAMİK MİZANPAJLARI:</span>
                        {PRESET_TEMPLATES.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleAddNewPage(preset)}
                            className="w-full px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white text-[11px] flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{preset.name}</span>
                            <span className="text-[9px] font-mono text-amber-400">{preset.badge}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Page Thumbnails */}
                <div className="space-y-2.5">
                  {pages.map((p, idx) => {
                    const isActive = idx === activePageIdx;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePageIdx(idx);
                          setSelectedElId(null);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                          isActive
                            ? 'bg-neutral-800/90 border-amber-500 text-white font-bold ring-2 ring-amber-500/30'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        {/* Miniature Page Visual Preview */}
                        <div
                          style={{ backgroundColor: p.bgColor || '#ffffff' }}
                          className="w-10 h-14 rounded border border-neutral-700 flex-shrink-0 relative overflow-hidden flex flex-col justify-between p-0.5 shadow-xs"
                        >
                          <div className="w-full h-1 bg-amber-500/40 rounded-full" />
                          <span className="text-[8px] font-mono font-bold text-neutral-600 text-center">
                            #{idx + 1}
                          </span>
                          <div className="w-2/3 h-1 bg-neutral-400/30 rounded-full self-center" />
                        </div>

                        {/* Title and details */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate font-bold text-neutral-200">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {p.elements?.length || 0} Öğe • {p.type || 'Ürün'}
                          </p>
                        </div>

                        {/* Quick Page Actions */}
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
                              if (pages.length <= 1) return alert('Katalogda en az 1 sayfa bulunmalıdır.');
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

            {/* TAB CONTENT 3: ÜRÜN KÜTÜPHANESİ */}
            {activeLeftTab === 'products' && (
              <div className="p-3.5 space-y-3 flex flex-col max-h-[690px]">
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
                  Ürünü seçip tuvale ekleme modunu belirleyin:
                </p>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/70 hover:border-amber-400/50 flex flex-col gap-2 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {prod.width}×{prod.height} cm • {prod.finish || 'Mat'}
                          </p>
                          <p className="text-[9px] font-mono text-amber-400">
                            {prod.sku || prod.code || 'SER-2026'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-neutral-800/80">
                        <button
                          type="button"
                          onClick={() => handleInsertProduct(prod, 'card')}
                          className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-bold text-center transition cursor-pointer"
                        >
                          + Kart Olarak Ekle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertProduct(prod, 'slab')}
                          className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold text-center border border-amber-500/40 transition cursor-pointer"
                        >
                          + Dev Plaka Silueti
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: GÖRSELLER & MEDYA KÜTÜPHANESİ */}
            {activeLeftTab === 'media' && (
              <div className="p-3.5 space-y-3.5 overflow-y-auto max-h-[690px]">
                {/* Upload Custom Image Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Özel Görsel Yükle</span>
                  </button>
                </div>

                {/* Brand Logo Insertion */}
                {brandInfo.logoUrl && (
                  <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900">
                    <p className="text-[10px] font-mono uppercase text-neutral-400 mb-2">MARKA LOGOSU</p>
                    <div className="flex items-center justify-between">
                      <img src={brandInfo.logoUrl} alt="Logo" className="h-8 max-w-[140px] object-contain" />
                      <button
                        type="button"
                        onClick={() => addElement('image', { src: brandInfo.logoUrl, width: 140, height: 50 })}
                        className="px-2 py-1 rounded bg-amber-500 text-neutral-950 font-bold text-[10px] cursor-pointer"
                      >
                        Tuvale Ekle
                      </button>
                    </div>
                  </div>
                )}

                {/* Room Application Renders */}
                <div>
                  <p className="text-[10px] font-mono uppercase text-neutral-400 mb-2">
                    LÜKS MEKAN UYGULAMA FOTOĞRAFLARI
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_RENDERS.map((render, rIdx) => (
                      <div
                        key={rIdx}
                        onClick={() => addElement('image', { src: render.src, width: 495, height: 350 })}
                        className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-amber-400/60 cursor-pointer h-24 flex items-end p-2.5"
                        style={{
                          background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%), url(${render.src}) center/cover no-repeat`
                        }}
                      >
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          {render.name}
                        </p>
                        <span className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-amber-400 opacity-0 group-hover:opacity-100 transition">
                          <Plus size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: TASARIM ÖĞELERİ & ROZETLER */}
            {activeLeftTab === 'elements' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[690px]">
                {/* Typography Quick Inserts */}
                <div>
                  <p className="text-[10px] font-mono uppercase text-neutral-400 mb-2">TİPOGRAFİ BLOKLARI</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addElement('text', {
                          content: 'KOLEKSİYON BAŞLIĞI',
                          fontSize: 28,
                          fontWeight: '900',
                          letterSpacing: '0.05em'
                        })
                      }
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-amber-400/50 text-left cursor-pointer"
                    >
                      <p className="text-xs font-black text-white">Büyük Başlık (H1)</p>
                      <p className="text-[10px] text-neutral-400">28px Bold</p>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addElement('text', {
                          content: 'Alt Başlık veya Mimari Seri',
                          fontSize: 16,
                          fontWeight: '700'
                        })
                      }
                      className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-amber-400/50 text-left cursor-pointer"
                    >
                      <p className="text-xs font-bold text-white">Alt Başlık (H2)</p>
                      <p className="text-[10px] text-neutral-400">16px Semibold</p>
                    </button>
                  </div>
                </div>

                {/* Ceramic Print Badges */}
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-[10px] font-mono uppercase text-neutral-400 mb-2">MİMARİ & MATBAA ROZETLERİ</p>
                  <div className="grid grid-cols-1 gap-1.5">
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
                            width: 150,
                            height: 28,
                            align: 'center'
                          })
                        }
                        className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-amber-400/50 flex items-center justify-between text-left transition cursor-pointer"
                      >
                        <span className="text-xs font-bold text-amber-300 font-mono">{badgeText}</span>
                        <Plus size={13} className="text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: KATMANLAR LİSTESİ */}
            {activeLeftTab === 'layers' && (
              <div className="p-3.5 space-y-3 overflow-y-auto max-h-[690px]">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-300">
                    Sayfa Katmanları ({currentPage.elements?.length || 0})
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Z-Index Sırası</span>
                </div>

                <div className="space-y-1.5">
                  {[...(currentPage.elements || [])].filter(Boolean).reverse().map((el, revIdx) => {
                    if (!el || !el.id) return null;
                    const isSelected = el.id === selectedElId;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElId(el.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800 border-amber-500 text-white font-bold ring-1 ring-amber-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {el.type === 'text' ? (
                            <Type size={13} className="text-amber-400 flex-shrink-0" />
                          ) : el.type === 'image' ? (
                            <ImageIcon size={13} className="text-sky-400 flex-shrink-0" />
                          ) : el.type === 'box' ? (
                            <Square size={13} className="text-emerald-400 flex-shrink-0" />
                          ) : el.type === 'qr' ? (
                            <QrCode size={13} className="text-amber-400 flex-shrink-0" />
                          ) : (
                            <Minus size={13} className="text-purple-400 flex-shrink-0" />
                          )}
                          <span className="text-xs truncate">
                            {el.type.toUpperCase()}: {el.content ? el.content.slice(0, 16) : el.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => updateSelectedElement({ locked: !el.locked })}
                            className="p-1 hover:text-amber-400 text-neutral-500"
                            title={el.locked ? 'Kilidi Aç' : 'Kilitle'}
                          >
                            {el.locked ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} />}
                          </button>
                          <button
                            type="button"
                            onClick={deleteSelectedElement}
                            className="p-1 hover:text-rose-400 text-neutral-500"
                            title="Katmanı Sil"
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
          </div>

          {/* Bottom helper info */}
          <div className="p-3 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
            <span>Ölçü: {canvasWidth} × {canvasHeight} pt</span>
            <span className="text-emerald-400">● 300 DPI Vektör Baskı</span>
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
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundColor: currentPage?.bgColor || '#ffffff',
                backgroundImage: showGrid
                  ? 'radial-gradient(rgba(148, 163, 184, 0.35) 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '20px 20px'
              }}
              className="relative shadow-2xl border border-neutral-700/80 select-none overflow-hidden"
            >
              {/* Optional Bleed Line (3mm Kesim Payı: 20px iç margin) */}
              {showBleed && (
                <div className="absolute inset-[20px] border border-dashed border-red-500/25 pointer-events-none z-50">
                  <span className="absolute top-1 left-1 text-[8px] font-mono text-red-400/50 uppercase tracking-widest">
                    GÜVENLİ ALAN (BLEED MARGIN)
                  </span>
                </div>
              )}

              {/* Smart Guide Lines (Snap to page center X & Y) */}
              {snapLineX !== null && (
                <div
                  style={{ left: `${snapLineX}px` }}
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-sky-400 z-50 pointer-events-none"
                />
              )}
              {snapLineY !== null && (
                <div
                  style={{ top: `${snapLineY}px` }}
                  className="absolute left-0 right-0 h-px border-t border-dashed border-sky-400 z-50 pointer-events-none"
                />
              )}

              {/* Elements on Canvas */}
              {currentPage?.elements?.filter(Boolean).map((el) => {
                if (!el || !el.id || el.hidden) return null;
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
                      cursor: el.locked ? 'not-allowed' : 'move',
                      opacity: (el.opacity || 100) / 100
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
                          fontFamily: el.fontFamily || 'Inter, sans-serif',
                          color: el.color || '#0f172a',
                          backgroundColor: el.bgColor || 'transparent',
                          textAlign: el.align || 'left',
                          letterSpacing: el.letterSpacing || 'normal',
                          textTransform: el.textTransform || 'none',
                          width: '100%',
                          height: '100%',
                          whiteSpace: 'pre-wrap',
                          lineHeight: el.lineHeight || 1.35
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
                        style={{
                          objectFit: el.objectFit || 'cover',
                          borderRadius: `${el.borderRadius || 0}px`
                        }}
                        className="w-full h-full pointer-events-none"
                      />
                    )}

                    {el.type === 'box' && (
                      <div
                        style={{
                          backgroundColor: el.color || '#f8fafc',
                          borderColor: el.borderColor || '#cbd5e1',
                          borderWidth: `${el.borderWidth || 1}px`,
                          borderRadius: `${el.borderRadius || 0}px`
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

                    {el.type === 'qr' && (
                      <div className="w-full h-full p-2 bg-white flex flex-col items-center justify-center border border-neutral-300">
                        <QrCode size={Math.min(el.width, el.height) - 20} className="text-neutral-900" />
                        <span className="text-[7px] font-mono text-neutral-500 mt-0.5 truncate max-w-full">
                          {el.qrUrl || 'seramikbak.com'}
                        </span>
                      </div>
                    )}

                    {/* 4 Corner Resize Handles */}
                    {isSelected && !el.locked && (
                      <>
                        <div
                          onMouseDown={(e) => handleMouseDownElement(e, el, 'resize', 'se')}
                          className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-40"
                          title="Boyutlandır (Güneydoğu)"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownElement(e, el, 'resize', 'sw')}
                          className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -bottom-1.5 -left-1.5 cursor-nesw-resize z-40"
                          title="Boyutlandır (Güneybatı)"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownElement(e, el, 'resize', 'ne')}
                          className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -top-1.5 -right-1.5 cursor-nesw-resize z-40"
                          title="Boyutlandır (Kuzeydoğu)"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownElement(e, el, 'resize', 'nw')}
                          className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -top-1.5 -left-1.5 cursor-nwse-resize z-40"
                          title="Boyutlandır (Kuzeybatı)"
                        />
                      </>
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

        {/* ==================== RIGHT INSPECTOR PANEL (310px) ==================== */}
        <div className="w-full lg:w-80 bg-neutral-950 border-l border-neutral-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
          <div className="pb-2 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              {selectedEl ? `SEÇİLİ ÖĞE: ${selectedEl.type.toUpperCase()}` : 'SAYFA AYARLARI'}
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
              {/* Text Inspector */}
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

                  {/* Font Family */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                      Yazı Tipi (Font Ailesi)
                    </label>
                    <select
                      value={selectedEl.fontFamily || 'Inter, sans-serif'}
                      onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                    >
                      <option value="Inter, sans-serif">Inter (Modern & Net)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Lüks Editoryal)</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Kurumsal)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Geometrik)</option>
                      <option value="'Roboto Mono', monospace">Roboto Mono (Teknik Matris)</option>
                    </select>
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
                        <option value="900">Black (900)</option>
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

                  {/* Letter Spacing & UPPERCASE */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Harf Aralığı
                      </label>
                      <select
                        value={selectedEl.letterSpacing || 'normal'}
                        onChange={(e) => updateSelectedElement({ letterSpacing: e.target.value })}
                        className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="0.1em">Geniş (0.1em)</option>
                        <option value="0.25em">Çok Geniş (0.25em)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Dönüştürme
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            textTransform: selectedEl.textTransform === 'uppercase' ? 'none' : 'uppercase'
                          })
                        }
                        className={`w-full py-1.5 px-2 rounded text-center text-xs font-bold border transition ${
                          selectedEl.textTransform === 'uppercase'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        BÜYÜK HARF
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Image Inspector */}
              {selectedEl.type === 'image' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                      Görsel Kaynağı (URL)
                    </label>
                    <input
                      type="text"
                      value={selectedEl.src || ''}
                      onChange={(e) => updateSelectedElement({ src: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Sığdırma Modu
                      </label>
                      <select
                        value={selectedEl.objectFit || 'cover'}
                        onChange={(e) => updateSelectedElement({ objectFit: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                      >
                        <option value="cover">Cover (Kırp & Doldur)</option>
                        <option value="contain">Contain (Orantılı)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                        Köşe Yuvarlama
                      </label>
                      <select
                        value={selectedEl.borderRadius || 0}
                        onChange={(e) => updateSelectedElement({ borderRadius: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                      >
                        <option value="0">Keskin (0px)</option>
                        <option value="8">Hafif (8px)</option>
                        <option value="16">Modern (16px)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* QR Code Inspector */}
              {selectedEl.type === 'qr' && (
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Hedef Web / 3D Mekan URL
                  </label>
                  <input
                    type="text"
                    value={selectedEl.qrUrl || ''}
                    onChange={(e) => updateSelectedElement({ qrUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Katalog sayfasına yerleştirilen QR kodu cep telefonu kamerasıyla okutulduğunda bu bağlantı açılır.
                  </p>
                </div>
              )}

              {/* Box or Line Inspector */}
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

              {/* Alignment Tools */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[10px] font-bold text-neutral-400 block mb-1.5">
                  Tuvale Simetrik Hizala
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => alignElement('left')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 cursor-pointer"
                  >
                    Sol Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('center-h')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-amber-400 font-bold cursor-pointer"
                  >
                    Yatay Ortala
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('right')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 cursor-pointer"
                  >
                    Sağ Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('top')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 cursor-pointer"
                  >
                    Üst Kenar
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('center-v')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-amber-400 font-bold cursor-pointer"
                  >
                    Dikey Ortala
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('bottom')}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-300 cursor-pointer"
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
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MoveUp size={11} />
                    <span>Öne Getir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLayerOrder(-1)}
                    className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 flex items-center justify-center gap-1 cursor-pointer"
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
                      className={`w-6 h-6 rounded-full border cursor-pointer ${
                        currentPage?.bgColor === hex
                          ? 'ring-2 ring-amber-400 border-white'
                          : 'border-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-[11px] leading-relaxed">
                Düzenlemek istediğiniz metin, görsel veya şeklin üzerine tıklayarak tipografi ve grafik özelliklerini değiştirebilirsiniz.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULLSCREEN LIVE PREVIEW MODAL                                          */}
      {/* ========================================================================= */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Header */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-amber-400 font-mono text-sm tracking-wider">
                CANLI KATALOG ÖNİZLEMESİ
              </span>
              <span className="text-xs text-neutral-400">
                Sayfa {previewPageIdx + 1} / {pages.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Center Page Preview */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-auto">
            <div
              style={{
                width: `${canvasWidth * 0.9}px`,
                height: `${canvasHeight * 0.9}px`,
                backgroundColor: pages[previewPageIdx]?.bgColor || '#ffffff',
                transform: 'scale(1)',
                transformOrigin: 'center center'
              }}
              className="relative shadow-2xl rounded-sm overflow-hidden border border-neutral-700"
            >
              {pages[previewPageIdx]?.elements?.filter(Boolean).map((el) => {
                if (!el || !el.id || el.hidden) return null;
                const scale = 0.9;
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: `${el.x * scale}px`,
                      top: `${el.y * scale}px`,
                      width: `${el.width * scale}px`,
                      height: `${el.height * scale}px`,
                      opacity: (el.opacity || 100) / 100
                    }}
                  >
                    {el.type === 'text' && (
                      <div
                        style={{
                          fontSize: `${(el.fontSize || 14) * scale}px`,
                          fontWeight: el.fontWeight || '600',
                          fontFamily: el.fontFamily || 'Inter, sans-serif',
                          color: el.color || '#0f172a',
                          backgroundColor: el.bgColor || 'transparent',
                          textAlign: el.align || 'left',
                          letterSpacing: el.letterSpacing || 'normal',
                          textTransform: el.textTransform || 'none',
                          lineHeight: el.lineHeight || 1.35
                        }}
                        className="p-1"
                      >
                        {el.content}
                      </div>
                    )}
                    {el.type === 'image' && (
                      <img
                        src={el.src}
                        alt=""
                        style={{
                          objectFit: el.objectFit || 'cover',
                          borderRadius: `${(el.borderRadius || 0) * scale}px`
                        }}
                        className="w-full h-full"
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
                          height: `${(el.height || 2) * scale}px`
                        }}
                        className="w-full"
                      />
                    )}
                    {el.type === 'qr' && (
                      <div className="w-full h-full p-2 bg-white flex flex-col items-center justify-center border border-neutral-300">
                        <QrCode size={(Math.min(el.width, el.height) - 20) * scale} className="text-neutral-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={previewPageIdx === 0}
              onClick={() => setPreviewPageIdx((idx) => Math.max(0, idx - 1))}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Önceki Sayfa</span>
            </button>
            <span className="text-neutral-400 font-mono text-xs">
              {previewPageIdx + 1} / {pages.length}
            </span>
            <button
              type="button"
              disabled={previewPageIdx >= pages.length - 1}
              onClick={() => setPreviewPageIdx((idx) => Math.min(pages.length - 1, idx + 1))}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sonraki Sayfa</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
