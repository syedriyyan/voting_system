import { Request, Response } from "express";
import mongoose from "mongoose";
import Candidate, { ICandidate } from "../models/Candidate.model";
import Election from "../models/Election.model";
import { logger } from "../utils/logger";

/**
 * Create a new candidate
 * @route POST /api/candidates
 * @access Private (Election Commissioners & Admins)
 */
export const createCandidate = async (req: Request, res: Response) => {
  try {
    const { name, party, bio, electionId } = req.body;

    // Validate electionId format
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid election ID format",
      });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Handle file upload (if middleware provided an uploaded file)
    let imageUrl = undefined;
    if (req.file) {
      // For development, we're just storing the path
      // In production, this would be a URL to a cloud storage provider
      imageUrl = `/uploads/candidates/${req.file.filename}`;
    }

    // Create candidate
    const candidate = new Candidate({
      name,
      party,
      bio,
      electionId,
      imageUrl,
      ...req.body, // Add any other fields from the request
    });

    await candidate.save();

    logger.info(
      `Candidate ${candidate._id} created for election ${electionId}`
    );

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: candidate,
    });
  } catch (error: any) {
    logger.error("Error creating candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all candidates
 * @route GET /api/candidates
 * @access Public
 */
export const getCandidates = async (req: Request, res: Response) => {
  try {
    const { electionId, party } = req.query;

    // Build query based on filters
    const query: any = {};

    if (electionId) {
      if (!mongoose.Types.ObjectId.isValid(electionId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid election ID format",
        });
      }
      query.electionId = electionId;
    }

    if (party) {
      query.party = party;
    }

    // Only return active candidates by default
    if (!req.query.includeInactive) {
      query.isActive = true;
    }

    const candidates = await Candidate.find(query)
      .sort({ party: 1, name: 1 })
      .select("-__v")
      .populate("electionId", "title startTime endTime");

    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error: any) {
    logger.error("Error getting candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get candidates",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get a single candidate by ID
 * @route GET /api/candidates/:id
 * @access Public
 */
export const getCandidateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    const candidate = await Candidate.findById(id)
      .select("-__v")
      .populate("electionId", "title startTime endTime status");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error: any) {
    logger.error("Error getting candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update a candidate
 * @route PUT /api/candidates/:id
 * @access Private (Election Commissioners & Admins)
 */
export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: Partial<ICandidate> = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    // Handle file upload if there's a new image
    if (req.file) {
      updateData.imageUrl = `/uploads/candidates/${req.file.filename}`;
    }

    // Don't allow changing the election ID once set
    if (updateData.electionId) {
      delete updateData.electionId;
    }

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    logger.info(`Candidate ${id} updated successfully`);

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      data: candidate,
    });
  } catch (error: any) {
    logger.error("Error updating candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a candidate
 * @route DELETE /api/candidates/:id
 * @access Private (Admins only)
 */
export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Get election to check status
    const election = await Election.findById(candidate.electionId);

    // Don't allow deleting candidates from active or completed elections
    if (
      election &&
      ["active", "ended", "results_published"].includes(election.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete candidate from an active or completed election",
      });
    }

    await Candidate.findByIdAndDelete(id);

    logger.info(`Candidate ${id} deleted successfully`);

    return res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Toggle candidate active status
 * @route PATCH /api/candidates/:id/status
 * @access Private (Election Commissioners & Admins)
 */
export const toggleCandidateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive status is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Get election to check status
    const election = await Election.findById(candidate.electionId);

    // Don't allow changing status for active or completed elections
    if (
      election &&
      ["active", "ended", "results_published"].includes(election.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot change candidate status in an active or completed election",
      });
    }

    candidate.isActive = !!isActive;
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: `Candidate ${isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: candidate.isActive },
    });
  } catch (error: any) {
    logger.error("Error toggling candidate status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update candidate status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
