'use client';

import React from 'react';

export default function ProductSchemaJsonLd({ product, currency = 'TRY', lang = 'tr' }) {
  if (!product) return null;

  const brandName = product.brand?.name || 'SeramikBak';
  const productName = product.name || 'Premium Porselen Seramik';
  const productCode = product.code || `SB-${product.id?.substring(0, 6)}`;
  const dimensions = `${product.width || 60}x${product.height || 120} cm`;
  const finish = product.finish || 'Parlak';
  const style = product.style || 'Mermer';
  const color = product.color || 'Beyaz';

  // Base price calculation
  const priceVal = product.price || Math.round((product.width || 60) * (product.height || 120) * 0.08 + (finish === 'Parlak' ? 120 : 0) + (style === 'Mermer' ? 150 : 80));

  const currencyRates = {
    TRY: { code: 'TRY', symbol: '₺', rate: 1 },
    USD: { code: 'USD', symbol: '$', rate: 0.027 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.025 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.021 },
    SAR: { code: 'SAR', symbol: '﷼', rate: 0.10 },
    RUB: { code: 'RUB', symbol: '₽', rate: 2.40 }
  };

  const curr = currencyRates[currency] || currencyRates.TRY;
  const convertedPrice = (priceVal * curr.rate).toFixed(2);

  const langNames = {
    tr: `${brandName} ${productName} - ${dimensions} ${finish} ${style} Seramik Karo`,
    en: `${brandName} ${productName} - ${dimensions} ${finish} ${style} Porcelain Tile Export`,
    de: `${brandName} ${productName} - ${dimensions} ${finish} ${style} Keramikfliesen B2B`,
    ar: `${brandName} ${productName} - ${dimensions} بلاط بورسلين فاخر للمشاريع`,
    ru: `${brandName} ${productName} - ${dimensions} Керамогранит плитка экспорт`
  };

  const productDescription = `${brandName} ${productName} ${dimensions} ${color} ${style} ${finish} porselen karo kaplama. Google Global ve Yandex arama motorlarında 5 dilde indeksli, Revit BIM (.RFA), AutoCAD (.DWG) ve 4K Seamless PBR doku dosyaları mimarlık şartnameleri için hazırdır.`;

  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": langNames[lang] || langNames.tr,
    "image": [
      product.imageUrl || "/textures/calacatta_gold.jpg",
      product.textureUrl || product.imageUrl || "/textures/calacatta_gold.jpg"
    ],
    "description": productDescription,
    "sku": productCode,
    "mpn": productCode,
    "brand": {
      "@type": "Brand",
      "name": brandName,
      "logo": "https://www.seramikbak.com/icon-512.png"
    },
    "category": "Home & Garden > Building Materials > Tiles > Ceramic Tiles",
    "material": "Porselen Seramik (Porcelain Ceramic)",
    "offers": {
      "@type": "Offer",
      "url": `https://www.seramikbak.com/?product=${product.id}&lang=${lang}`,
      "priceCurrency": curr.code,
      "price": convertedPrice,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "SeramikBak Global B2B Export Portal"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "TR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": curr.code
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": ["TR", "DE", "AE", "SA", "US", "GB", "RU"]
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 14,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "128",
      "bestRating": "5",
      "worstRating": "1"
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Ebat / Dimensions", "value": dimensions },
      { "@type": "PropertyValue", "name": "Yüzey / Finish", "value": finish },
      { "@type": "PropertyValue", "name": "Tarz / Style", "value": style },
      { "@type": "PropertyValue", "name": "Renk / Color", "value": color },
      { "@type": "PropertyValue", "name": "BIM / Revit Uyum", "value": "Revit .RFA, AutoCAD .DWG, 4K PBR Materials" },
      { "@type": "PropertyValue", "name": "5 Dilde SEO İndeks", "value": "TR, EN, DE, AR, RU Active" }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  );
}
