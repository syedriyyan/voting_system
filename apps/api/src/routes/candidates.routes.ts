import express from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";
import { roleGuard } from "../middleware/roleGuard.middleware";
import { validate } from "../middleware/validator.middleware";
import {
  uploadCandidateImage,
  handleUploadError,
} from "../middleware/upload.middleware";
import { rateLimit } from "../middleware/rateLimit.middleware";
import { UserRole } from "../models/User.model";
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  toggleCandidateStatus,
} from "../controllers/candidate.controller";

const router = express.Router();

// Apply rate limiting to all candidate routes
router.use(rateLimit(60, 60000)); // 60 requests per minute

// Get all candidates (public with filters)
router.get(
  "/",
  [
    query("electionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid election ID format"),
    query("party").optional().isString().trim().escape(),
    query("includeInactive").optional().isBoolean().toBoolean(),
    validate,
  ],
  getCandidates
);

// Get single candidate by ID (public)
router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid candidate ID format"),
    validate,
  ],
  getCandidateById
);

// Create new candidate (protected - admin/election commissioner)
router.post(
  "/",
  authenticate,
  roleGuard([UserRole.ADMIN, UserRole.ELECTION_COMMISSIONER]),
  uploadCandidateImage,
  handleUploadError,
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    body("party")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Party must be 2-100 characters"),
    body("bio")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Bio must be 10-1000 characters"),
    body("electionId").isMongoId().withMessage("Invalid election ID format"),
    body("contactEmail")
      .optional()
      .isEmail()
      .withMessage("Invalid email format"),
    body("contactPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    validate,
  ],
  createCandidate
);

// Update a candidate (protected - admin/election commissioner)
router.put(
  "/:id",
  authenticate,
  roleGuard([UserRole.ADMIN, UserRole.ELECTION_COMMISSIONER]),
  uploadCandidateImage,
  handleUploadError,
  [
    param("id").isMongoId().withMessage("Invalid candidate ID format"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    body("party")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Party must be 2-100 characters"),
    body("bio")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Bio must be 10-1000 characters"),
    body("contactEmail")
      .optional()
      .isEmail()
      .withMessage("Invalid email format"),
    body("contactPhone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    validate,
  ],
  updateCandidate
);

// Delete a candidate (protected - admin only)
router.delete(
  "/:id",
  authenticate,
  roleGuard([UserRole.ADMIN]),
  [
    param("id").isMongoId().withMessage("Invalid candidate ID format"),
    validate,
  ],
  deleteCandidate
);

// Toggle candidate active status (protected - admin/election commissioner)
router.patch(
  "/:id/status",
  authenticate,
  roleGuard([UserRole.ADMIN, UserRole.ELECTION_COMMISSIONER]),
  [
    param("id").isMongoId().withMessage("Invalid candidate ID format"),
    body("isActive").isBoolean().withMessage("isActive must be boolean"),
    validate,
  ],
  toggleCandidateStatus
);

export default router;
