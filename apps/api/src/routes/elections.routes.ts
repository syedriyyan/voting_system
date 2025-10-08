import express from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/User.model";
import { ElectionController } from "../controllers/election.controller";

const router = express.Router();

// Get all elections
router.get("/", ElectionController.getAll);

// Get election by ID
router.get("/:id", ElectionController.getById);

// Create new election (admin only)
router.post(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN),
  ElectionController.create
);

// Update election status (admin only)
router.patch(
  "/:id/status",
  authenticate,
  requireRole(UserRole.ADMIN),
  ElectionController.updateStatus
);

export default router;
