import { Request, Response } from "express";
import Vote from "../models/Vote.model";
import { BlockchainService } from "../services/blockchain.service";
import CryptoService from "../services/crypto.service";

export class VoteController {
  static async cast(req: Request, res: Response) {
    try {
      const { electionId, choice } = req.body;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if user has already voted
      const existingVote = await Vote.findOne({ electionId, voterId: userId });
      if (existingVote) {
        return res
          .status(400)
          .json({ message: "Already voted in this election" });
      }

      // Encrypt the vote
      const encryptedVote = await CryptoService.encryptVote(choice);

      // Submit vote to blockchain
      const txHash = await BlockchainService.submitVote(
        electionId,
        JSON.stringify(encryptedVote)
      );

      // Save vote record
      const vote = new Vote({
        electionId,
        voterId: userId,
        encryptedVote,
        transactionHash: txHash,
        timestamp: new Date(),
      });

      await vote.save();

      res.status(201).json({
        message: "Vote cast successfully",
        transactionHash: txHash,
      });
    } catch (error) {
      res.status(500).json({ message: "Error casting vote", error });
    }
  }

  static async getVoteReceipt(req: Request, res: Response) {
    try {
      const { electionId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const vote = await Vote.findOne({ electionId, voterId: userId });
      if (!vote) {
        return res.status(404).json({ message: "Vote not found" });
      }

      res.json({
        electionId: vote.electionId,
        timestamp: vote.timestamp,
        transactionHash: vote.transactionHash,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching vote receipt", error });
    }
  }
}
