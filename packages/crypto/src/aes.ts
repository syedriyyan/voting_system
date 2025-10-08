import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class AES {
  static encrypt(data: string, key: Buffer): { encryptedData: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  static decrypt(encryptedData: string, key: Buffer, iv: string): string {
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex');
    const encryptedText = encryptedData.slice(0, -32);
    
    const decipher = createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateKey(): Buffer {
    return randomBytes(32);
  }
}