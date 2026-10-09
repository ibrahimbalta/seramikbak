import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptSession, decryptSession } from '../src/lib/session.js';

test('Session Library - AES-256-GCM Token Encryption & Decryption', async (t) => {
  await t.test('should encrypt payload into secure AES-256-GCM token format (iv:tag:data)', () => {
    const payload = { id: 'usr-123', email: 'test@seramikbak.com', role: 'admin' };
    const token = encryptSession(payload);

    assert.ok(token.includes(':'), 'Token must contain ":" separators');
    const parts = token.split(':');
    assert.equal(parts.length, 3, 'GCM token must have 3 parts: iv, authTag, and ciphertext');
    assert.equal(parts[0].length, 32, 'IV length should be 32 hex characters (16 bytes)');
    assert.equal(parts[1].length, 32, 'Auth tag length should be 32 hex characters (16 bytes)');
    assert.ok(parts[2].length > 0, 'Encrypted data payload should not be empty');
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
    const validToken = encryptSession({ id: 'usr-tamper', role: 'admin' });
    const parts = validToken.split(':');
    // Tamper with ciphertext by flipping characters
    const tamperedCiphertext = parts[2].slice(0, -2) + (parts[2].slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedToken = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;
    assert.equal(decryptSession(tamperedToken), null, 'Tampered GCM token should fail auth tag verification');

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
