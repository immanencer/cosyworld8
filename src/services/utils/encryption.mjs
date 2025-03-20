import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'; // Node.js crypto module

let mongoClient = null;

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes key from env (e.g., generate with `openssl rand -hex 32`)
if (ENCRYPTION_KEY.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');

export function encrypt(text) {
    const iv = randomBytes(12); // 12 bytes IV for GCM
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`; // Store IV, encrypted text, and auth tag
}

export function decrypt(encryptedData) {
    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}