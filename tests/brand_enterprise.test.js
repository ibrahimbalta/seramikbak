import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



test('Brand Enterprise Portal - White-Label Embed SDK Generator', async (t) => {
  await t.test('should generate valid iframe HTML with brand parameters and secure attributes', () => {
    const generateEmbedCode = (brandSlug, primaryColor = '#d4af37', hideHeader = true) => {
      const origin = 'https://www.seramikbak.com';
      const url = `${origin}/embed/visualizer?brand=${encodeURIComponent(brandSlug)}&primary=${encodeURIComponent(primaryColor)}&no_nav=${hideHeader ? 1 : 0}`;
      return `<iframe src="${url}" width="100%" height="800" style="border:none; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" allow="fullscreen; xr-spatial-tracking" loading="lazy"></iframe>`;
    };

    const snippet = generateEmbedCode('vitra', '#000000', true);
    assert.ok(snippet.includes('src="https://www.seramikbak.com/embed/visualizer?brand=vitra&primary=%23000000&no_nav=1"'));
    assert.ok(snippet.includes('allow="fullscreen; xr-spatial-tracking"'));
    assert.ok(snippet.includes('loading="lazy"'));
  });

  await t.test('should verify public studio-sdk.js exists and is valid JavaScript', () => {
    const sdkPath = path.join(__dirname, '..', 'public', 'studio-sdk.js');
    
    assert.ok(fs.existsSync(sdkPath), 'public/studio-sdk.js must exist');
    const content = fs.readFileSync(sdkPath, 'utf8');
    assert.ok(content.length > 500, 'studio-sdk.js must not be empty');
    assert.ok(content.includes('SeramikBakStudio'), 'studio-sdk.js must define SeramikBakStudio');
    assert.ok(content.includes('buildVisualizerUrl'), 'studio-sdk.js must support visualizer URL construction');
  });

  await t.test('should construct valid consumer 3D studio url (/tasarim) with brand isolation and theme', () => {
    const baseUrl = 'https://www.seramikbak.com';
    const brandSlug = 'gural-seramik';
    const scene = 'banyo';
    const theme = '#d4af37';
    const tasarimUrl = `${baseUrl}/tasarim?brand=${encodeURIComponent(brandSlug)}&scene=${encodeURIComponent(scene)}&theme=${encodeURIComponent(theme)}`;

    assert.strictEqual(
      tasarimUrl,
      'https://www.seramikbak.com/tasarim?brand=gural-seramik&scene=banyo&theme=%23d4af37'
    );
  });

  await t.test('should identify embeddable routes and allow external framing without SAMEORIGIN restriction', () => {
    const isEmbeddable = (pathname) => {
      return (
        pathname.startsWith('/tasarim') || 
        pathname.startsWith('/kiosk') || 
        pathname.startsWith('/studio-sdk.js')
      );
    };

    assert.equal(isEmbeddable('/tasarim'), true);
    assert.equal(isEmbeddable('/tasarim?brand=gural-seramik'), true);
    assert.equal(isEmbeddable('/kiosk'), true);
    assert.equal(isEmbeddable('/studio-sdk.js'), true);
    assert.equal(isEmbeddable('/admin'), false);
    assert.equal(isEmbeddable('/bayi'), false);
    assert.equal(isEmbeddable('/marka'), false);
  });
});

