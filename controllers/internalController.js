// controllers/internalController.js
import Ride from "../models/ride.js";

/**
 * POST /api/internal/cleanup-rides
 * Find and cancel stale rides (pending > 15m, accepted > 30m)
 * Protected by secret key
 */
export async function cleanupRides(req, res) {
  try {
    // 1. Verify Secret Key
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // Support both "Bearer <secret>" and just "<secret>" or Vercel's signature if needed
    // For simplicity, we'll expect "Bearer <CRON_SECRET>" or a custom header
    // Vercel recommends checking for `headers['authorization'] === \`Bearer \${process.env.CRON_SECRET}\``

    if (
      !cronSecret ||
      (authHeader !== `Bearer ${cronSecret}` &&
        req.headers["x-cron-secret"] !== cronSecret)
    ) {
      // Allow local dev bypass if needed or strictly enforce
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // 2. Find and Cancel Expired PENDING rides
    const expiredPending = await Ride.updateMany(
      {
        status: "pending",
        createdAt: { $lt: fifteenMinutesAgo },
      },
      {
        $set: {
          status: "cancelled",
          cancelledBy: null, // system
          cancellationReason: "No driver accepted within 15 minutes",
          cancelledAt: now,
        },
        $push: {
          timeline: {
            type: "cancelled",
            message: "System auto-cancelled: No driver accepted in time",
            timestamp: now,
          },
        },
      },
    );

    // 3. Find and Cancel Stale ACCEPTED rides (Accepted but not started by the driver)
    // We assume if it's accepted > 30 mins ago and NOT started (no startTime), it's stale.
    const staleAccepted = await Ride.updateMany(
      {
        status: "accepted",
        updatedAt: { $lt: thirtyMinutesAgo },
      },
      {
        $set: {
          status: "cancelled",
          cancelledBy: null, // system
          cancellationReason: "Driver did not start ride in time",
          cancelledAt: now,
        },
        $push: {
          timeline: {
            type: "cancelled",
            message: "System auto-cancelled: Driver did not start ride in time",
            timestamp: now,
          },
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Cleanup complete",
      data: {
        cancelledPending: expiredPending.modifiedCount,
        cancelledAccepted: staleAccepted.modifiedCount,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error("Cleanup Rides Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
