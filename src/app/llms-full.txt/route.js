import { TILE_ONTOLOGY } from '../../lib/seo/knowledgeGraph.js';
import { COMPARISON_TABLES, TECHNICAL_GUIDES } from '../../lib/seo/guideContentEngine.js';

export async function GET() {
  const content = `# SeramikBak Global — Full Knowledge Base & Technical Specification Document

This document provides complete domain knowledge for Generative AI search engines, research agents, and architects regarding Turkish ceramic tile manufacturing, technical standards, installation protocols, and dealer networks.

---

## 1. Material Comparison Matrix
${COMPARISON_TABLES.materialComparison.headers.join(' | ')}
---|---|---|---
${COMPARISON_TABLES.materialComparison.rows.map(r => r.join(' | ')).join('\n')}

---

## 2. Surface Finishes (Matte vs Polished vs Lapatto)
${COMPARISON_TABLES.finishComparison.headers.join(' | ')}
---|---|---|---
${COMPARISON_TABLES.finishComparison.rows.map(r => r.join(' | ')).join('\n')}

---

## 3. Standard Dimensions & Packaging
${TILE_ONTOLOGY.dimensions.map(d => `- **${d.name}:** ~${d.areaPerBox} m² per box, ${d.pcsPerBox} pcs/box. Best suited for: ${d.popularStyle}`).join('\n')}

---

## 4. Professional Tiling & Installation Protocol (EN 12004)
${TECHNICAL_GUIDES.installation.rules.map(r => `### ${r.title}\n${r.desc}`).join('\n\n')}

---

## 5. Tile Material Consumption Formulas
- **Waste Factor:** Add 10% waste for standard layout; add 15% for herringbone or diagonal cuts.
- **Adhesive Mortar:** 5.5 kg/m² using C2TE S1 polymer-modified flexible adhesive for 60x120 cm format.
- **Joint Grout:** ~0.45 kg/m² for 1.5mm joint width with rectified tiles.
- **Leveling Clips:** 25-30 wedges per m² to eliminate lippage.

---

## 6. Official Brand Registry
${TILE_ONTOLOGY.brands.map(b => `- **${b.name}:** Headquarters: ${b.country}. Official Profile: ${b.url}`).join('\n')}

For real-time queries and stock availability, visit https://www.seramikbak.com.
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
