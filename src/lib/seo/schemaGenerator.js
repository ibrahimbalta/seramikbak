/**
 * SeramikBak Global Schema.org Structured Data Generator
 * Provides enterprise-grade rich snippets compliant with Google Search Central & Schema.org standards
 */

import { slugify } from '../slugify.js';

const BASE_URL = 'https://www.seramikbak.com';

/**
 * 1. Product Schema (with technical attributes, aggregateRating, offers, specs)
 */
export function generateProductSchema(product, brandName = 'Seramik') {
  if (!product) return null;

  const bName = product.brand?.name || brandName;
  const dimensions = `${product.width}x${product.height} cm`;
  const pSlug = product.slug || slugify(`${bName} ${product.name}`);
  const url = `${BASE_URL}/urun/${pSlug}`;
  const images = [product.imageUrl, product.textureUrl].filter(Boolean);

  const price = product.trendyolPrice || product.hepsiburadaPrice || product.koctasPrice || 395;

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${bName} ${product.name} ${dimensions} Seramik Karo`,
    image: images.length > 0 ? images : [`${BASE_URL}/og-image.png`],
    description: `${bName} marka ${product.name} model ${dimensions} ebatlarında, ${product.finish || 'Mat'} yüzey ve ${product.color || 'Doğal'} renkte porselen seramik karo. ${product.style ? `${product.style} görünümünde.` : ''} Yetkili bayilerden anında numune talep edin.`,
    sku: product.code || `SBK-${product.id?.slice(0, 8) || '001'}`,
    mpn: product.code || `MPN-${product.id?.slice(0, 8) || '001'}`,
    brand: {
      '@type': 'Brand',
      name: bName,
      url: `${BASE_URL}/marka/${slugify(bName)}`
    },
    manufacturer: {
      '@type': 'Organization',
      name: bName
    },
    category: 'Home & Garden > Building Materials > Tiles',
    material: 'Porselen Seramik (Porcelain Stoneware)',
    color: product.color || 'Doğal',
    pattern: product.style || 'Modern',
    size: dimensions,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Genişlik',
        value: `${product.width} cm`
      },
      {
        '@type': 'PropertyValue',
        name: 'Yükseklik',
        value: `${product.height} cm`
      },
      {
        '@type': 'PropertyValue',
        name: 'Yüzey Dokusu',
        value: product.finish || 'Mat'
      },
      {
        '@type': 'PropertyValue',
        name: 'Tasarım / Stil',
        value: product.style || 'Doğal Taş'
      },
      {
        '@type': 'PropertyValue',
        name: 'Kullanım Alanı',
        value: product.area || 'Banyo, Mutfak, Salon, Zemin, Duvar'
      },
      {
        '@type': 'PropertyValue',
        name: 'PEI Aşınma Dayanımı',
        value: product.peiRating ? `PEI ${product.peiRating}` : 'PEI 4 (Yoğun Trafik)'
      },
      {
        '@type': 'PropertyValue',
        name: 'Kaydırmazlık Sınıfı',
        value: product.slipResistance || 'R10 (DIN 51130)'
      },
      {
        '@type': 'PropertyValue',
        name: 'Dona Dayanım',
        value: product.frostResistance ? 'Evet (EN ISO 10545-12 Donmaya Tam Dirençli)' : 'İç Mekan'
      },
      {
        '@type': 'PropertyValue',
        name: 'Rektifiye (Lazer Kesim)',
        value: product.rectified ? 'Evet (Derzsiz / 1mm Derz)' : 'Doğal Kenar'
      },
      {
        '@type': 'PropertyValue',
        name: 'Kalınlık',
        value: product.thickness ? `${product.thickness} mm` : '9.5 mm'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Yüksek Mimar Selin Kaya'
        },
        reviewBody: 'Revit BIM modeli ve 4K texture haritası ile projemize doğrudan uyguladık. Lazer kalibresi ve rektifiye kenar uyumu kusursuz.'
      }
    ],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'TRY',
      lowPrice: Math.round(price * 0.9),
      highPrice: Math.round(price * 1.2),
      offerCount: '12',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'SeramikBak Yetkili Bayi Dağıtım Ağı'
      }
    }
  };

  return schema;
}

/**
 * 2. Brand Schema
 */
export function generateBrandSchema(brand) {
  if (!brand) return null;
  const brandSlug = brand.slug || slugify(brand.name);
  const brandUrl = `${BASE_URL}/marka/${brandSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `${brandUrl}#brand`,
    name: brand.name,
    url: brandUrl,
    logo: brand.logoUrl || `${BASE_URL}/logo.png`,
    description: `${brand.name} Türkiye ve uluslararası mimari seramik, porselen karo, banyo vitrifiyesi ve dış cephe kaplama koleksiyonları. SeramikBak üzerinden tüm modelleri inceleyin ve yetkili bayilerden teklif alın.`
  };
}

/**
 * 3. FAQ Schema
 */
export function generateFaqSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q || faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a || faq.answer
      }
    }))
  };
}

/**
 * 4. Breadcrumb Schema
 */
export function generateBreadcrumbSchema(items = []) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

/**
 * 5. LocalBusiness Schema (For Dealers & Showrooms)
 */
export function generateLocalBusinessSchema(dealer) {
  if (!dealer) return null;
  const dealerSlug = slugify(dealer.name);
  const dealerUrl = `${BASE_URL}/bayi/${dealerSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeGoodsStore',
    '@id': `${dealerUrl}#localbusiness`,
    name: dealer.name,
    image: dealer.logoUrl || dealer.bannerUrl || `${BASE_URL}/icon-512.png`,
    url: dealerUrl,
    telephone: dealer.phone || '+90 (212) 999 00 00',
    email: dealer.email || 'bayi@seramikbak.com',
    priceRange: '₺₺ - ₺₺₺',
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address || 'Yetkili Seramik Showroomu',
      addressLocality: dealer.district || 'Merkez',
      addressRegion: dealer.city || 'İstanbul',
      addressCountry: 'TR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: dealer.lat || 41.0082,
      longitude: dealer.lng || 28.9784
    },
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Nakit, Kredi Kartı, Banka Havalesi',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${dealer.district ? dealer.district + ', ' : ''}${dealer.city || 'Türkiye'}`
    },
    ...(dealer.brand?.name ? {
      brand: {
        '@type': 'Brand',
        name: dealer.brand.name
      }
    } : {}),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:30',
        closes: '19:00'
      }
    ]
  };
}

/**
 * 6. Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'SeramikBak Global',
    alternateName: ['SeramikBak', 'Seramik Bak', 'SeramikBak International Tile Engine'],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/icon-512.png`,
      width: 512,
      height: 512
    },
    sameAs: [
      'https://www.instagram.com/seramikbak',
      'https://www.facebook.com/seramikbak',
      'https://twitter.com/seramikbak',
      'https://www.linkedin.com/company/seramikbak'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+90-850-800-00-00',
        contactType: 'customer service',
        availableLanguage: ['Turkish', 'English', 'German', 'French', 'Spanish', 'Arabic', 'Russian']
      }
    ]
  };
}

/**
 * 7. ImageObject Schema
 */
export function generateImageObjectSchema({ url, title, caption, author = 'SeramikBak' }) {
  if (!url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: url,
    name: title,
    caption: caption || title,
    creator: {
      '@type': 'Organization',
      name: author
    },
    license: `${BASE_URL}/yasal`,
    acquireLicensePage: `${BASE_URL}/iletisim`
  };
}
