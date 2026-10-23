/**
 * SeramikBak Dijital Katalog & Lookbook Renk Şablonları Kütüphanesi
 * Kullanıcının sağladığı mimari editoryal tasarım sistemine dayalı,
 * 6 farklı renk harmonisi ve CSS değişken seti.
 */

export const LOOKBOOK_COLOR_TEMPLATES = [
  {
    id: 'terra-traverten',
    aliasIds: ['terra-luxe', 'traverten', 'default'],
    name: 'Terra & Traverten (Toprak Tonları)',
    badge: 'KULLANICI SEÇİMİ',
    tag: 'Sıcak Traverten & Altın Bronz',
    style: 'Doğal Taş & Editoryal',
    description: 'Doğal taş ve mermerin sıcaklığını yansıtan fildişi/krem zemin, zengin toprak ve altın bronz vurguları.',
    previewImg: '/renders/luxury_bathroom_natural_oak.jpg',
    colorSample: {
      primary: '#a87943',
      secondary: '#252b28',
      background: '#f7f5f0',
      paper: '#fffefa',
      accent: '#a87943'
    },
    vars: {
      '--site-primary': '#a87943',
      '--site-secondary': '#252b28',
      '--site-background': '#f7f5f0',
      '--site-on-primary': '#ffffff',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#252b28',
      '--ink': '#242824',
      '--muted': '#777970',
      '--line': '#e5e1d8',
      '--paper': '#fffefa',
      '--accent': '#a87943',
      '--accent-light': '#efe5d6',
      '--hero-bg': '#262a27',
      '--hero-text': '#f8f5ef',
      '--hero-eyebrow': '#c7a77c',
      '--hero-em': '#c4a47a',
      '--hero-stamp-bg': 'rgba(30, 33, 30, 0.62)',
      '--hero-stamp-border': 'rgba(255, 255, 255, 0.45)',
      '--editorial-bg': '#eeece5',
      '--editorial-caption-bg': 'rgba(31, 34, 30, 0.84)',
      '--cta-bg': '#282d29',
      '--cta-text': '#ffffff',
      '--product-hover-border': '#c5b49a',
      '--product-img-bg': '#ece9e3'
    }
  },
  {
    id: 'obsidian-gold',
    aliasIds: ['milano', 'dark-luxury', 'obsidian'],
    name: 'Obsidian & Altın (Milano Gece)',
    badge: 'LÜKS MİLANO',
    tag: 'Obsidian Siyah & Şampanya Altını',
    style: 'Dramatik Kontrast & Gece',
    description: 'Büyük tam ekran görseller, derin antrasit-siyah arka plan ve ışıldayan altın dokunuşlarla yüksek prestijli monograf.',
    previewImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    colorSample: {
      primary: '#c5a059',
      secondary: '#0a0c10',
      background: '#0e1117',
      paper: '#151922',
      accent: '#c5a059'
    },
    vars: {
      '--site-primary': '#c5a059',
      '--site-secondary': '#0a0c10',
      '--site-background': '#0e1117',
      '--site-on-primary': '#0a0c10',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#f4f4f5',
      '--ink': '#f4f4f5',
      '--muted': '#9ca3af',
      '--line': '#262d3d',
      '--paper': '#151922',
      '--accent': '#c5a059',
      '--accent-light': '#2b2416',
      '--hero-bg': '#07090d',
      '--hero-text': '#f4f4f5',
      '--hero-eyebrow': '#c5a059',
      '--hero-em': '#e6cb8f',
      '--hero-stamp-bg': 'rgba(14, 17, 23, 0.82)',
      '--hero-stamp-border': 'rgba(197, 160, 89, 0.45)',
      '--editorial-bg': '#141821',
      '--editorial-caption-bg': 'rgba(7, 9, 13, 0.88)',
      '--cta-bg': '#151922',
      '--cta-text': '#f4f4f5',
      '--product-hover-border': '#c5a059',
      '--product-img-bg': '#11141c'
    }
  },
  {
    id: 'nordic-loft',
    aliasIds: ['nordic', 'beton', 'loft'],
    name: 'Nordic Loft (Kuzey Grisi & Beton)',
    badge: 'ÇAĞDAŞ LOFT',
    tag: 'Soğuk Çimento & Mavi-Gri',
    style: 'İskandinav Minimal',
    description: 'Beton, çimento ve modern mimari karolar için temiz soğuk gri tonları, antrasit çizgiler ve havadar beyaz alan.',
    previewImg: '/renders/luxury_bathroom_loft_beton.jpg',
    colorSample: {
      primary: '#475569',
      secondary: '#1e293b',
      background: '#f1f5f9',
      paper: '#ffffff',
      accent: '#334155'
    },
    vars: {
      '--site-primary': '#475569',
      '--site-secondary': '#1e293b',
      '--site-background': '#f1f5f9',
      '--site-on-primary': '#ffffff',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#0f172a',
      '--ink': '#0f172a',
      '--muted': '#64748b',
      '--line': '#cbd5e1',
      '--paper': '#ffffff',
      '--accent': '#334155',
      '--accent-light': '#e2e8f0',
      '--hero-bg': '#1e293b',
      '--hero-text': '#f8fafc',
      '--hero-eyebrow': '#94a3b8',
      '--hero-em': '#cbd5e1',
      '--hero-stamp-bg': 'rgba(30, 41, 59, 0.78)',
      '--hero-stamp-border': 'rgba(255, 255, 255, 0.4)',
      '--editorial-bg': '#e2e8f0',
      '--editorial-caption-bg': 'rgba(15, 23, 42, 0.86)',
      '--cta-bg': '#0f172a',
      '--cta-text': '#ffffff',
      '--product-hover-border': '#94a3b8',
      '--product-img-bg': '#e2e8f0'
    }
  },
  {
    id: 'sage-forest',
    aliasIds: ['sage', 'forest', 'botanic', 'doga'],
    name: 'Adaçayı & Koyu Orman (Doğa)',
    badge: 'DOĞAL & BOTANİK',
    tag: 'Adaçayı Yeşili & Koyu Orman',
    style: 'Huzurlu Spa & Wellness',
    description: 'Doğadan ilham alan yeşil seramikler, spa ve wellness mekanları için ferah adaçayı yeşili ve organik orman tonları.',
    previewImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    colorSample: {
      primary: '#4d6b53',
      secondary: '#1c2820',
      background: '#f4f7f4',
      paper: '#ffffff',
      accent: '#436149'
    },
    vars: {
      '--site-primary': '#4d6b53',
      '--site-secondary': '#1c2820',
      '--site-background': '#f4f7f4',
      '--site-on-primary': '#ffffff',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#18251c',
      '--ink': '#18251c',
      '--muted': '#5e7264',
      '--line': '#d7e2d9',
      '--paper': '#ffffff',
      '--accent': '#436149',
      '--accent-light': '#e1ebe3',
      '--hero-bg': '#1c2820',
      '--hero-text': '#f2f7f3',
      '--hero-eyebrow': '#92b69a',
      '--hero-em': '#b8d7bf',
      '--hero-stamp-bg': 'rgba(28, 40, 32, 0.78)',
      '--hero-stamp-border': 'rgba(255, 255, 255, 0.4)',
      '--editorial-bg': '#e6ede7',
      '--editorial-caption-bg': 'rgba(20, 30, 23, 0.88)',
      '--cta-bg': '#152219',
      '--cta-text': '#ffffff',
      '--product-hover-border': '#85a78d',
      '--product-img-bg': '#e7ece8'
    }
  },
  {
    id: 'terracotta-sun',
    aliasIds: ['terracotta', 'deco', 'mediterranean', 'akdeniz'],
    name: 'Terracotta & Akdeniz Taşı',
    badge: 'SICAK AKDENİZ',
    tag: 'Pişmiş Toprak & Sıcak Kiremit',
    style: 'Artisan & Butik Yaşam',
    description: 'Sıcak Akdeniz güneşi, pişmiş kil ve zanaatkar seramikler için sıcak kiremit, kum taşı ve tarçın tonları.',
    previewImg: '/renders/modern_living_natural_oak.jpg',
    colorSample: {
      primary: '#b85d38',
      secondary: '#2d1b15',
      background: '#faf5f0',
      paper: '#ffffff',
      accent: '#b85d38'
    },
    vars: {
      '--site-primary': '#b85d38',
      '--site-secondary': '#2d1b15',
      '--site-background': '#faf5f0',
      '--site-on-primary': '#ffffff',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#2d1b15',
      '--ink': '#291811',
      '--muted': '#82695e',
      '--line': '#eddcd3',
      '--paper': '#ffffff',
      '--accent': '#b85d38',
      '--accent-light': '#fbeae2',
      '--hero-bg': '#2d1b15',
      '--hero-text': '#faf4ef',
      '--hero-eyebrow': '#e0906e',
      '--hero-em': '#f3b295',
      '--hero-stamp-bg': 'rgba(45, 27, 21, 0.78)',
      '--hero-stamp-border': 'rgba(255, 255, 255, 0.4)',
      '--editorial-bg': '#f3e7df',
      '--editorial-caption-bg': 'rgba(38, 20, 15, 0.88)',
      '--cta-bg': '#23140f',
      '--cta-text': '#ffffff',
      '--product-hover-border': '#d98b6b',
      '--product-img-bg': '#f3e8e1'
    }
  },
  {
    id: 'carrara-pure',
    aliasIds: ['carrara', 'monochrome', 'pure-white', 'marble'],
    name: 'Carrara & Saf Monokrom',
    badge: 'SAF MERMER',
    tag: 'Arı Beyaz & Grafit Kontrast',
    style: 'Ultra Minimal & Saf',
    description: 'Beyaz mermer, calacatta ve parlak porselen karolar için arı beyaz, açık gümüş ve derin kömür zıtlığı.',
    previewImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    colorSample: {
      primary: '#18181b',
      secondary: '#09090b',
      background: '#f9f9fa',
      paper: '#ffffff',
      accent: '#18181b'
    },
    vars: {
      '--site-primary': '#18181b',
      '--site-secondary': '#09090b',
      '--site-background': '#f9f9fa',
      '--site-on-primary': '#ffffff',
      '--site-on-secondary': '#ffffff',
      '--site-on-background': '#18181b',
      '--ink': '#18181b',
      '--muted': '#71717a',
      '--line': '#e4e4e7',
      '--paper': '#ffffff',
      '--accent': '#18181b',
      '--accent-light': '#f4f4f5',
      '--hero-bg': '#111113',
      '--hero-text': '#fafafa',
      '--hero-eyebrow': '#a1a1aa',
      '--hero-em': '#e4e4e7',
      '--hero-stamp-bg': 'rgba(24, 24, 27, 0.78)',
      '--hero-stamp-border': 'rgba(255, 255, 255, 0.4)',
      '--editorial-bg': '#f0f0f2',
      '--editorial-caption-bg': 'rgba(17, 17, 19, 0.88)',
      '--cta-bg': '#09090b',
      '--cta-text': '#ffffff',
      '--product-hover-border': '#a1a1aa',
      '--product-img-bg': '#ececed'
    }
  }
];

/**
 * ID veya alias eşleşmesi ile aktif tema nesnesini döndürür.
 * Eşleşmezse varsayılan 'terra-traverten' şablonunu seçer.
 */
export function getLookbookTheme(themeId) {
  if (!themeId) return LOOKBOOK_COLOR_TEMPLATES[0];
  const normalized = String(themeId).toLowerCase().trim();
  const found = LOOKBOOK_COLOR_TEMPLATES.find(
    (t) => t.id === normalized || (t.aliasIds && t.aliasIds.includes(normalized))
  );
  return found || LOOKBOOK_COLOR_TEMPLATES[0];
}

/**
 * Tema değişkenlerini inline style objesine dönüştürür.
 */
export function getLookbookCssVars(themeId) {
  const theme = getLookbookTheme(themeId);
  return { ...theme.vars };
}
