import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptSession, decryptSession } from '../src/lib/session.js';

test('Session Library - AES-256-CBC Token Encryption & Decryption', async (t) => {
  await t.test('should encrypt payload into secure token format', () => {
    const payload = { id: 'usr-123', email: 'test@seramikbak.com', role: 'admin' };
    const token = encryptSession(payload);

    assert.ok(token.includes(':'), 'Token must contain IV hex separator ":"');
    const [ivHex, encryptedHex] = token.split(':');
    assert.equal(ivHex.length, 32, 'IV length should be 32 hex characters (16 bytes)');
    assert.ok(encryptedHex.length > 0, 'Encrypted data payload should not be empty');
  });

  await t.test('should decrypt valid token back to original payload', () => {
    const originalPayload = { id: 'usr-456', name: 'Ahmet Yılmaz', role: 'user' };
    const token = encryptSession(originalPayload);

    const decrypted = decryptSession(token);
    assert.ok(decrypted, 'Decrypted session should not be null');
    assert.equal(decrypted.id, originalPayload.id);
    assert.equal(decrypted.name, originalPayload.name);
    assert.equal(decrypted.role, originalPayload.role);
    assert.ok(decrypted.expiresAt > Date.now(), 'Token must have future expiration timestamp');
  });

  await t.test('should return null for tampered or invalid tokens', () => {
    const invalidToken = 'invalid_iv_hex:invalid_payload_hex';
    assert.equal(decryptSession(invalidToken), null, 'Tampered token should decrypt to null');

    assert.equal(decryptSession(''), null, 'Empty token should decrypt to null');
    assert.equal(decryptSession(null), null, 'Null token should decrypt to null');
  });

  await t.test('should reject expired tokens', () => {
    const expiredToken = encryptSession({ id: 'usr-expired' }, -1000); // Expired 1 second ago
    const decrypted = decryptSession(expiredToken);
    assert.equal(decrypted, null, 'Expired token should return null');
  });
});
