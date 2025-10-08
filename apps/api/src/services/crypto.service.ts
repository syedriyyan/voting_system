import crypto from "crypto";
import fs from "fs";
import path from "path";

class CryptoService {
  private rsaPublicKey: string = "";
  private rsaPrivateKey: string = "";
  private aesKey: Buffer;

  constructor() {
    // Load RSA keys
    const publicKeyPath =
      process.env.RSA_PUBLIC_KEY_PATH ||
      path.join(__dirname, "../../keys/public.pem");
    const privateKeyPath =
      process.env.RSA_PRIVATE_KEY_PATH ||
      path.join(__dirname, "../../keys/private.pem");

    try {
      this.rsaPublicKey = fs.readFileSync(publicKeyPath, "utf8");
      this.rsaPrivateKey = fs.readFileSync(privateKeyPath, "utf8");
    } catch (error) {
      console.warn("RSA keys not found, generating new keys...");
      this.generateRSAKeys();
    }

    // Load or generate AES key
    const aesKeyHex = process.env.AES_SECRET_KEY;
    if (aesKeyHex && aesKeyHex.length === 64) {
      this.aesKey = Buffer.from(aesKeyHex, "hex");
    } else {
      this.aesKey = crypto.randomBytes(32); // 256-bit key
      console.warn(`Generated new AES key: ${this.aesKey.toString("hex")}`);
    }
  }

  // ==================== RSA ENCRYPTION ====================

  /**
   * Generate RSA key pair (2048-bit)
   */
  private generateRSAKeys(): void {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    this.rsaPublicKey = publicKey;
    this.rsaPrivateKey = privateKey;

    // Save keys to files
    const keysDir = path.join(__dirname, "../../keys");
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    fs.writeFileSync(path.join(keysDir, "public.pem"), publicKey);
    fs.writeFileSync(path.join(keysDir, "private.pem"), privateKey);
  }

  /**
   * Encrypt data using RSA public key
   */
  public rsaEncrypt(data: string): string {
    const buffer = Buffer.from(data, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: this.rsaPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return encrypted.toString("base64");
  }

  /**
   * Decrypt data using RSA private key
   */
  public rsaDecrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: this.rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return decrypted.toString("utf8");
  }

  /**
   * Get RSA public key
   */
  public getPublicKey(): string {
    return this.rsaPublicKey;
  }

  // ==================== AES ENCRYPTION ====================

  /**
   * Encrypt data using AES-256-GCM
   */
  public aesEncrypt(data: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.aesKey, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  public aesDecrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.aesKey,
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  // ==================== HASHING ====================

  /**
   * Generate SHA-256 hash
   */
  public sha256(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Generate SHA-512 hash
   */
  public sha512(data: string): string {
    return crypto.createHash("sha512").update(data).digest("hex");
  }

  /**
   * Hash national ID with salt
   */
  public hashNationalId(nationalId: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(nationalId, salt, 100000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  /**
   * Verify national ID hash
   */
  public verifyNationalIdHash(nationalId: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");
    const verifyHash = crypto
      .pbkdf2Sync(nationalId, salt, 100000, 64, "sha512")
      .toString("hex");
    return hash === verifyHash;
  }

  // ==================== VOTE ENCRYPTION ====================

  /**
   * Encrypt vote data (combines AES + RSA for hybrid encryption)
   * AES for data, RSA for AES key
   */
  public encryptVote(voteData: any): {
    encryptedVote: string;
    encryptedKey: string;
    iv: string;
    tag: string;
  } {
    // Generate random AES key for this vote
    const voteAesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Encrypt vote data with AES
    const cipher = crypto.createCipheriv("aes-256-gcm", voteAesKey, iv);
    const voteString = JSON.stringify(voteData);
    let encrypted = cipher.update(voteString, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    // Encrypt AES key with RSA
    const encryptedKey = crypto
      .publicEncrypt(
        {
          key: this.rsaPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        voteAesKey
      )
      .toString("base64");

    return {
      encryptedVote: encrypted,
      encryptedKey,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Decrypt vote data
   */
  public decryptVote(
    encryptedVote: string,
    encryptedKey: string,
    iv: string,
    tag: string
  ): any {
    // Decrypt AES key with RSA
    const voteAesKey = crypto.privateDecrypt(
      {
        key: this.rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedKey, "base64")
    );

    // Decrypt vote data with AES
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      voteAesKey,
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(encryptedVote, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }

  // ==================== DIGITAL SIGNATURE ====================

  /**
   * Sign data using RSA private key
   */
  public signData(data: string): string {
    const sign = crypto.createSign("SHA256");
    sign.update(data);
    sign.end();
    return sign.sign(this.rsaPrivateKey, "base64");
  }

  /**
   * Verify signature using RSA public key
   */
  public verifySignature(
    data: string,
    signature: string,
    publicKey?: string
  ): boolean {
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKey || this.rsaPublicKey, signature, "base64");
  }

  // ==================== UTILITY ====================

  /**
   * Generate random token
   */
  public generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Generate vote hash
   */
  public generateVoteHash(
    electionId: number,
    voterAddress: string,
    candidateId: number,
    timestamp: number
  ): string {
    const data = `${electionId}-${voterAddress}-${candidateId}-${timestamp}`;
    return this.sha256(data);
  }
}

export default new CryptoService();
