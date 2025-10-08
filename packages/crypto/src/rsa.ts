import NodeRSA from 'node-rsa';

export class RSAKeyPair {
  private key: NodeRSA;

  constructor(keySize: number = 2048) {
    this.key = new NodeRSA({ b: keySize });
  }

  getPublicKey(): string {
    return this.key.exportKey('public');
  }

  getPrivateKey(): string {
    return this.key.exportKey('private');
  }

  encrypt(data: string, publicKey: string): string {
    const key = new NodeRSA();
    key.importKey(publicKey, 'public');
    return key.encrypt(data, 'base64');
  }

  decrypt(encryptedData: string): string {
    return this.key.decrypt(encryptedData, 'utf8');
  }
}