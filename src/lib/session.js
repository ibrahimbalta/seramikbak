import crypto from 'crypto';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('CRITICAL SECURITY: SESSION_SECRET ortam değişkeni üretim ortamında tanımlanmalıdır.');
}

const SECRET = process.env.SESSION_SECRET || 'seramikbak_dev_session_key_do_not_use_in_prod';
const GCM_ALGORITHM = 'aes-256-gcm';
const CBC_ALGORITHM = 'aes-256-cbc';

// Generate 32-byte key deterministically from secret using SHA-256
const KEY = crypto.createHash('sha256').update(SECRET).digest();

/**
 * Encrypts a JSON payload into a secure hex token using AES-256-GCM (AEAD).
 * Includes an expiration timestamp.
 * @param {object} data 
 * @param {number} durationMs 
 * @returns {string} ivHex:tagHex:encryptedHex
 */
export function encryptSession(data, durationMs = 7 * 24 * 60 * 60 * 1000) { // Default 7 days
  const payload = {
    ...data,
    expiresAt: Date.now() + durationMs,
  };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(GCM_ALGORITHM, KEY, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a secure hex token and returns the JSON payload.
 * Supports AES-256-GCM (3 parts) and legacy AES-256-CBC (2 parts).
 * Returns null if signature/tag is invalid, corrupted or expired.
 * @param {string} token 
 * @returns {object|null}
 */
export function decryptSession(token) {
  if (!token) return null;
  try {
    const parts = token.split(':');
    let payload = null;

    if (parts.length === 3) {
      // Modern AES-256-GCM (Authenticated Encryption)
      const [ivHex, tagHex, encryptedHex] = parts;
      if (!ivHex || !tagHex || !encryptedHex) return null;
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(GCM_ALGORITHM, KEY, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      payload = JSON.parse(decrypted);
    } else if (parts.length === 2) {
      // Legacy AES-256-CBC fallback
      const [ivHex, encryptedHex] = parts;
      if (!ivHex || !encryptedHex) return null;
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(CBC_ALGORITHM, KEY, iv);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      payload = JSON.parse(decrypted);
    } else {
      return null;
    }

    // Check expiration
    if (payload && payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}
