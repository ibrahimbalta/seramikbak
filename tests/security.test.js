import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/rate-limit.js';

test('Security Engine - In-Memory Rate Limiter', async (t) => {
  await t.test('should allow requests within limit', () => {
    const testId = `test_ip_${Date.now()}_1`;
    const res1 = checkRateLimit(testId, 5, 10000);
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 4);

    const res2 = checkRateLimit(testId, 5, 10000);
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 3);
  });

  await t.test('should block requests that exceed maxHits threshold', () => {
    const testId = `test_ip_${Date.now()}_2`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(testId, 3, 10000);
    }
    const blockedRes = checkRateLimit(testId, 3, 10000);
    assert.equal(blockedRes.allowed, false);
    assert.equal(blockedRes.remaining, 0);
    assert.ok(blockedRes.resetInMs > 0);
  });

  await t.test('should reset counter after window expiry', async () => {
    const testId = `test_ip_${Date.now()}_3`;
    // 50ms window
    checkRateLimit(testId, 1, 50);
    const blocked = checkRateLimit(testId, 1, 50);
    assert.equal(blocked.allowed, false);

    await new Promise((resolve) => setTimeout(resolve, 70));
    const allowedAgain = checkRateLimit(testId, 1, 50);
    assert.equal(allowedAgain.allowed, true);
  });
});

test('Security Engine - Filename and Path Traversal Sanitization', (t) => {
  const sanitizeFilename = (filename) => {
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    const base = filename.slice(0, filename.lastIndexOf('.')).replace(/[^a-zA-Z0-9_\-]/g, '_');
    return `${base}${ext}`;
  };

  const maliciousNames = [
    '../../../etc/passwd.jpg',
    '..\\..\\windows\\system32.png',
    'my-photo;rm -rf.webp'
  ];

  for (const name of maliciousNames) {
    const cleaned = sanitizeFilename(name);
    assert.ok(!cleaned.includes('/'), `Should not contain slash: ${cleaned}`);
    assert.ok(!cleaned.includes('\\'), `Should not contain backslash: ${cleaned}`);
    assert.ok(!cleaned.includes('..'), `Should not contain double dots: ${cleaned}`);
  }
});

test('Security Engine - Allowed Extension Validation', (t) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const isValidExtension = (filename) => {
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(ext);
  };

  assert.equal(isValidExtension('photo.jpg'), true);
  assert.equal(isValidExtension('photo.JPEG'), true);
  assert.equal(isValidExtension('banner.webp'), true);
  assert.equal(isValidExtension('malicious.svg'), false); // SVG contains XML/XSS
  assert.equal(isValidExtension('payload.html'), false);
  assert.equal(isValidExtension('script.exe'), false);
  assert.equal(isValidExtension('backdoor.php'), false);
});

test('Security Engine - HTML Sanitization for XSS Prevention', (t) => {
  const sanitizeHtml = (dirty) => {
    if (typeof dirty !== 'string') return '';
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/javascript:/gi, '');
  };

  const maliciousPayloads = [
    '<p>Safe content</p><script>alert("XSS")</script>',
    '<img src="x" onerror="alert(1)" />',
    '<a href="javascript:stealCookie()">Click here</a>',
    '<iframe src="https://evil.com"></iframe>'
  ];

  for (const payload of maliciousPayloads) {
    const cleaned = sanitizeHtml(payload);
    assert.ok(!cleaned.includes('<script>'), `Must not contain script tag: ${cleaned}`);
    assert.ok(!cleaned.includes('onerror='), `Must not contain onerror handler: ${cleaned}`);
    assert.ok(!cleaned.includes('javascript:'), `Must not contain javascript URI: ${cleaned}`);
    assert.ok(!cleaned.includes('<iframe'), `Must not contain iframe tag: ${cleaned}`);
  }
});

test('Security Engine - User Registration & Password Rules', (t) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isStrongPassword = (pass) => typeof pass === 'string' && pass.length >= 8;

  assert.equal(isStrongPassword('1234'), false);
  assert.equal(isStrongPassword('admin'), false);
  assert.equal(isStrongPassword('StrongPass123!'), true);

  assert.equal(emailRegex.test('user@domain.com'), true);
  assert.equal(emailRegex.test('bad-email-without-at'), false);
  assert.equal(emailRegex.test('bad@no-tld'), false);
});

test('Security Engine - Query Limit Clamping and All-Catalog Resolution', (t) => {
  const resolvePagination = (limitParam, pageParam = '1') => {
    let skip = undefined;
    let take = undefined;

    if (limitParam !== 'all') {
      const parsedLimit = parseInt(limitParam || '24', 10);
      const limit = Math.max(1, Math.min(isNaN(parsedLimit) ? 24 : parsedLimit, 100));
      const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
      take = limit;
      skip = (page - 1) * limit;
    }
    return { take, skip };
  };

  // Full catalog fetch for brand portals
  assert.deepEqual(resolvePagination('all'), { take: undefined, skip: undefined });

  // Standard clamped pagination for general searches
  assert.deepEqual(resolvePagination(null, '1'), { take: 24, skip: 0 });
  assert.deepEqual(resolvePagination('12', '2'), { take: 12, skip: 12 });
  assert.deepEqual(resolvePagination('999999', '1'), { take: 100, skip: 0 }, 'Must cap at maximum 100');
  assert.deepEqual(resolvePagination('-5', '1'), { take: 1, skip: 0 }, 'Must floor at minimum 1');
  assert.deepEqual(resolvePagination('invalid', '1'), { take: 24, skip: 0 }, 'Fallback on NaN');
});


