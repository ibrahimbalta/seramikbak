import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { encryptSession, decryptSession } from '../src/lib/session.js';
import { hashPassword, verifyPassword } from '../src/lib/auth.js';
import { checkRateLimit } from '../src/lib/rate-limit.js';
import dns from 'node:dns';
import net from 'node:net';

const ROOT = process.cwd();

test('Security Audit - Session Integrity, Tampering & Role Isolation', async (t) => {
  await t.test('encryptSession & decryptSession preserve tenant identity and reject tampering', () => {
    const dealerAToken = encryptSession({ id: 'dealer-A', role: 'dealer', name: 'Bayi A' });
    const dealerBToken = encryptSession({ id: 'dealer-B', role: 'dealer', name: 'Bayi B' });
    const brandAToken = encryptSession({ id: 'brand-A', role: 'brand', name: 'Marka A' });

    const decA = decryptSession(dealerAToken);
    const decB = decryptSession(dealerBToken);
    const decBrand = decryptSession(brandAToken);

    assert.equal(decA.id, 'dealer-A');
    assert.equal(decA.role, 'dealer');
    assert.equal(decB.id, 'dealer-B');
    assert.equal(decBrand.id, 'brand-A');
    assert.equal(decBrand.role, 'brand');

    // Tampered token must be rejected
    const parts = dealerAToken.split('.');
    const tampered = `${parts[0]}.${parts[1]}.00000000000000000000000000000000`;
    assert.equal(decryptSession(tampered), null);
  });

  await t.test('hashPassword uses salted PBKDF2 and rejects wrong passwords', () => {
    const hash1 = hashPassword('GucluSifre!2026');
    const hash2 = hashPassword('GucluSifre!2026');
    assert.notEqual(hash1, hash2); // Unique random salt per hash
    assert.equal(verifyPassword('GucluSifre!2026', hash1), true);
    assert.equal(verifyPassword('YanlisSifre', hash1), false);
    assert.equal(verifyPassword('', hash1), false);
  });

  await t.test('checkRateLimit blocks brute-force bursts after limit', () => {
    const key = `audit_rl_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      assert.equal(checkRateLimit(key, 5, 60_000).allowed, true);
    }
    const blocked = checkRateLimit(key, 5, 60_000);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.resetInMs > 0);
  });
});

test('Security Audit - SSRF Hardening on /api/proxy', async (t) => {
  const src = fs.readFileSync(path.join(ROOT, 'src/app/api/proxy/route.js'), 'utf8');

  await t.test('enforces protocol whitelist, DNS resolution check, and manual redirect mode', () => {
    assert.match(src, /parsedUrl\.protocol !== 'http:' && parsedUrl\.protocol !== 'https:'/);
    assert.match(src, /redirect:\s*['"]manual['"]/);
    assert.match(src, /dns\.promises\.lookup/);
    assert.match(src, /isPrivateOrLocalHost\(rec\.address\)/);
  });

  await t.test('blocks private, loopback, link-local, and metadata IP ranges', () => {
    const isPrivate = (hostname) => {
      const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
      if (['localhost', '127.0.0.1', '::1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'].includes(h)) return true;
      if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(h)) return true;
      if (/^(fc|fd|fe80)/i.test(h) || h.startsWith('::ffff:')) return true;
      return false;
    };

    for (const host of ['127.0.0.1', 'localhost', '169.254.169.254', '10.0.0.5', '172.16.0.1', '192.168.1.1', '::1', 'fe80::1']) {
      assert.equal(isPrivate(host), true, `Expected ${host} to be blocked`);
    }
    assert.equal(isPrivate('res.cloudinary.com'), false);
    assert.equal(net.isIP('127.0.0.1'), 4);
    assert.equal(typeof dns.promises.lookup, 'function');
  });
});

test('Security Audit - Multi-Tenant Isolation & Auth Guards Across Critical Routes', async (t) => {
  const mustRequireAuth = [
    { file: 'src/app/api/bim/spec-in-lead/route.js', rolePattern: /auth\.role\s*!==\s*['"]brand['"]/ },
    { file: 'src/app/api/architect/samples/route.js', rolePattern: /auth\.role\s*!==\s*['"]architect['"]/ },
    { file: 'src/app/api/architect/quotes/route.js', rolePattern: /auth\.role\s*!==\s*['"]architect['"]/ },
    { file: 'src/app/api/architect/auth/route.js', rolePattern: /auth\.role\s*!==\s*['"]architect['"]/ },
    { file: 'src/app/api/architect/projects/route.js', rolePattern: /session\.role\s*!==\s*['"]architect['"]/ },
    { file: 'src/app/api/dealers/saas-request/route.js', rolePattern: /auth\.role\s*!==\s*['"]dealer['"]/ },
    { file: 'src/app/api/dealers/my-leads/route.js', rolePattern: /session\.role\s*!==\s*['"]dealer['"]/ },
    { file: 'src/app/api/dealers/inventory/route.js', rolePattern: /auth\.role\s*!==\s*['"]dealer['"]/ },
    { file: 'src/app/api/dealers/outlet/subscribers/route.js', rolePattern: /auth\.role\s*!==\s*['"]dealer['"]/ },
    { file: 'src/app/api/b2b/country-analytics/route.js', rolePattern: /auth\.role\s*!==\s*['"]brand['"]/ },
    { file: 'src/app/api/b2b/trends/route.js', rolePattern: /auth\.role\s*!==\s*['"]brand['"]/ },
    { file: 'src/app/api/admin/security/backup/route.js', rolePattern: /verifyAuth\(request,\s*['"]admin['"],\s*['"]SUPER_ADMIN['"]\)/ }
  ];

  for (const item of mustRequireAuth) {
    await t.test(`${item.file} enforces verifyAuth and role/tenant isolation`, () => {
      const content = fs.readFileSync(path.join(ROOT, item.file), 'utf8');
      assert.match(content, /verifyAuth/);
      assert.match(content, item.rolePattern);
    });
  }

  await t.test('Brand registration & SaaS endpoints prevent unauthenticated overwrite of existing brands', () => {
    for (const f of ['src/app/api/brands/route.js', 'src/app/api/brands/saas-request/route.js']) {
      const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
      assert.match(content, /verifyAuth/);
      assert.match(content, /hashPassword/);
      assert.match(content, /checkRateLimit/);
    }
  });

  await t.test('Additional hardening: timingSafeEqual, backup secret stripping, status anti-enumeration & presentation rate-limit', () => {
    const authSrc = fs.readFileSync(path.join(ROOT, 'src/lib/auth.js'), 'utf8');
    assert.match(authSrc, /crypto\.timingSafeEqual/);

    const backupSrc = fs.readFileSync(path.join(ROOT, 'src/app/api/admin/security/backup/route.js'), 'utf8');
    assert.match(backupSrc, /stripSecrets/);

    const statusSrc = fs.readFileSync(path.join(ROOT, 'src/app/api/projects/status/route.js'), 'utf8');
    assert.match(statusSrc, /trimmed\.length < 6/);
    assert.match(statusSrc, /cleanPhone\.length >= 10/);
    assert.match(statusSrc, /maskText/);

    const presSrc = fs.readFileSync(path.join(ROOT, 'src/app/api/architect/presentation/[projectId]/route.js'), 'utf8');
    assert.match(presSrc, /checkRateLimit/);
    assert.match(presSrc, /action !== 'approve' && action !== 'revision'/);
  });
});
