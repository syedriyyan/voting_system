import express from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/User.model";
import User from "../models/User.model";

const router = express.Router();

// Get all users (admin only)
router.get(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.ELECTION_COMMISSIONER),
  async (req, res) => {
    try {
      const { status, role, page = 1, limit = 20 } = req.query;

      const query: any = {};
      if (status) query.status = status;
      if (role) query.role = role;

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-__v")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        User.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }
);

// Get user by ID
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

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
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// Update user role (admin only)
router.patch(
  "/:userId/role",
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User role updated",
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update user role",
        error: error.message,
      });
    }
  }
);

// Suspend user (admin only)
router.patch(
  "/:userId/suspend",
  authenticate,
  requireRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { status: "suspended" },
        { new: true }
      ).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User suspended",
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to suspend user",
        error: error.message,
      });
    }
  }
);

export default router;
