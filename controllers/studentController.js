//studentController.js
import Student from "../models/student.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidMatricNumber } from "../utils/validator.js";
import { signToken } from "../utils/jwts.js";
import { sendOTPEmail, sendLoginNotification } from "../utils/mailer.js";
import Wallet from "../models/wallet.js";
import { cookieOptions } from "../utils/cookieOptions.js";


export async function registerStudent(req, res) {
    try {
        const { email, matricNo, fullName, password, phoneNo } = req.body;

        if (!email || !matricNo || !fullName || !password || !phoneNo) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!isValidMatricNumber(matricNo)) {
            return res.status(400).json({ success: false, message: "Invalid matric number format" });
        }

        const existing = await Student.findOne({ $or: [{ email }, { matricNo }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "Student already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; 

        const student = await Student.create({
            fullName,
            matricNo,
            email,
            phoneNo,
            password: hashedPassword,
            emailOTP: otp,
            otpExpires: otpExpiry
        });

        // Create wallet for student
        await Wallet.create({
            user: student._id,
            userType: "Student",
            balance: 0
        });

        // Send OTP email using EJS template
        await sendOTPEmail(email, fullName, otp, "Student");

        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to email.",
            studentId: student._id
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

// verify email function
export async function verifyStudentEmail(req, res) {
    try {
        const { email, otp } = req.body;

        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (student.isVerified) {
            return res.status(400).json({ success: false, message: "Email already verified" });
        }

        if (student.emailOTP !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (student.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        student.isVerified = true;
        student.emailOTP = null;
        student.otpExpires = null;
        await student.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// Login student
export async function loginStudent(req, res) {
  try {
    const { email, matricNo, password } = req.body;

    if (!password || (!email && !matricNo)) {
      return res.status(400).json({
        success: false,
        message: "Provide password and either email or matric number"
      });
    }

    const student = await Student.findOne({
      $or: [
        { email: email?.trim().toLowerCase() },
        { matricNo: matricNo?.trim().toUpperCase() }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify before login.",
        email: student.email,
        role: "student"
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = signToken({
      id: student._id,
      role: "student"
    });

    // 🔐 SET COOKIE
    res.cookie("access_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        matricNo: student.matricNo,
        phoneNo: student.phoneNo,
        profileImage: student.profileImage,
        isVerified: student.isVerified,
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


export async function resendVerificationOTP(req, res) {
    try {
        const { email, studentId } = req.body;

        // Validation to ensure student must provide something to get identified(email/id)
        if (!email && !studentId) {
            return res.status(400).json({
                success: false,
                message: "Email or studentId is required"
            });
        }

        // Find student by email or ID
        const student = await Student.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { _id: studentId }
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Check if already verified
        if (student.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        // Generate NEW OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 min

        student.emailOTP = otp;
        student.otpExpires = otpExpiry;
        await student.save();

        // Send OTP mail using EJS template
        await sendOTPEmail(student.email, student.fullName, otp, "Student");

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
            email: student.email
        });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

// UPDATE STUDENT PROFILE
export async function updateStudentProfile(req, res) {
    try {
        const studentId = req.user._id;
        const { fullName, phoneNo, profileImage } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNo) updateData.phoneNo = phoneNo;
        if (profileImage) updateData.profileImage = profileImage;

        const student = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            student
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

export const logout = (req, res) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
  
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  };
  
