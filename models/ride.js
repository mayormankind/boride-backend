import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    pickupLocation: {
      type: {
        address: { type: String, required: true },
        coordinates: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
      },
      required: true,
    },
    dropoffLocation: {
      type: {
        address: { type: String, required: true },
        coordinates: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
      },
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Wallet"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "ongoing",
        "completion_requested",
        "completed",
        "disputed",
        "cancelled",
      ],
      default: "pending",
    },
    estimatedDistance: {
      type: Number, // in kilometers
      default: null,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: null,
    },
    actualDistance: {
      type: Number,
      default: null,
    },
    actualDuration: {
      type: Number,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    // Wallet lock for completion_requested state
    walletLocked: {
      type: Boolean,
      default: false,
    },
    lockedAmount: {
      type: Number,
      default: 0,
    },
    completionRequestedAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["student", "driver", "system", null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    disputeReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    // Immutable ride lifecycle timeline - append only
    timeline: [
      {
        type: {
          type: String,
          enum: [
            "requested",
            "accepted",
            "driver_arrived",
            "started",
            "completion_requested",
            "completed",
            "disputed",
            "cancelled",
          ],
          required: true,
        },
        message: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Index for efficient queries
rideSchema.index({ student: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });

export default mongoose.models.Ride || mongoose.model("Ride", rideSchema);
