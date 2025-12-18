import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    matricNo: {
      type: String,
      required: [true, "Matric number is required"],
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOTP: {
      type: String,
      default: null,
    },

    phoneNo: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in Next.js / hot reload environments
export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
