import { Request, Response } from "express";
import Election, { ElectionStatus } from "../models/Election.model";
import { UserRole } from "../models/User.model";
import { logger } from "../utils/logger";

/**
 * Create a new election
 */
export const createElection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    // Only admins and commissioners can create elections
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ELECTION_COMMISSIONER
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to create elections",
      });
    }

    const {
      contractElectionId,
      title,
      description,
      startTime,
      endTime,
      candidates,
      metadata,
    } = req.body;

    // Validate
    if (
      !title ||
      !description ||
      !startTime ||
      !endTime ||
      !candidates ||
      candidates.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid election data",
      });
    }

    // Create election
    const election = new Election({
      contractElectionId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: ElectionStatus.SCHEDULED,
      creator: userId,
      candidates: candidates.map((c: any, index: number) => ({
        id: index,
        name: c.name,
        party: c.party,
        symbol: c.symbol,
        description: c.description,
      })),
      metadata: metadata || {},
      totalVotes: 0,
    });

    await election.save();

    logger.info(`Election created: ${election.title} by ${userId}`);

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: { election },
    });
  } catch (error: any) {
    logger.error("Create election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create election",
      error: error.message,
    });
  }
};

/**
 * Get all elections
 */
export const getAllElections = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [elections, total] = await Promise.all([
      Election.find(query)
        .populate("creator", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Election.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        elections,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error("Get elections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch elections",
      error: error.message,
    });
  }
};

/**
 * Get election by ID
 */
export const getElectionById = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate(
      "creator",
      "name email"
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { election },
    });
  } catch (error: any) {
    logger.error("Get election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch election",
      error: error.message,
    });
  }
};

/**
 * Update election
 */
export const updateElection = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Only creator or admin can update
    if (election.creator.toString() !== userId && userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this election",
      });
    }

    // Can't update if election has started
    if (
      election.status !== ElectionStatus.DRAFT &&
      election.status !== ElectionStatus.SCHEDULED
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot update election after it has started",
      });
    }

    const { title, description, startTime, endTime } = req.body;

    if (title) election.title = title;
    if (description) election.description = description;
    if (startTime) election.startTime = new Date(startTime);
    if (endTime) election.endTime = new Date(endTime);

    await election.save();

    logger.info(`Election updated: ${electionId}`);

    res.status(200).json({
      success: true,
      message: "Election updated successfully",
      data: { election },
    });
  } catch (error: any) {
    logger.error("Update election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update election",
      error: error.message,
    });
  }
};

/**
 * Delete election
 */
export const deleteElection = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Only creator or admin can delete
    if (election.creator.toString() !== userId && userRole !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this election",
      });
    }

    // Can't delete if election has started
    if (
      election.status === ElectionStatus.ACTIVE ||
      election.status === ElectionStatus.ENDED
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete election after it has started",
      });
    }

    await Election.findByIdAndDelete(electionId);

    logger.info(`Election deleted: ${electionId}`);

    res.status(200).json({
      success: true,
      message: "Election deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete election",
      error: error.message,
    });
  }
};

/**
 * Get election results
 */
export const getElectionResults = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Can only see results after election ends
    if (
      election.status !== ElectionStatus.ENDED &&
      election.status !== ElectionStatus.RESULTS_PUBLISHED
    ) {
      return res.status(400).json({
        success: false,
        message: "Results not available yet",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        election: {
          id: election._id,
          title: election.title,
          status: election.status,
          totalVotes: election.totalVotes,
        },
        results: election.results || [],
      },
    });
  } catch (error: any) {
    logger.error("Get results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};
