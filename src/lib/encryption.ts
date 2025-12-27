import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Get encryption key from environment variable
 * If not set, generate a temporary one (not recommended for production)
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        console.warn('WARNING: ENCRYPTION_KEY not set in .env. Using temporary key. This is NOT secure for production!');
        // Generate a temporary key (this will change on restart, breaking decryption)
        return crypto.randomBytes(32);
    }

    return Buffer.from(key, 'hex');
}

/**
 * Encrypt an API key for secure storage
 * @param apiKey - The API key to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 */
export function encryptApiKey(apiKey: string): string {
    if (!apiKey) {
        throw new Error('API key cannot be empty');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted API key
 * @param encryptedKey - The encrypted key in format: iv:authTag:encrypted
 * @returns Decrypted API key
 */
export function decryptApiKey(encryptedKey: string): string {
    if (!encryptedKey) {
        throw new Error('Encrypted key cannot be empty');
    }

    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted key format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Mask an API key for display (show only last 4 characters)
 * @param apiKey - The API key to mask
 * @returns Masked key like "sk-...1234" or "AIza...5678"
 */
export function maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
        return '****';
    }

    const prefix = apiKey.startsWith('sk-') ? 'sk-' :
        apiKey.startsWith('AIza') ? 'AIza' : '';
    const last4 = apiKey.slice(-4);

    return `${prefix}...${last4}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @param provider - 'openai' or 'gemini'
 * @returns true if valid format
 */
export function validateApiKeyFormat(apiKey: string, provider: 'openai' | 'gemini'): boolean {
    if (!apiKey) return false;

    if (provider === 'openai') {
        // OpenAI keys start with 'sk-' and are typically 51+ characters
        return apiKey.startsWith('sk-') && apiKey.length >= 20;
    } else if (provider === 'gemini') {
        // Gemini keys start with 'AIza' and are typically 39 characters
        return apiKey.startsWith('AIza') && apiKey.length >= 20;
    }

    return false;
}
