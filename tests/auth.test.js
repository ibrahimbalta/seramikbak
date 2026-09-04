import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/lib/auth.js';

test('Auth Library - hashPassword and verifyPassword', async (t) => {
  await t.test('should hash password and return salt:hash format', () => {
    const rawPassword = 'SuperSecretPass123!';
    const hashed = hashPassword(rawPassword);

    assert.ok(hashed.includes(':'), 'Hashed password must contain salt separator ":"');
    const [salt, hash] = hashed.split(':');
    assert.equal(salt.length, 32, 'Salt hex length should be 32 characters (16 bytes)');
    assert.equal(hash.length, 128, 'Hash hex length should be 128 characters (64 bytes)');
  });

  await t.test('should verify correct password successfully', () => {
    const rawPassword = 'MySecretPassword2026';
    const hashed = hashPassword(rawPassword);

    const isValid = verifyPassword(rawPassword, hashed);
    assert.equal(isValid, true, 'verifyPassword should return true for correct password');
  });

  await t.test('should reject wrong password', () => {
    const rawPassword = 'MySecretPassword2026';
    const hashed = hashPassword(rawPassword);

    const isValid = verifyPassword('WrongPassword123', hashed);
    assert.equal(isValid, false, 'verifyPassword should return false for incorrect password');
  });

  await t.test('should support legacy plaintext passwords gracefully', () => {
    const legacyPlaintext = 'legacy_admin_pass';

    assert.equal(verifyPassword('legacy_admin_pass', legacyPlaintext), true);
    assert.equal(verifyPassword('wrong_pass', legacyPlaintext), false);
  });

  await t.test('should handle empty or null password inputs safely', () => {
    assert.equal(hashPassword(''), '');
    assert.equal(verifyPassword(null, 'somehash'), false);
    assert.equal(verifyPassword('pass', null), false);
  });
});
