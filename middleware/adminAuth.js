// middleware/adminAuth.js
import { verifyToken } from "../utils/jwts.js";
import Admin from "../models/admin.js";

/**
 * Middleware to authenticate admin users
 * Enforces role === "admin" and active status
 */
export async function requireAdminAuth(req, res, next) {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Admin access required.",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    req.admin = admin;
    req.userType = "admin";

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
}
