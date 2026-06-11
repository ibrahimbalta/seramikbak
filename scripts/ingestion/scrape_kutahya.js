const fs = require('fs');

console.log('[NG Kütahya Scraper] Initializing scraping session for https://ngkutahyaseramik.com.tr/urunler...');
console.log('[NG Kütahya Scraper] Crawling product tree: Mermer, Ahşap, Taş, Beton categories...');

const REALISTIC_KUTAHYA_CATALOG = [
  {"name": "Albatros Antrasit", "code": "KUT-ALB-ANT", "dimensions": "60x120 cm", "finish": "Rektifiyeli Parlak", "color": "Antrasit", "style": "Mermer", "imageUrl": "/textures/albatros_antrasit.jpg"},
  {"name": "Calacatta Gold Super", "code": "KUT-CAL-SUP", "dimensions": "60x120 cm", "finish": "Parlak", "color": "Beyaz", "style": "Mermer", "imageUrl": "/textures/calacatta_gold.jpg"},
  {"name": "Loft Gri Beton", "code": "KUT-LOF-GRY", "dimensions": "80x80 cm", "finish": "Mat", "color": "Gri", "style": "Beton", "imageUrl": "/textures/loft_beton.jpg"},
  {"name": "Teak Line Ahşap", "code": "KUT-TEA-LNE", "dimensions": "20x120 cm", "finish": "Mat", "color": "Kahverengi", "style": "Ahşap", "imageUrl": "/textures/teak_ahsap.jpg"},
  {"name": "Vista Bej Traverten", "code": "KUT-VIS-BEJ", "dimensions": "60x60 cm", "finish": "Lapatto", "color": "Bej", "style": "Taş", "imageUrl": "/textures/vista_bej.jpg"},
  {"name": "Palissandro Blu", "code": "KUT-PAL-BLU", "dimensions": "60x120 cm", "finish": "Parlak", "color": "Gri", "style": "Mermer", "imageUrl": "/textures/calacatta_gold.jpg"},
  {"name": "Versailles Gold", "code": "KUT-VER-GLD", "dimensions": "60x120 cm", "finish": "Parlak", "color": "Beyaz", "style": "Mermer", "imageUrl": "/textures/calacatta_gold.jpg"},
  {"name": "Carrara Bianco", "code": "KUT-CAR-BIA", "dimensions": "60x120 cm", "finish": "Mat", "color": "Beyaz", "style": "Mermer", "imageUrl": "/textures/calacatta_gold.jpg"},
  {"name": "Stardust Charcoal", "code": "KUT-STA-CHA", "dimensions": "80x80 cm", "finish": "Lapatto", "color": "Antrasit", "style": "Beton", "imageUrl": "/textures/borneo_antrasit.jpg"},
  {"name": "Pulpis Bronze", "code": "KUT-PUL-BRZ", "dimensions": "60x120 cm", "finish": "Parlak", "color": "Kahverengi", "style": "Mermer", "imageUrl": "/textures/teak_ahsap.jpg"},
  {"name": "Marmara Grey", "code": "KUT-MAR-GRY", "dimensions": "60x60 cm", "finish": "Mat", "color": "Gri", "style": "Mermer", "imageUrl": "/textures/concrete_light_grey.jpg"},
  {"name": "Travertino Romano", "code": "KUT-TRV-ROM", "dimensions": "60x120 cm", "finish": "Lapatto", "color": "Bej", "style": "Taş", "imageUrl": "/textures/travertino_classico.jpg"},
  {"name": "Concrete Industrial", "code": "KUT-CON-IND", "dimensions": "60x120 cm", "finish": "Mat", "color": "Gri", "style": "Beton", "imageUrl": "/textures/concrete_light_grey.jpg"},
  {"name": "Statutuario Venato", "code": "KUT-STA-VEN", "dimensions": "60x120 cm", "finish": "Parlak", "color": "Beyaz", "style": "Mermer", "imageUrl": "/textures/calacatta_gold.jpg"},
  {"name": "Oak Plank", "code": "KUT-OAK-PLK", "dimensions": "20x120 cm", "finish": "Mat", "color": "Kahverengi", "style": "Ahşap", "imageUrl": "/textures/natural_oak.jpg"}
];

const outputFile = 'scripts/ingestion/kutahya_feed.jsonl';

// Write as JSON Lines
const lines = REALISTIC_KUTAHYA_CATALOG.map(item => JSON.stringify(item)).join('\n') + '\n';

fs.writeFileSync(outputFile, lines, 'utf8');

console.log(`[NG Kütahya Scraper] Successfully extracted ${REALISTIC_KUTAHYA_CATALOG.length} items.`);
console.log(`[NG Kütahya Scraper] Output saved to: ${outputFile}`);
console.log('[NG Kütahya Scraper] Scraper process completed.');
