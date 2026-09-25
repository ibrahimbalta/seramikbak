/**
 * Visual Color Classification and Search Engine for Ceramic Tiles
 * Seramik modelleri için renk sınıflandırma, renk mesafesi ve benzerlik hesaplama motoru.
 */

export const CERAMIC_COLOR_PALETTE = {
  'Beyaz': {
    name: 'Beyaz',
    centroid: [245, 245, 245],
    aliases: ['Beyaz', 'Kristal', 'Marmara Beyazı', 'Calacatta', 'Carrara', 'Statuario', 'White', 'Ice'],
    compatible: ['Beyaz', 'Krem', 'Fildişi', 'Açık Gri']
  },
  'Krem': {
    name: 'Krem',
    centroid: [238, 230, 210],
    aliases: ['Krem', 'Bone', 'Fildişi', 'Almond', 'Cream', 'Badem'],
    compatible: ['Krem', 'Fildişi', 'Bej', 'Beyaz', 'Bone']
  },
  'Fildişi': {
    name: 'Fildişi',
    centroid: [242, 236, 222],
    aliases: ['Fildişi', 'Ivory', 'Krem', 'Bone'],
    compatible: ['Fildişi', 'Krem', 'Bej', 'Beyaz']
  },
  'Bej': {
    name: 'Bej',
    centroid: [215, 198, 172],
    aliases: ['Bej', 'Traverten', 'Sand', 'Latte', 'Vizon', 'Taupe', 'Beige', 'Kum', 'Travertino', 'Crema', 'Grej'],
    compatible: ['Bej', 'Krem', 'Fildişi', 'Vizon', 'Taupe', 'Grej', 'Kahverengi']
  },
  'Açık Gri': {
    name: 'Açık Gri',
    centroid: [202, 204, 206],
    aliases: ['Açık Gri', 'Gümüş Gri', 'Silver', 'Light Grey', 'Platin'],
    compatible: ['Açık Gri', 'Gri', 'Beyaz', 'Grej']
  },
  'Gri': {
    name: 'Gri',
    centroid: [142, 144, 146],
    aliases: ['Gri', 'Beton', 'Loft', 'Grey', 'Verona Grey', 'Concrete Light Grey', 'Royal Grey', 'Cementside'],
    compatible: ['Gri', 'Açık Gri', 'Koyu Gri', 'Antrasit', 'Grej', 'Vizon']
  },
  'Koyu Gri': {
    name: 'Koyu Gri',
    centroid: [86, 88, 90],
    aliases: ['Koyu Gri', 'Füme', 'Smoke', 'Grafit', 'Dark Grey'],
    compatible: ['Koyu Gri', 'Gri', 'Antrasit', 'Siyah']
  },
  'Antrasit': {
    name: 'Antrasit',
    centroid: [46, 48, 50],
    aliases: ['Antrasit', 'Borneo Antrasit', 'Karbon', 'Bazalt', 'Anthracite', 'Dark Antracite'],
    compatible: ['Antrasit', 'Siyah', 'Koyu Gri', 'Füme']
  },
  'Siyah': {
    name: 'Siyah',
    centroid: [24, 24, 26],
    aliases: ['Siyah', 'Nero', 'Black', 'Marquina', 'Siyah Mermer'],
    compatible: ['Siyah', 'Antrasit', 'Koyu Gri']
  },
  'Kahverengi': {
    name: 'Kahverengi',
    centroid: [118, 78, 48],
    aliases: ['Kahverengi', 'Kahve', 'Ceviz', 'Ahşap', 'Meşe', 'Oak', 'Walnut', 'Teak', 'Moka', 'Karamel', 'Brown', 'Vintage Wood', 'Natural Oak'],
    compatible: ['Kahverengi', 'Kahve', 'Ceviz', 'Bej', 'Vizon']
  },
  'Vizon': {
    name: 'Vizon',
    centroid: [168, 152, 138],
    aliases: ['Vizon', 'Açık Vizon', 'Taupe', 'Grej', 'Mink'],
    compatible: ['Vizon', 'Bej', 'Gri', 'Krem', 'Kahverengi']
  },
  'Mavi': {
    name: 'Mavi',
    centroid: [55, 105, 165],
    aliases: ['Mavi', 'Okyanus', 'Sky', 'Blue', 'Navy', 'Turkuaz'],
    compatible: ['Mavi', 'Gri', 'Beyaz', 'Antrasit']
  },
  'Yeşil': {
    name: 'Yeşil',
    centroid: [65, 115, 75],
    aliases: ['Yeşil', 'Yosun', 'Zümrüt', 'Green', 'Sage', 'Zeytin'],
    compatible: ['Yeşil', 'Bej', 'Gri', 'Beyaz']
  },
  'Terracotta': {
    name: 'Terracotta',
    centroid: [175, 85, 60],
    aliases: ['Terracotta', 'Cotto', 'Kiremit', 'Kırmızı', 'Rust', 'Tuğla'],
    compatible: ['Terracotta', 'Bej', 'Kahverengi', 'Krem']
  }
};

/**
 * Calculates Euclidean RGB distance between two colors
 */
export function calculateRgbDistance(rgb1, rgb2) {
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  // Weighted Euclidean (giving more weight to green/red for human eye perception)
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Classifies an RGB color into a Turkish ceramic color category
 */
export function classifyCeramicColor(r, g, b) {
  const rgb = [r, g, b];
  const { h, s, l } = rgbToHsl(r, g, b);

  // 1. Extreme Brightness heuristics (Monochrome & Neutrals)
  if (l >= 88 && s <= 20) {
    return {
      primaryColor: 'Beyaz',
      compatibleColors: CERAMIC_COLOR_PALETTE['Beyaz'].compatible,
      colorHex: '#f5f5f5'
    };
  }

  if (l <= 14) {
    return {
      primaryColor: 'Siyah',
      compatibleColors: CERAMIC_COLOR_PALETTE['Siyah'].compatible,
      colorHex: '#181818'
    };
  }

  if (l <= 26 && s <= 25) {
    return {
      primaryColor: 'Antrasit',
      compatibleColors: CERAMIC_COLOR_PALETTE['Antrasit'].compatible,
      colorHex: '#2e3235'
    };
  }

  if (l <= 45 && s <= 18) {
    return {
      primaryColor: 'Koyu Gri',
      compatibleColors: CERAMIC_COLOR_PALETTE['Koyu Gri'].compatible,
      colorHex: '#56585a'
    };
  }

  if (l >= 75 && l < 88 && s <= 15) {
    return {
      primaryColor: 'Açık Gri',
      compatibleColors: CERAMIC_COLOR_PALETTE['Açık Gri'].compatible,
      colorHex: '#cbcdcf'
    };
  }

  if (s <= 14) {
    return {
      primaryColor: 'Gri',
      compatibleColors: CERAMIC_COLOR_PALETTE['Gri'].compatible,
      colorHex: '#8e9092'
    };
  }

  // 2. Warm Neutrals: Bej, Krem, Fildişi, Kahverengi
  if (h >= 18 && h <= 55) {
    if (l >= 80 && s <= 60) {
      return {
        primaryColor: 'Krem',
        compatibleColors: CERAMIC_COLOR_PALETTE['Krem'].compatible,
        colorHex: '#eee6d2'
      };
    }
    if (l >= 55) {
      return {
        primaryColor: 'Bej',
        compatibleColors: CERAMIC_COLOR_PALETTE['Bej'].compatible,
        colorHex: '#d7c6ac'
      };
    }
    if (l < 55 && s >= 18) {
      return {
        primaryColor: 'Kahverengi',
        compatibleColors: CERAMIC_COLOR_PALETTE['Kahverengi'].compatible,
        colorHex: '#764e30'
      };
    }
  }

  // 3. Fallback: Find closest centroid in Euclidean distance
  let minDistance = Infinity;
  let bestColorKey = 'Gri';

  for (const [key, val] of Object.entries(CERAMIC_COLOR_PALETTE)) {
    const dist = calculateRgbDistance(rgb, val.centroid);
    if (dist < minDistance) {
      minDistance = dist;
      bestColorKey = key;
    }
  }

  const bestColorConfig = CERAMIC_COLOR_PALETTE[bestColorKey];
  return {
    primaryColor: bestColorConfig.name,
    compatibleColors: bestColorConfig.compatible,
    colorHex: `rgb(${bestColorConfig.centroid.join(',')})`
  };
}

/**
 * Searches the database for matching products by visual color and returns ranked results
 */
export async function searchProductsByVisualColor(prisma, {
  detectedColor = 'Gri',
  colorFamilies = [],
  rgb = null,
  style = null,
  limit = 40
}) {
  const colorEntry = CERAMIC_COLOR_PALETTE[detectedColor] || CERAMIC_COLOR_PALETTE['Gri'];
  
  // Combine detected color, its aliases, and any compatible colors
  const searchTermsSet = new Set();
  searchTermsSet.add(detectedColor);
  
  if (colorEntry.aliases) {
    colorEntry.aliases.forEach(a => searchTermsSet.add(a));
  }
  if (colorEntry.compatible) {
    colorEntry.compatible.forEach(c => searchTermsSet.add(c));
  }
  if (Array.isArray(colorFamilies)) {
    colorFamilies.forEach(f => searchTermsSet.add(f));
  }

  const searchTerms = Array.from(searchTermsSet);

  // 1. Prisma Query: Fetch products that match the color family or keywords
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { color: { in: searchTerms, mode: 'insensitive' } },
        ...searchTerms.slice(0, 6).map(term => ({
          name: { contains: term, mode: 'insensitive' }
        }))
      ]
    },
    take: limit * 2, // Fetch slightly more to rank and slice
    include: {
      brand: {
        select: { id: true, name: true, logoUrl: true }
      },
      campaigns: {
        where: {
          status: 'ACTIVE',
          budget: { gt: 0 }
        },
        select: {
          id: true,
          bidAmount: true
        }
      }
    }
  });

  // Target RGB for distance scoring
  const targetRgb = rgb || colorEntry.centroid;

  // 2. Score and rank each product
  const scoredProducts = products.map(product => {
    let score = 75; // base score

    const prodColorLower = (product.color || '').toLowerCase().trim();
    const detectedLower = detectedColor.toLowerCase().trim();

    // Exact color name match: 92 - 97%
    if (prodColorLower === detectedLower) {
      score = 94;
    } 
    // Alias / Primary compatible match: 86 - 92%
    else if (colorEntry.aliases.some(a => a.toLowerCase() === prodColorLower)) {
      score = 90;
    }
    // Broader compatible match: 80 - 86%
    else if (colorEntry.compatible.some(c => c.toLowerCase() === prodColorLower)) {
      score = 84;
    }

    // Name keyword match bonus
    const prodNameLower = (product.name || '').toLowerCase();
    if (prodNameLower.includes(detectedLower)) {
      score += 2;
    }

    // Style match bonus (e.g. Mermer, Ahşap, Beton)
    if (style && product.style && product.style.toLowerCase() === style.toLowerCase()) {
      score += 2;
    }

    // Known color centroid distance adjustment
    const matchedCentroid = CERAMIC_COLOR_PALETTE[product.color]?.centroid;
    if (matchedCentroid && targetRgb) {
      const dist = calculateRgbDistance(targetRgb, matchedCentroid);
      const distAdjustment = Math.max(-4, Math.min(3, Math.round((80 - dist) / 20)));
      score += distAdjustment;
    }

    // Small deterministic pseudo-variance based on product id
    const idHash = (product.id || '').charCodeAt(0) % 3;
    score = Math.max(70, Math.min(98, score + idHash));

    return {
      ...product,
      similarityScore: score,
      detectedColorMatch: detectedColor,
      isFallback: false
    };
  });

  // Sort descending by similarity score
  scoredProducts.sort((a, b) => b.similarityScore - a.similarityScore);

  const finalProducts = scoredProducts.slice(0, limit);

  return {
    products: finalProducts,
    detectedColor,
    compatibleColors: colorEntry.compatible,
    totalCount: finalProducts.length
  };
}
