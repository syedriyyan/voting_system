import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware to prevent abuse
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @param message Custom message to return when rate limit is exceeded
 */
export const rateLimit = (
  maxRequests: number = 60,
  windowMs: number = 60000, // 1 minute default
  message: string = "Too many requests, please try again later"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get client IP or use a fallback if behind proxy
      const ip =
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "unknown";

      // Create a key that includes the route to have different limits for different endpoints
      const key = `${ip}:${req.originalUrl}`;
      const now = Date.now();

      // Initialize if this is the first request from this IP
      if (!rateLimitStore[key]) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return next();
      }

      // Check if the time window has expired and reset if needed
      if (rateLimitStore[key].resetTime < now) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return next();
      }

      // Increment counter and check against limit
      rateLimitStore[key].count++;

      // Set headers for client to understand rate limiting
      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, maxRequests - rateLimitStore[key].count).toString()
      );
      res.setHeader(
        "X-RateLimit-Reset",
        rateLimitStore[key].resetTime.toString()
      );

      // If limit exceeded, return 429 Too Many Requests
      if (rateLimitStore[key].count > maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`);
        return res.status(429).json({
          success: false,
          message: message,
          retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000),
        });
      }

      next();
    } catch (error) {
      logger.error("Rate limit error:", error);
      // If something goes wrong with rate limiting, still allow the request
      next();
    }
  };
};
