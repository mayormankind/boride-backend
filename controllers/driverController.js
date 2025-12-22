import Driver from "../models/driver.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwts.js";
import { sendOTPEmail, sendLoginNotification } from "../utils/mailer.js";
import { isValidEmail } from "../utils/validator.js";
import Wallet from "../models/wallet.js";
import { cookieOptions } from "../utils/cookieOptions.js";


// ========================= REGISTER DRIVER =========================
export const registerDriver = async (req, res) => {
    try {
        const { email, fullName, password, phoneNo } = req.body;

        if (!email || !fullName || !password || !phoneNo) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Create new driver
        const newDriver = await Driver.create({
            fullName,
            email,
            phoneNo,
            password: hashedPassword,
            emailOTP: otp,
            otpExpires: otpExpiry
        });

        // Create wallet for driver
        await Wallet.create({
            user: newDriver._id,
            userType: "Driver",
            balance: 0
        });

        // Send OTP email using EJS template
        await sendOTPEmail(email, fullName, otp, "Driver");

        res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to email.",
            driverId: newDriver._id
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// ========================= VERIFY DRIVER EMAIL =========================
export const verifyDriverEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ 
                success: false, 
                message: "Driver not found" 
            });
        }

        if (driver.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already verified" 
            });
        }

        if (driver.emailOTP !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP" 
            });
        }

        if (driver.otpExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP expired" 
            });
        }

        driver.isVerified = true;
        driver.emailOTP = null;
        driver.otpExpires = null;
        await driver.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message 
        });
    }
};

// ========================= RESEND OTP =========================
export const resendDriverOTP = async (req, res) => {
    try {
        const { email, driverId } = req.body;

        if (!email && !driverId) {
            return res.status(400).json({
                success: false,
                message: "Email or driverId is required"
            });
        }

        const driver = await Driver.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { _id: driverId }
            ]
        });

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        if (driver.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        // Generate NEW OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 15 * 60 * 1000;

        driver.emailOTP = otp;
        driver.otpExpires = otpExpiry;
        await driver.save();

        // Send OTP email
        await sendOTPEmail(driver.email, driver.fullName, otp, "Driver");

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
            email: driver.email
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ========================= LOGIN DRIVER =========================
export const loginDriver = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }
  
      const driver = await Driver.findOne({ email });
      if (!driver) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      if (!driver.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Email not verified. Please verify before login.",
            email: driver.email,
            role: "driver"
          });
      }
  
      const isMatch = await bcrypt.compare(password, driver.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const token = signToken({
        id: driver._id,
        role: "driver"
      });
  
      // 🔐 SET COOKIE
      res.cookie("access_token", token, cookieOptions);
  
      return res.status(200).json({
        success: true,
        message: "Login successful",
        driver: {
          id: driver._id,
          fullName: driver.fullName,
          email: driver.email,
          phoneNo: driver.phoneNo,
          isAvailable: driver.isAvailable,
          vehicleInfo: driver.vehicleInfo
        }
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };
  

// ========================= UPDATE DRIVER PROFILE =========================
export const updateDriverProfile = async (req, res) => {
    try {
        const driverId = req.user._id;
        const { fullName, phoneNo, vehicleInfo, licenseNumber, profileImage } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNo) updateData.phoneNo = phoneNo;
        if (vehicleInfo) updateData.vehicleInfo = vehicleInfo;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;
        if (profileImage) updateData.profileImage = profileImage;

        const driver = await Driver.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            driver
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ========================= TOGGLE DRIVER AVAILABILITY =========================
export const toggleAvailability = async (req, res) => {
    try {
        const driverId = req.user._id;

        const driver = await Driver.findById(driverId);
        console.log(driver);
        driver.isAvailable = !driver.isAvailable;
        await driver.save();
        console.log(driver)

        return res.status(200).json({
            success: true,
            message: `Availability set to ${driver.isAvailable ? 'available' : 'unavailable'}`,
            isAvailable: driver.isAvailable
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
