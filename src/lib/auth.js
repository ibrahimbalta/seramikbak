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
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored hash.
 * Supports legacy plaintext passwords for backward compatibility.
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
  
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}
