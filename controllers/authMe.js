// controllers/authMe.js
import jwt from "jsonwebtoken";
import Student from "../models/student.js";
import Driver from "../models/driver.js";
import { cookieOptions } from "../utils/cookieOptions.js";

export async function authMe(req, res) {
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
        authenticated: false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      res.clearCookie("access_token", cookieOptions);
      return res.status(401).json({
        authenticated: false,
      });
    }

    let user = null;

    if (decoded.role === "student") {
      user = await Student.findById(decoded.id).select(
        "_id fullName email matricNo"
      );
    } else if (decoded.role === "driver") {
      user = await Driver.findById(decoded.id).select(
        "_id fullName email phoneNo"
      );
    }

    if (!user) {
      res.clearCookie("access_token", cookieOptions);
      return res.status(401).json({
        authenticated: false,
      });
    }

    return res.status(200).json({
      authenticated: true,
      role: decoded.role,
      user,
    });
  } catch (err) {
    res.clearCookie("access_token", cookieOptions);
    return res.status(500).json({
      authenticated: false,
    });
  }
}
