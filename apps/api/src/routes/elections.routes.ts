import express from "express";
import { body } from "express-validator";
import {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  getElectionResults,
} from "../controllers/election.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";

const router = express.Router();

// Get all elections (public)
router.get("/", getAllElections);

// Get election by ID (public)
router.get("/:electionId", getElectionById);

// Create election (protected - admin/commissioner only)
router.post(
  "/",
  authenticate,
  [
    body("title")
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be 5-200 characters"),
    body("description")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("startTime").isISO8601().withMessage("Invalid start time"),
    body("endTime").isISO8601().withMessage("Invalid end time"),
    body("candidates")
      .isArray({ min: 2 })
      .withMessage("At least 2 candidates required"),
    validate,
  ],
  createElection
);

// Update election (protected)
router.patch("/:electionId", authenticate, updateElection);

// Delete election (protected)
router.delete("/:electionId", authenticate, deleteElection);

// Get election results (public after election ends)
router.get("/:electionId/results", getElectionResults);

export default router;
