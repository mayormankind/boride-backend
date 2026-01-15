// middleware/auth.js
import { verifyToken } from "../utils/jwts.js";
import Student from "../models/student.js";
import Driver from "../models/driver.js";
import { cookieOptions } from "../utils/cookieOptions.js";

/**
 * Middleware to authenticate and attach user to request
 * @param {string} userType - 'student' | 'driver'
 */
export function authenticate(userType) {
  return async (req, res, next) => {
    try {
      // 1. Read token from cookie (primary)
      let token = req.cookies?.access_token;

      // 2. Read token from header (fallback)
      if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        res.clearCookie("access_token", cookieOptions);
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        res.clearCookie("access_token", cookieOptions);
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      let user;

      if (userType === "student") {
        user = await Student.findById(decoded.id).select("-password");
      } else if (userType === "driver") {
        user = await Driver.findById(decoded.id).select("-password");
      }

      if (!user) {
        res.clearCookie("access_token", cookieOptions);
        return res.status(401).json({
          success: false,
          message: `${userType} not found`,
        });
      }

      req.user = user;
      req.userType = userType;

      next();
    } catch (error) {
      res.clearCookie("access_token", cookieOptions);
      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  };
}
