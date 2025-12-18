import express from "express";
import { 
  registerDriver, 
  loginDriver,
  verifyDriverEmail,
  resendDriverOTP,
  updateDriverProfile,
  toggleAvailability
} from "../controllers/driverController.js";
import {
  getAvailableRides,
  acceptRide,
  getDriverRides,
  startRide,
  completeRide,
  cancelRide,
  getRideDetails,
} from "../controllers/rideController.js";
import {
  getWalletBalance,
  getTransactionHistory,
  withdrawFromWallet,
} from "../controllers/walletController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.post("/register", registerDriver);
router.post("/verify-email", verifyDriverEmail);
router.post("/resend-otp", resendDriverOTP);
router.post("/login", loginDriver);

// ==================== PROFILE ROUTES (Protected) ====================
router.put("/profile", authenticate("driver"), updateDriverProfile);
router.put("/availability", authenticate("driver"), toggleAvailability);

// ==================== RIDE ROUTES (Protected) ====================
router.get("/rides/available", authenticate("driver"), getAvailableRides);
router.get("/rides", authenticate("driver"), getDriverRides);
router.get("/rides/:rideId", authenticate("driver"), getRideDetails);
router.put("/rides/:rideId/accept", authenticate("driver"), acceptRide);
router.put("/rides/:rideId/start", authenticate("driver"), startRide);
router.put("/rides/:rideId/complete", authenticate("driver"), completeRide);
router.put("/rides/:rideId/cancel", authenticate("driver"), cancelRide);

// ==================== WALLET ROUTES (Protected) ====================
router.get("/wallet", authenticate("driver"), getWalletBalance);
router.get("/wallet/transactions", authenticate("driver"), getTransactionHistory);
router.post("/wallet/withdraw", authenticate("driver"), withdrawFromWallet);

export default router;
