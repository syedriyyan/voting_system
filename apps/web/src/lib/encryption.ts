/**
 * Client-side encryption utilities for vote encryption
 */

/**
 * Generate a cryptographically secure random nonce
 */
export const generateNonce = (): string => {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for non-browser environments
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Encrypt a vote using the candidate ID and public key
 * In production, integrate your real cryptographic routine from packages/crypto.
 */
export async function encryptVote(
  candidateId: string | number,
  publicKey?: string
): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    // Hash candidateId + optional public key
    const data = enc.encode(`${candidateId}::${publicKey || "pub"}`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(buf);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      out += bytes[i].toString(16).padStart(2, "0");
    }
    return out; // hex string
  } else {
    // Fallback for environments without crypto.subtle
    return `encrypted_${candidateId}_${Date.now()}`;
  }
}

/**
 * Create a hash of the encrypted vote for verification
 * @param encryptedVote The encrypted vote data
 * @returns Hash of the vote
 */
export const hashVote = async (encryptedVote: string): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(encryptedVote);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(buf);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      out += bytes[i].toString(16).padStart(2, "0");
    }
    return `0x${out}`;
  } else {
    // Fallback when crypto API is not available
    return `0x${encryptedVote
      .split("")
      .map((c) => c.charCodeAt(0).toString(16))
      .join("")}`;
  }
};

/**
 * Prepare a vote for submission to the API and blockchain
 * @param candidateId ID of the candidate being voted for
 * @param electionId ID of the election
 * @param contractElectionId Numeric ID of the election on blockchain
 * @param voterAddress Wallet address of the voter
 * @param publicKey Public key for encryption (optional)
 */
export async function prepareVote(
  candidateId: number,
  electionId: string,
  contractElectionId: number,
  voterAddress: string,
  publicKey?: string
) {
  // Encrypt the vote
  const encryptedVote = await encryptVote(candidateId, publicKey);

  // Create a hash of the encrypted vote
  const voteHash = await hashVote(encryptedVote);

  // In a real app, this would use the user's wallet to sign the vote
  // For now, we'll create a mock signature
  const signature = `0x${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`;

  return {
    electionId,
    contractElectionId,
    candidateId,
    encryptedVote,
    voteHash,
    signature,
    voterAddress,
  };
}
