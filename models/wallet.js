import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["Student", "Driver"],
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        paymentReference: { type: String },
        type: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        relatedRide: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ride",
          default: null,
        },
        balanceBefore: {
          type: Number,
          required: true,
        },
        balanceAfter: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one wallet per user
walletSchema.index({ user: 1, userType: 1 }, { unique: true });

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
