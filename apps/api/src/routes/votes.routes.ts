import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { VoteController } from "../controllers/vote.controller";

const router = express.Router();

// Cast a vote (authenticated users only)
router.post("/", authenticate, VoteController.cast);

// Get user's vote receipt
router.get("/:electionId/receipt", authenticate, VoteController.getVoteReceipt);

export default router;
