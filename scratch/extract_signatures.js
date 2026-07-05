const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const textures = [
  { name: 'Calacatta Gold', file: 'calacatta_gold.jpg' },
  { name: 'Borneo Antrasit', file: 'borneo_antrasit.jpg' },
  { name: 'Travertino Classico', file: 'travertino_classico.jpg' },
  { name: 'Natural Oak', file: 'natural_oak.jpg' },
  { name: 'Concrete Light Grey', file: 'concrete_light_grey.jpg' },
  { name: 'Loft Beton', file: 'loft_beton.jpg' },
  { name: 'Teak Ahsap', file: 'teak_ahsap.jpg' },
  { name: 'Vista Bej', file: 'vista_bej.jpg' }
];

const TEXTURES_DIR = path.join(__dirname, '..', 'public', 'textures');

function get4x4Signature(filePath) {
  const fileData = fs.readFileSync(filePath);
  const rawImageData = jpeg.decode(fileData, { useTArray: true });
  
  const w = rawImageData.width;
  const h = rawImageData.height;
  const data = rawImageData.data; // RGBA values
  
  const blockW = Math.floor(w / 4);
  const blockH = Math.floor(h / 4);
  
  const signature = [];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      
      const startX = col * blockW;
      const endX = startX + blockW;
      const startY = row * blockH;
      const endY = startY + blockH;
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * w + x) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }
      
      signature.push(
        Math.round(rSum / count),
        Math.round(gSum / count),
        Math.round(bSum / count)
      );
    }
  }
  
  return signature;
}

const results = {};
textures.forEach(t => {
  const fullPath = path.join(TEXTURES_DIR, t.file);
  try {
    results[t.name] = get4x4Signature(fullPath);
  } catch (err) {
    console.error(`Error processing ${t.name}:`, err.message);
  }
});

console.log("SIGNATURES_RESULT:");
console.log(JSON.stringify(results, null, 2));
