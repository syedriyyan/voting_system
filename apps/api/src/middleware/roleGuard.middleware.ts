import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User.model";
import { logger } from "../utils/logger";

/**
 * Middleware to check if user has required permissions for the operation
 * Works in conjunction with authenticate middleware
 */
export const roleGuard = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // First check if user exists in request (authenticate middleware should have set it)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role as UserRole)) {
        logger.warn(
          `Access denied: User ${req.user.userId} with role ${req.user.role} attempted to access resource requiring ${allowedRoles.join(
            ", "
          )}`
        );
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for this operation",
        });
      }

      // User has permission, proceed
      next();
    } catch (error) {
      logger.error("Role guard error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};
