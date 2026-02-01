import express from "express";
import { cleanupRides } from "../controllers/internalController.js";

const router = express.Router();

// Protected cleanup endpoint
router.post("/cleanup-rides", cleanupRides);

// Also support GET for easy browser/cron testing if needed (optional)
router.get("/cleanup-rides", cleanupRides);

export default router;
