// controllers/adminController.js
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import Student from "../models/student.js";
import Driver from "../models/driver.js";
import Ride from "../models/ride.js";
import Wallet from "../models/wallet.js";
import { signToken } from "../utils/jwts.js";

/**
 * POST /api/admin/auth/login
 * Admin login with email and password
 */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT with admin role
    const token = signToken({
      id: admin._id,
      email: admin.email,
      role: "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Return token for localStorage fallback
      data: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

/**
 * GET /api/admin/auth/me
 * Get current admin info (protected)
 */
export async function getAdminMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.admin._id,
        fullName: req.admin.fullName,
        email: req.admin.email,
        role: req.admin.role,
        isActive: req.admin.isActive,
        lastLogin: req.admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get admin me error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin info",
    });
  }
}

/**
 * POST /api/admin/auth/logout
 * Admin logout
 */
export async function adminLogout(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
export async function getDashboardStats(req, res) {
  try {
    const [totalStudents, totalDrivers, totalRides, activeRides] =
      await Promise.all([
        Student.countDocuments(),
        Driver.countDocuments(),
        Ride.countDocuments(),
        Ride.countDocuments({
          status: { $in: ["pending", "accepted", "ongoing"] },
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalDrivers,
        totalRides,
        activeRides,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
}

/**
 * GET /api/admin/students
 * Get paginated list of students
 */
export async function getStudents(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find()
        .select(
          "-password -emailOTP -otpExpires -resetPasswordToken -resetPasswordExpire",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(),
    ]);

    // Fetch wallet balances for each student
    const studentIds = students.map((s) => s._id);
    const wallets = await Wallet.find({
      user: { $in: studentIds },
      userType: "Student",
    }).lean();

    const walletMap = new Map(
      wallets.map((w) => [w.user.toString(), w.balance]),
    );

    const studentsWithBalance = students.map((student) => ({
      ...student,
      walletBalance: walletMap.get(student._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        students: studentsWithBalance,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
}

/**
 * PATCH /api/admin/students/:id/status
 * Suspend or unsuspend a student
 */
export async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean value",
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true, select: "-password" },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student ${isVerified ? "activated" : "suspended"} successfully`,
      data: student,
    });
  } catch (error) {
    console.error("Update student status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update student status",
    });
  }
}

/**
 * GET /api/admin/drivers
 * Get paginated list of drivers
 */
export async function getDrivers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      Driver.find()
        .select(
          "-password -emailOTP -otpExpires -resetPasswordToken -resetPasswordExpire",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Driver.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        drivers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get drivers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
    });
  }
}

/**
 * PATCH /api/admin/drivers/:id/status
 * Suspend or unsuspend a driver
 */
export async function updateDriverStatus(req, res) {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean value",
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true, select: "-password" },
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Driver ${isVerified ? "activated" : "suspended"} successfully`,
      data: driver,
    });
  } catch (error) {
    console.error("Update driver status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update driver status",
    });
  }
}

/**
 * GET /api/admin/rides
 * Get paginated list of rides
 */
export async function getRides(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find()
        .populate("student", "fullName phoneNo email")
        .populate("driver", "fullName phoneNo vehicleInfo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ride.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        rides,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rides",
    });
  }
}
