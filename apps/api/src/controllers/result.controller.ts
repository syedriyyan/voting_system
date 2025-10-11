import { Request, Response } from "express";
import mongoose from "mongoose";
import Result from "../models/Result.model";
import Election, { ElectionStatus } from "../models/Election.model";
import Vote from "../models/Vote.model";
import { logger } from "../utils/logger";

/**
 * Generate election results
 * @route POST /api/results/generate/:electionId
 * @access Private (Admin, Election Commissioner)
 */
export const generateResults = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;

    // Validate electionId
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid election ID format",
      });
    }

    // Check if election exists and has ended
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Only generate results for ended elections
    if (election.status !== ElectionStatus.ENDED) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate results for an election that has not ended",
      });
    }

    // Check if results already exist
    const existingResults = await Result.findOne({ electionId });
    if (existingResults) {
      return res.status(400).json({
        success: false,
        message: "Results already generated for this election",
      });
    }

    // Count votes for each candidate
    const votes = await Vote.find({ electionId, verified: true });
    const candidateVotes = new Map<number, number>();

    // Initialize votes for each candidate
    for (const candidate of election.candidates) {
      candidateVotes.set(candidate.id, 0);
    }

    // Count votes
    for (const vote of votes) {
      const candidateId = vote.candidateId;
      const currentVotes = candidateVotes.get(candidateId) || 0;
      candidateVotes.set(candidateId, currentVotes + 1);
    }

    // Prepare results array with percentages
    const totalVotes = votes.length;
    const resultArray = [];
    let winningCandidate = null;
    let maxVotes = -1;

    for (const candidate of election.candidates) {
      const candidateVoteCount = candidateVotes.get(candidate.id) || 0;
      const percentage =
        totalVotes > 0 ? (candidateVoteCount / totalVotes) * 100 : 0;

      const candidateResult = {
        candidateId: candidate.id,
        candidateName: candidate.name,
        party: candidate.party,
        votes: candidateVoteCount,
        percentage: parseFloat(percentage.toFixed(2)),
      };

      resultArray.push(candidateResult);

      // Track winner
      if (candidateVoteCount > maxVotes) {
        maxVotes = candidateVoteCount;
        winningCandidate = candidateResult;
      }
    }

    // Calculate metadata
    const totalRegisteredVoters = election.eligibleVoters.length;
    const turnoutPercentage =
      totalRegisteredVoters > 0
        ? (totalVotes / totalRegisteredVoters) * 100
        : 0;

    // Create result document
    const newResult = new Result({
      electionId: election._id,
      contractElectionId: election.contractElectionId,
      publishedAt: new Date(),
      results: resultArray,
      winner: winningCandidate,
      metadata: {
        totalVoters: totalRegisteredVoters,
        voterTurnout: totalVotes,
        turnoutPercentage: parseFloat(turnoutPercentage.toFixed(2)),
        invalidVotes: 0, // Would need to track invalid votes separately
        electionType: election.metadata.electionType || "General",
        verificationMethod: "Blockchain",
        blockchainInfo: {
          networkId: 1, // This would need to come from config
          contractAddress: election.contractAddress,
          finalizedBlockNumber: 0, // Would come from blockchain
          finalizationTxHash: "", // Would come from transaction hash
        },
      },
      isFinalized: false,
    });

    await newResult.save();

    // Update election status
    election.status = ElectionStatus.RESULTS_PUBLISHED;
    election.results = resultArray;
    await election.save();

    logger.info(`Results generated for election ${electionId}`);

    return res.status(201).json({
      success: true,
      message: "Election results generated successfully",
      data: newResult,
    });
  } catch (error: any) {
    logger.error("Error generating results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get results for a specific election
 * @route GET /api/results/:electionId
 * @access Public
 */
export const getResultsByElection = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;

    // Validate electionId
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid election ID format",
      });
    }

    // Check if results exist
    const results = await Result.findOne({ electionId }).select("-__v");

    if (!results) {
      return res.status(404).json({
        success: false,
        message: "No results found for this election",
      });
    }

    // Get election details
    const election = await Election.findById(electionId).select(
      "title description startTime endTime status metadata"
    );

    return res.status(200).json({
      success: true,
      data: {
        results,
        election,
      },
    });
  } catch (error: any) {
    logger.error("Error getting results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all published results
 * @route GET /api/results
 * @access Public
 */
export const getAllResults = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const results = await Result.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("electionId", "title description startTime endTime status");

    const total = await Result.countDocuments();

    return res.status(200).json({
      success: true,
      count: results.length,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
      data: results,
    });
  } catch (error: any) {
    logger.error("Error getting all results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Finalize results (mark as finalized and update blockchain info)
 * @route PATCH /api/results/:electionId/finalize
 * @access Private (Admin)
 */
export const finalizeResults = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;
    const { blockNumber, transactionHash } = req.body;

    // Validate electionId
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid election ID format",
      });
    }

    // Check required blockchain data
    if (!blockNumber || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Block number and transaction hash are required",
      });
    }

    // Find results
    const results = await Result.findOne({ electionId });

    if (!results) {
      return res.status(404).json({
        success: false,
        message: "No results found for this election",
      });
    }

    // Update blockchain info
    if (!results.metadata.blockchainInfo) {
      results.metadata.blockchainInfo = {
        networkId: 1, // Default
        contractAddress: "",
        finalizedBlockNumber: 0,
        finalizationTxHash: "",
      };
    }

    results.metadata.blockchainInfo.finalizedBlockNumber = blockNumber;
    results.metadata.blockchainInfo.finalizationTxHash = transactionHash;
    results.isFinalized = true;

    await results.save();

    logger.info(`Results finalized for election ${electionId}`);

    return res.status(200).json({
      success: true,
      message: "Election results finalized",
      data: results,
    });
  } catch (error: any) {
    logger.error("Error finalizing results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to finalize results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
