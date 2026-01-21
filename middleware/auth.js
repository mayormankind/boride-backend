// middleware/auth.js
import { verifyToken } from "../utils/jwts.js";
import Student from "../models/student.js";
import Driver from "../models/driver.js";

/**
 * Middleware to authenticate and attach user to request
 * @param {string} userType - 'student' | 'driver'
 */
export function authenticate(userType) {
  return async (req, res, next) => {
    try {
      let token;

      if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
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
        return res.status(401).json({
          success: false,
          message: `${userType} not found`,
        });
      }

      req.user = user;
      req.userType = userType;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  };
}
