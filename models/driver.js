import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailOTP: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    vehicleInfo: {
        make: { type: String, default: null },
        model: { type: String, default: null },
        plateNumber: { type: String, default: null },
        color: { type: String, default: null },
        year: { type: Number, default: null }
    },
    profileImage: {
        type: String,
        default: null
    },
    licenseNumber: {
        type: String,
        default: null
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRides: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
