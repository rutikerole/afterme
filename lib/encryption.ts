import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment or derive from password
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // If key is base64 encoded and correct length, use directly
  const keyBuffer = Buffer.from(envKey, 'base64');
  if (keyBuffer.length === KEY_LENGTH) {
    return keyBuffer;
  }

  // Otherwise, derive key from the string using scrypt
  const salt = Buffer.alloc(SALT_LENGTH, 'afterme-static-salt');
  return scryptSync(envKey, salt, KEY_LENGTH);
}

/**
 * Encrypt sensitive data
 * @param plaintext - The data to encrypt
 * @returns Encrypted data as base64 string (format: iv:tag:ciphertext)
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Combine IV, auth tag, and ciphertext
    const combined = Buffer.concat([
      iv,
      tag,
      Buffer.from(encrypted, 'base64')
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract IV, auth tag, and ciphertext
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt an object (converts to JSON, then encrypts)
 */
export function encryptObject<T>(obj: T): string {
  const json = JSON.stringify(obj);
  return encrypt(json);
}

/**
 * Decrypt to an object (decrypts, then parses JSON)
 */
export function decryptObject<T>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json) as T;
}

/**
 * Encrypt sensitive fields in a vault item
 * Only encrypts fields that contain sensitive information
 */
export function encryptSensitiveFields(data: Record<string, unknown>, sensitiveFields: string[]): Record<string, unknown> {
  const result = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string);
      result[`${field}_encrypted`] = true;
    } else if (result[field] && typeof result[field] === 'object') {
      result[field] = encryptObject(result[field]);
      result[`${field}_encrypted`] = true;
    }
  }

  return result;
}

/**
 * Decrypt sensitive fields in a vault item
 */
export function decryptSensitiveFields(data: Record<string, unknown>, sensitiveFields: string[]): Record<string, unknown> {
  const result = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] && result[`${field}_encrypted`]) {
      try {
        const decrypted = decrypt(result[field] as string);
        // Try to parse as JSON, otherwise return as string
        try {
          result[field] = JSON.parse(decrypted);
        } catch {
          result[field] = decrypted;
        }
        delete result[`${field}_encrypted`];
      } catch (error) {
        console.error(`[Encryption] Failed to decrypt field ${field}:`, error);
        // Keep the encrypted value if decryption fails
      }
    }
  }

  return result;
}

/**
 * Hash sensitive data for searching (one-way)
 * Useful for searching encrypted data without decrypting
 */
export function hashForSearch(data: string): string {
  const key = getEncryptionKey();
  const hash = scryptSync(data.toLowerCase().trim(), key, 32);
  return hash.toString('hex');
}

/**
 * Mask a string, showing only last N characters
 */
export function maskString(str: string, showLast: number = 4): string {
  if (!str || str.length <= showLast) {
    return '••••';
  }
  const masked = '•'.repeat(Math.min(str.length - showLast, 8));
  return masked + str.slice(-showLast);
}

/**
 * Check if data is encrypted (simple heuristic)
 */
export function isEncrypted(data: string): boolean {
  try {
    const buffer = Buffer.from(data, 'base64');
    // Check if it's valid base64 and has expected minimum length
    return buffer.length >= IV_LENGTH + TAG_LENGTH + 1;
  } catch {
    return false;
  }
}
