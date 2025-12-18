import { verifyToken } from "../utils/jwts.js";
import Student from "../models/student.js";
import Driver from "../models/driver.js";

/**
 * Middleware to authenticate and attach user to request
 * @param {string} userType - 'student' or 'driver'
 */
export function authenticate(userType) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Find user based on type
      let user;
      if (userType === "student") {
        user = await Student.findById(decoded.id).select("-password");
      } else if (userType === "driver") {
        user = await Driver.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `${userType} not found`,
        });
      }

      // Attach user to request
      req.user = user;
      req.userType = userType;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error.message,
      });
    }
  };
}
