import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { verifyMessage } from "ethers";
import User, { UserRole, UserStatus } from "../models/User.model";
import cryptoService from "../services/crypto.service";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT token
 */
const generateToken = (
  userId: string,
  walletAddress: string,
  role: UserRole
): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign({ userId, walletAddress, role }, JWT_SECRET, options);
};

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const {
      walletAddress,
      email,
      name,
      nationalId,
      phoneNumber,
      dateOfBirth,
      signature,
    } = req.body;

    // Validate required fields
    if (!walletAddress || !email || !name || !nationalId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify wallet signature
    const message = `Register SecureVote Account\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ walletAddress: walletAddress.toLowerCase() }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this wallet or email",
      });
    }

    // Hash national ID
    const nationalIdHash = cryptoService.hashNationalId(nationalId);

    // Create new user
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      email,
      name,
      nationalIdHash,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role: UserRole.VOTER,
      status: UserStatus.PENDING,
      isVerified: false,
    });

    await user.save();

    // Generate token
    const token = generateToken(
      String(user._id),
      user.walletAddress,
      user.role
    );

    logger.info(`New user registered: ${user.walletAddress}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Awaiting admin verification.",
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Login with wallet signature
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify signature
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find user
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Check if user is suspended
    if (user.status === UserStatus.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact admin.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(
      String(user._id),
      user.walletAddress,
      user.role
    );

    logger.info(`User logged in: ${user.walletAddress}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

/**
 * Verify user (Admin only)
 */
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminRole = (req as any).user.role;

    if (
      adminRole !== UserRole.ADMIN &&
      adminRole !== UserRole.ELECTION_COMMISSIONER
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isVerified = true;
    user.status = UserStatus.VERIFIED;
    await user.save();

    logger.info(`User verified: ${user.walletAddress}`);

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: { user },
    });
  } catch (error: any) {
    logger.error("Verify user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify user",
      error: error.message,
    });
  }
};

/**
 * Get nonce for wallet signature
 */
export const getNonce = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const nonce = cryptoService.generateToken(16);
    const message = `Sign this message to authenticate with SecureVote\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

    res.status(200).json({
      success: true,
      data: {
        message,
        nonce,
      },
    });
  } catch (error: any) {
    logger.error("Get nonce error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate nonce",
      error: error.message,
    });
  }
};
