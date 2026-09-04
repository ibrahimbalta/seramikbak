import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/lib/slugify.js';

test('Slugify Helper - Turkish Character Normalization & SEO URL Slugs', async (t) => {
  await t.test('should convert Turkish brand names correctly', () => {
    assert.equal(slugify('Çanakkale Seramik'), 'canakkale-seramik');
    assert.equal(slugify('NG Kütahya Seramik'), 'ng-kutahya-seramik');
    assert.equal(slugify('İzmir Şehir Bayii'), 'izmir-sehir-bayii');
    assert.equal(slugify('Uşak Seramik Gümüş Porselen'), 'usak-seramik-gumus-porselen');
  });

  await t.test('should strip special characters and trim hyphens', () => {
    assert.equal(slugify('Calacatta Gold (60x120 cm) %100 Parlak!'), 'calacatta-gold-60x120-cm-100-parlak');
    assert.equal(slugify('   Mermer  &  Beton   '), 'mermer-beton');
  });

  await t.test('should handle empty or null inputs safely', () => {
    assert.equal(slugify(''), '');
    assert.equal(slugify(null), '');
    assert.equal(slugify(undefined), '');
  });
});
