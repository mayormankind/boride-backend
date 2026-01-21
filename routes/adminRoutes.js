//routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAdminMe,
  adminLogout,
  getDashboardStats,
  getStudents,
  updateStudentStatus,
  getDrivers,
  updateDriverStatus,
  getRides,
} from "../controllers/adminController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ========== AUTH ROUTES (Public) ==========
router.post("/auth/login", adminLogin);

// ========== PROTECTED ADMIN ROUTES ==========
// Auth
router.get("/auth/me", requireAdminAuth, getAdminMe);
router.post("/auth/logout", requireAdminAuth, adminLogout);

// Dashboard
router.get("/dashboard/stats", requireAdminAuth, getDashboardStats);

// Students Management
router.get("/students", requireAdminAuth, getStudents);
router.patch("/students/:id/status", requireAdminAuth, updateStudentStatus);

// Drivers Management
router.get("/drivers", requireAdminAuth, getDrivers);
router.patch("/drivers/:id/status", requireAdminAuth, updateDriverStatus);

// Rides Monitoring
router.get("/rides", requireAdminAuth, getRides);

export default router;
