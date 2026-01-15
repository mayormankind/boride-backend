// middleware/adminAuth.js
import { verifyToken } from "../utils/jwts.js";
import Admin from "../models/admin.js";
import { cookieOptions } from "../utils/cookieOptions.js";

/**
 * Middleware to authenticate admin users
 * Enforces role === "admin" and active status
 */
export async function requireAdminAuth(req, res, next) {
  try {
    // 1. Read token from cookie (primary)
    let token = req.cookies?.admin_token;

    // 2. Read token from header (fallback)
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.clearCookie("admin_token", cookieOptions);
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Admin access required.",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.clearCookie("admin_token", cookieOptions);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      res.clearCookie("admin_token", cookieOptions);
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!admin.isActive) {
      res.clearCookie("admin_token", cookieOptions);
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
    res.clearCookie("admin_token", cookieOptions);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
}
