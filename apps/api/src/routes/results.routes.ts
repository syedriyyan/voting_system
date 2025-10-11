import express from "express";
import { param, query, body } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import { roleGuard } from "../middleware/roleGuard.middleware";
import { validate } from "../middleware/validator.middleware";
import { rateLimit } from "../middleware/rateLimit.middleware";
import { UserRole } from "../models/User.model";
import {
  generateResults,
  getResultsByElection,
  getAllResults,
  finalizeResults,
} from "../controllers/result.controller";

const router = express.Router();

// Apply rate limiting to all result routes
router.use(rateLimit(30, 60000)); // 30 requests per minute

// Get all published results (public)
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    validate,
  ],
  getAllResults
);

// Get results for a specific election (public)
router.get(
  "/:electionId",
  [
    param("electionId").isMongoId().withMessage("Invalid election ID format"),
    validate,
  ],
  getResultsByElection
);

// Generate results for an election (protected - admin/election commissioner)
router.post(
  "/generate/:electionId",
  authenticate,
  roleGuard([UserRole.ADMIN, UserRole.ELECTION_COMMISSIONER]),
  [
    param("electionId").isMongoId().withMessage("Invalid election ID format"),
    validate,
  ],
  generateResults
);

// Finalize results (protected - admin only)
router.patch(
  "/:electionId/finalize",
  authenticate,
  roleGuard([UserRole.ADMIN]),
  [
    param("electionId").isMongoId().withMessage("Invalid election ID format"),
    body("blockNumber")
      .isInt({ min: 0 })
      .withMessage("Block number must be a non-negative integer"),
    body("transactionHash")
      .isString()
      .withMessage("Transaction hash is required"),
    validate,
  ],
  finalizeResults
);

export default router;
