import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  verifyUser,
  getNonce,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";

const router = express.Router();

// Get nonce for wallet signature
router.get("/nonce/:walletAddress", getNonce);

// Register new user
router.post(
  "/register",
  [
    body("walletAddress")
      .isEthereumAddress()
      .withMessage("Invalid wallet address"),
    body("email").isEmail().withMessage("Invalid email"),
    body("name")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    body("nationalId").notEmpty().withMessage("National ID is required"),
    body("signature").notEmpty().withMessage("Signature is required"),
    validate,
  ],
  register
);

// Login with wallet
router.post(
  "/login",
  [
    body("walletAddress")
      .isEthereumAddress()
      .withMessage("Invalid wallet address"),
    body("signature").notEmpty().withMessage("Signature is required"),
    body("message").notEmpty().withMessage("Message is required"),
    validate,
  ],
  login
);

// Get current user profile (protected)
router.get("/profile", authenticate, getProfile);

// Verify user (admin only)
router.patch("/verify/:userId", authenticate, verifyUser);

export default router;
