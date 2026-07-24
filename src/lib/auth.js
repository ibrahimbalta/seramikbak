import crypto from 'crypto';

/**
 * Hashes a plaintext password using PBKDF2.
 * Output format: "salt:hash"
 * @param {string} password 
 * @returns {string}
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored hash.
 * Supports legacy plaintext and 1,000-iteration hashes for backward compatibility.
 * @param {string} password 
 * @param {string} storedPassword 
 * @returns {boolean}
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;
  
  // Backward compatibility fallback for legacy plaintext passwords
  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }
  
  const [salt, originalHash] = storedPassword.split(':');
  if (!salt || !originalHash) return false;
  
  // Try modern 100,000 iterations first
  const modernHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  if (modernHash === originalHash) return true;

  // Fallback to legacy 1000 iterations
  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return legacyHash === originalHash;
}
