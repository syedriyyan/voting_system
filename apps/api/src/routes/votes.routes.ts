import express from "express";
import { body } from "express-validator";
import {
  castVote,
  verifyVote,
  getVoteReceipt,
  getVotingHistory,
} from "../controllers/vote.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";

const router = express.Router();

// Cast a vote (protected)
router.post(
  "/",
  authenticate,
  [
    body("electionId").notEmpty().withMessage("Election ID is required"),
    body("candidateId")
      .isNumeric()
      .withMessage("Candidate ID must be a number"),
    body("transactionHash")
      .notEmpty()
      .withMessage("Transaction hash is required"),
    body("signature").notEmpty().withMessage("Signature is required"),
    validate,
  ],
  castVote
);

// Verify a vote by hash (public)
router.get("/verify/:voteHash", verifyVote);

// Get vote receipt (protected)
router.get("/receipt/:voteId", authenticate, getVoteReceipt);

// Get voting history (protected)
router.get("/history", authenticate, getVotingHistory);

export default router;
