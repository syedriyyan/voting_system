import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { getContractABI } from "../utils/contracts";

type VotingContract = Contract & {
  castVote(
    electionId: string,
    encryptedVote: string,
    overrides?: any
  ): Promise<any>;
  hasVoted(electionId: string, voter: string): Promise<boolean>;
};

export class BlockchainService {
  private static provider: JsonRpcProvider;
  private static votingContract: VotingContract;

  static async initialize(): Promise<void> {
    const rpcUrl = process.env.NETWORK_RPC_URL || "http://localhost:8545";
    this.provider = new JsonRpcProvider(rpcUrl);

    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Voting contract address not configured");
    }

    const abi = await getContractABI();
    this.votingContract = new Contract(
      contractAddress,
      abi,
      this.provider
    ) as VotingContract;
  }

  static async submitVote(
    electionId: string,
    encryptedVote: string
  ): Promise<string> {
    try {
      const signer = new Wallet(process.env.PRIVATE_KEY || "", this.provider);
      const contract = this.votingContract.connect(signer) as VotingContract;

      const tx = await contract.castVote(electionId, encryptedVote);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error("Error submitting vote to blockchain:", error);
      throw error;
    }
  }

  static async verifyVote(electionId: string, voter: string): Promise<boolean> {
    try {
      return await this.votingContract.hasVoted(electionId, voter);
    } catch (error) {
      console.error("Error verifying vote:", error);
      throw error;
    }
  }
}
