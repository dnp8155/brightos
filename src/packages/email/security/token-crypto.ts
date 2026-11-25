import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte key from the environment encryption secret.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || "brightloop-default-super-secret-key-32b";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive OAuth refresh tokens before storing at rest in Supabase.
 */
export function encryptToken(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts encrypted OAuth token inside secure server-side context.
 */
export function decryptToken(encryptedPayload: string): string {
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token payload format.");
  }

  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
