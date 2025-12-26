// controllers/authMe.js
import jwt from "jsonwebtoken";
import Student from "../models/student.js";
import Driver from "../models/driver.js";

export async function authMe(req, res) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
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
    return res.status(500).json({
      authenticated: false,
    });
  }
}
