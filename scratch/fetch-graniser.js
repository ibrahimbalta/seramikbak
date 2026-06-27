const fs = require('fs');
const path = require('path');
const https = require('https');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,*/*'
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function getHtmlRetry(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try { return await getHtml(url); }
    catch (e) {
      if (i < retries) await sleep(3000);
      else throw e;
    }
  }
}

function parseViewState(html) {
  const vsMatch = html.match(/__VIEWSTATE[^>]+value="([^"]+)"/);
  if (!vsMatch) return null;
  return Buffer.from(vsMatch[1], 'base64').toString('utf8');
}

function extractProductsFromDecoded(decoded) {
  const products = [];
  const seen = new Set();
  
  // Pattern: after the 3rd occurrence of an alturunler image,
  // we find: \xNN + SERIESNAME + \xNN + "SIZE COLORd"
  // We can directly use this regex on the decoded ViewState:
  // Look for: (alturunler image path) followed by \x06 or similar + SERIES + \x0b or similar + SIZE COLOR + "d"
  const regex = /\/images\/alturunler\/([\w_.-]+)\.jpg[\x00-\x1f]+([A-Z][A-Z_\s]{1,30}?)[\x00-\x1f]+(\d+[xX]\d+\s+[\w\s]+?)d/g;
  let m;
  while ((m = regex.exec(decoded)) !== null) {
    const filename = m[1];
    const seriesName = m[2].trim();
    const desc = m[3].trim();
    const key = filename;
    
    if (seen.has(key)) continue;
    seen.add(key);
    
    const sizeMatch = desc.match(/(\d+)[xX](\d+)\s+(.*)/);
    if (sizeMatch) {
      products.push({
        seriesName,
        width: parseInt(sizeMatch[1]),
        height: parseInt(sizeMatch[2]),
        colorName: sizeMatch[3].trim(),
        imageUrl: 'https://www.graniser.com.tr/images/alturunler/' + filename + '.jpg',
        filename
      });
    }
  }
  
  // Extract properties
  const isPolished = decoded.includes('PARLATILMI');
  const isMatt = decoded.toLowerCase().includes('mat ');
  const isRectified = decoded.includes('REKT');
  
  products.forEach(p => {
    // Also check filename for finish: pol=polished, mat=matt
    if (p.filename.includes('_pol_') || isPolished) p.finish = 'Parlak';
    else if (p.filename.includes('_mat_') || isMatt) p.finish = 'Mat';
    else p.finish = 'Mat';
    p.rectified = isRectified;
  });
  
  return products;
}

function extractNavigationLinks(decoded) {
  const navRegex = /\/urunler\/\d+\/[\w_-]+\/\d+\/([\w-]+)\.aspx/gi;
  const links = [];
  let m;
  while ((m = navRegex.exec(decoded)) !== null) {
    const full = m[0];
    if (!links.find(l => l.url === full)) {
      links.push({ url: full, name: m[1].toUpperCase() });
    }
  }
  return links;
}

async function main() {
  console.log('=== Graniser Tüm Ürün Tarayıcı v3 ===\n');
  
  const initialSeries = [
    '/urunler/1002/yer_ve_duvar_karosu/503/vienna.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/502/dougles.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/501/irona.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/499/calvera.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/494/durham.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/498/sirius.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/497/karyon.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/496/harmony.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/495/doreva.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/493/velora.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/492/bolti.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/491/mothica.aspx',
    '/urunler/1002/yer_ve_duvar_karosu/440/echo.aspx'
  ];
  
  const visited = new Set();
  const queue = [...initialSeries];
  const allProducts = [];
  let seriesWithProducts = 0;
  
  while (queue.length > 0) {
    const seriesPath = queue.shift();
    if (visited.has(seriesPath)) continue;
    visited.add(seriesPath);
    
    const nameMatch = seriesPath.match(/\/([\w-]+)\.aspx$/i);
    const seriesName = nameMatch ? nameMatch[1].toUpperCase() : 'UNKNOWN';
    const fullUrl = 'https://www.graniser.com.tr' + seriesPath;
    
    try {
      const html = await getHtmlRetry(fullUrl);
      const decoded = parseViewState(html);
      if (!decoded) continue;
      
      const products = extractProductsFromDecoded(decoded);
      
      if (products.length > 0) {
        seriesWithProducts++;
        console.log(`[${visited.size}] ${seriesName}: ${products.length} ürün`);
        products.forEach(p => console.log(`    -> ${p.seriesName} ${p.colorName} ${p.width}x${p.height} (${p.finish})`));
        allProducts.push(...products);
      }
      
      // Discover more series
      const navLinks = extractNavigationLinks(decoded);
      for (const link of navLinks) {
        if (!visited.has(link.url) && !queue.includes(link.url)) {
          queue.push(link.url);
        }
      }
      
      await sleep(300);
    } catch (err) {
      console.error(`[${visited.size}] ${seriesName}: HATA - ${err.message}`);
    }
  }
  
  console.log(`\n=== Toplam: ${visited.size} seri tarandı, ${seriesWithProducts} seride ürün bulundu, ${allProducts.length} ürün ===`);
  
  // Build final products
  const finalProducts = allProducts.map(p => {
    let color = 'Gri';
    const cn = (p.colorName || '').toLowerCase();
    if (cn.includes('bone') || cn.includes('ivory')) color = 'Bej';
    else if (cn.includes('white') || cn.includes('beyaz')) color = 'Beyaz';
    else if (cn.includes('grey') || cn.includes('gray') || cn.includes('anthracite') || cn.includes('antrasit') || cn.includes('dark')) color = 'Gri';
    else if (cn.includes('beige') || cn.includes('bej')) color = 'Bej';
    else if (cn.includes('cream') || cn.includes('krem')) color = 'Krem';
    else if (cn.includes('brown') || cn.includes('kahve') || cn.includes('walnut') || cn.includes('noce') || cn.includes('taupe') || cn.includes('mocha') || cn.includes('tobacco')) color = 'Kahverengi';
    else if (cn.includes('black') || cn.includes('siyah') || cn.includes('nero')) color = 'Siyah';
    else if (cn.includes('blue') || cn.includes('mavi')) color = 'Mavi';
    else if (cn.includes('green') || cn.includes('yeşil') || cn.includes('moss')) color = 'Yeşil';
    else if (cn.includes('sand') || cn.includes('gold')) color = 'Bej';
    
    let style = 'Mermer';
    const sn = p.seriesName.toLowerCase();
    if (sn.includes('wood') || sn.includes('oak') || sn.includes('joy') || sn.includes('nice') || sn.includes('teak') || sn.includes('pine') || sn.includes('sekoya') || sn.includes('longford')) style = 'Ahşap';
    else if (sn.includes('stone') || sn.includes('rock') || sn.includes('lime') || sn.includes('travertin')) style = 'Taş';
    else if (sn.includes('cement') || sn.includes('beton') || sn.includes('urban') || sn.includes('moov')) style = 'Beton';
    
    const titleSeries = p.seriesName.charAt(0) + p.seriesName.slice(1).toLowerCase().replace(/_/g, ' ');
    const name = `Graniser ${titleSeries} ${p.colorName} ${p.width}x${p.height}`;
    const code = `GRN-${p.filename.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 25)}`;
    
    return {
      name, code,
      width: p.width, height: p.height,
      color, finish: p.finish, style,
      area: 'Yer,Duvar,Mutfak,Banyo',
      thickness: 9,
      rectified: p.rectified || false,
      imageUrl: p.imageUrl, textureUrl: p.imageUrl,
      sourceUrl: 'https://www.graniser.com.tr/urunler.aspx'
    };
  });
  
  const outputPath = path.join(__dirname, 'graniser-products.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log(`Kaydedildi: ${outputPath}`);
}

main().catch(console.error).finally(() => process.exit(0));
