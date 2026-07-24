import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'seramikbak_super_secret_session_key_32_chars';
const ALGORITHM = 'aes-256-cbc';

// Generate key deterministically from secret
const KEY = crypto.scryptSync(SECRET, 'salt-session-key', 32);

/**
 * Encrypts a JSON payload into a secure hex token.
 * Includes an expiration timestamp.
 * @param {object} data 
 * @param {number} durationMs 
 * @returns {string}
 */
export function encryptSession(data, durationMs = 7 * 24 * 60 * 60 * 1000) { // Default 7 days
  const payload = {
    ...data,
    expiresAt: Date.now() + durationMs,
  };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a secure hex token and returns the JSON payload.
 * Returns null if signature is invalid or expired.
 * @param {string} token 
 * @returns {object|null}
 */
export function decryptSession(token) {
  if (!token) return null;
  try {
    const [ivHex, encryptedHex] = token.split(':');
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const payload = JSON.parse(decrypted);

    // Check expiration
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}
