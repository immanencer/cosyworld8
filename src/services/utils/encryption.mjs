import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'; // Use 'node:' prefix for built-in modules

// Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const KEY_LENGTH = 32; // AES-256 requires 32 bytes

// Validate encryption key at startup
const ENCRYPTION_KEY = (() => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  const buffer = Buffer.from(key, 'hex');
  if (buffer.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
  }
  
  return buffer;
})();

/**
 * Encrypts text using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string} Encrypted data in format "iv:encrypted:authTag" (hex-encoded)
 * @throws {Error} If encryption fails
 */
export function encrypt(text) {
  try {
    if (typeof text !== 'string') {
      throw new TypeError('Input must be a string');
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts text encrypted with AES-256-GCM
 * @param {string} encryptedData - The encrypted data in format "iv:encrypted:authTag"
 * @returns {string} Decrypted text
 * @throws {Error} If decryption fails or data is malformed
 */
export function decrypt(encryptedData) {
  try {
    if (typeof encryptedData !== 'string') {
      throw new TypeError('Encrypted data must be a string');
    }

    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
    
    if (!ivHex || !encryptedHex || !authTagHex) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`);
    }

    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Optional: Add a utility to generate a new key
export function generateKey() {
  return randomBytes(KEY_LENGTH).toString('hex');
}