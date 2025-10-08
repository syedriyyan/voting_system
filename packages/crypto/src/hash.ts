import { createHash, randomBytes } from 'crypto';

export class Hash {
  static sha256(data: string | Buffer): string {
    return createHash('sha256')
      .update(data)
      .digest('hex');
  }

  static keccak256(data: string | Buffer): string {
    return createHash('keccak256')
      .update(data)
      .digest('hex');
  }

  static generateSalt(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static hashWithSalt(data: string, salt: string): string {
    return this.sha256(data + salt);
  }

  static verifyHash(data: string, salt: string, hash: string): boolean {
    return this.hashWithSalt(data, salt) === hash;
  }
}