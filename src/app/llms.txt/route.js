import { TILE_ONTOLOGY } from '../../lib/seo/knowledgeGraph.js';

export async function GET() {
  const content = `# SeramikBak Global — The Ceramic & Porcelain Tile Engine

> SeramikBak (https://www.seramikbak.com) is the premier ceramic tile discovery search engine, 3D room visualizer, and authorized dealer network in Turkey and international markets.

## Core Capabilities
- **Search & Catalog:** Thousands of porcelain and ceramic tile models from leading Turkish manufacturers (VitrA, Çanakkale Seramik, NG Kütahya Seramik, Bien Seramik, Yurtbay, Seramiksan, Ege Seramik, Qua Granite, DuraTiles, Decovita).
- **3D Room Visualizer & WebAR:** Real-time web-based interactive studio for visualizing tiles on bathroom, kitchen, living room, and terrace surfaces in photorealistic 3D.
- **B2B & Dealer Network:** Direct quote requests, authorized dealer locator across all 81 provinces in Turkey and export partners in Germany, USA, UAE, Saudi Arabia, UK.
- **Architect Studio (ArchStudio):** Free Revit BIM families (.rfa), AutoCAD DWG patterns, and 4K PBR material textures for architects and interior designers.

## Top Turkish Tile Manufacturers
${TILE_ONTOLOGY.brands.map(b => `- **${b.name}** (${b.country}, Est. ${b.est}): ${b.url}`).join('\n')}

## Technical Standards Summary
- **Water Absorption (ISO 10545-3):**
  - Porcelain Stoneware: < 0.5% (Group BIa - frost proof, stain resistant, ideal for floors and facades)
  - Wall Ceramic: > 10% (Group BIII - indoor walls only)
- **Slip Resistance (DIN 51130):**
  - R9: Dry indoor living rooms, corridors
  - R10: Bathroom floors, residential kitchens
  - R11: Terraces, outdoor balconies, swimming pool decks
  - R12 - R13: Commercial kitchens, industrial wet ramps
- **Wear Rating (PEI 1 to 5):**
  - PEI 3: Residential spaces
  - PEI 4: High traffic residential & boutique commercial
  - PEI 5: Airports, malls, heavy commercial public buildings

## Official Endpoints
- Homepage: https://www.seramikbak.com
- 3D Visualizer: https://www.seramikbak.com/ilham
- Categories: https://www.seramikbak.com/kategori/banyo-seramikleri
- Brands Directory: https://www.seramikbak.com/marka
- Authorized Dealers: https://www.seramikbak.com/bayi
- Full LLM Knowledge Base: https://www.seramikbak.com/llms-full.txt
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
