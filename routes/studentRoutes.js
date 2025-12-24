import express from "express";
import { 
  registerStudent, 
  loginStudent, 
  verifyStudentEmail, 
  resendVerificationOTP,
  updateStudentProfile,
  logout
} from "../controllers/studentController.js";
import {
  bookRide,
  getStudentRides,
  cancelRide,
  rateRide,
  getRideDetails,
} from "../controllers/rideController.js";
import {
  getWalletBalance,
  getTransactionHistory,
  fundWallet,
} from "../controllers/walletController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// REGISTER — send OTP to email
router.post("/register", registerStudent);

// VERIFY EMAIL OTP
router.post("/verify-email", verifyStudentEmail);

// RESEND OTP
router.post("/resend-otp", resendVerificationOTP);

// LOGIN — only if verified
router.post("/login", loginStudent);

// LOGOUT FOR BOTH STUDENT AND DRIVER
router.post("/logout", logout)

// PROFILE ROUTES (Protected)
router.put("/profile", authenticate("student"), updateStudentProfile);

// RIDE ROUTES (Protected)
router.post("/rides", authenticate("student"), bookRide);
router.get("/rides", authenticate("student"), getStudentRides);
router.get("/rides/:rideId", authenticate("student"), getRideDetails);
router.put("/rides/:rideId/cancel", authenticate("student"), cancelRide);
router.put("/rides/:rideId/rate", authenticate("student"), rateRide);

// WALLET ROUTES (Protected)
router.get("/wallet", authenticate("student"), getWalletBalance);
router.get("/wallet/transactions", authenticate("student"), getTransactionHistory);
router.post("/wallet/fund", authenticate("student"), fundWallet);

export default router;
