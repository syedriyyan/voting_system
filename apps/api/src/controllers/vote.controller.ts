import { Request, Response } from "express";
import Vote from "../models/Vote.model";
import Election, { ElectionStatus } from "../models/Election.model";
import User from "../models/User.model";
import cryptoService from "../services/crypto.service";
import { logger } from "../utils/logger";

/**
 * Cast a vote
 */
export const castVote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const walletAddress = (req as any).user.walletAddress;

    const {
      electionId,
      contractElectionId,
      candidateId,
      transactionHash,
      signature,
    } = req.body;

    // Validate required fields
    if (
      !electionId ||
      candidateId === undefined ||
      !transactionHash ||
      !signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user is verified
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "User not verified",
      });
    }

    // Get election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check election status
    const now = new Date();
    if (
      election.status !== ElectionStatus.ACTIVE ||
      now < election.startTime ||
      now > election.endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Election is not active",
      });
    }

    // Check if already voted
    const existingVote = await Vote.findOne({ electionId, voter: userId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    // Validate candidate
    if (candidateId >= election.candidates.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    // Encrypt vote data
    const voteData = {
      electionId: contractElectionId,
      candidateId,
      timestamp: Date.now(),
      voter: walletAddress,
    };

    const { encryptedVote, encryptedKey, iv, tag } =
      cryptoService.encryptVote(voteData);

    // Generate vote hash
    const voteHash = cryptoService.generateVoteHash(
      contractElectionId,
      walletAddress,
      candidateId,
      Date.now()
    );

    // Create vote record
    const vote = new Vote({
      electionId,
      contractElectionId,
      voter: userId,
      voterAddress: walletAddress.toLowerCase(),
      candidateId,
      encryptedVote: JSON.stringify({ encryptedVote, encryptedKey, iv, tag }),
      voteHash,
      transactionHash,
      signature,
      timestamp: new Date(),
      verified: true,
    });

    await vote.save();

    // Update election vote count
    election.totalVotes += 1;
    await election.save();

    logger.info(`Vote cast: Election ${electionId}, Voter ${userId}`);

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        voteHash,
        transactionHash,
        timestamp: vote.timestamp,
      },
    });
  } catch (error: any) {
    logger.error("Cast vote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cast vote",
      error: error.message,
    });
  }
};

/**
 * Verify a vote
 */
export const verifyVote = async (req: Request, res: Response) => {
  try {
    const { voteHash } = req.params;

    const vote = await Vote.findOne({ voteHash })
      .populate("electionId", "title")
      .select("-encryptedVote");

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        voteHash: vote.voteHash,
        transactionHash: vote.transactionHash,
        timestamp: vote.timestamp,
        verified: vote.verified,
        election: vote.electionId,
      },
    });
  } catch (error: any) {
    logger.error("Verify vote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify vote",
      error: error.message,
    });
  }
};

/**
 * Get vote receipt
 */
export const getVoteReceipt = async (req: Request, res: Response) => {
  try {
    const { voteId } = req.params;
    const userId = (req as any).user.userId;

    const vote = await Vote.findById(voteId).populate("electionId", "title");

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    // Only the voter can see their receipt
    if (vote.voter.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        voteHash: vote.voteHash,
        transactionHash: vote.transactionHash,
        timestamp: vote.timestamp,
        election: vote.electionId,
        verified: vote.verified,
      },
    });
  } catch (error: any) {
    logger.error("Get receipt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get receipt",
      error: error.message,
    });
  }
};

/**
 * Get voter's voting history
 */
export const getVotingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const votes = await Vote.find({ voter: userId })
      .populate("electionId", "title status")
      .sort({ timestamp: -1 })
      .select("-encryptedVote");

    res.status(200).json({
      success: true,
      data: { votes },
    });
  } catch (error: any) {
    logger.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voting history",
      error: error.message,
    });
  }
};
