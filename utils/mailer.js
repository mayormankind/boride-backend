import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} otp - One-time password
 * @param {string} userType - 'Student' or 'Driver'
 */
export async function sendOTPEmail(email, fullName, otp, userType) {
    const templatePath = path.join(__dirname, '../views/emails/otp-verification.ejs');
    
    const html = await ejs.renderFile(templatePath, {
        fullName,
        otp,
        userType
    });

    await mailer.sendMail({
        from: `"BoRide" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Verify Your ${userType} Account - BoRide`,
        html
    });
}

/**
 * Send login notification email
 * @param {string} email - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} userType - 'Student' or 'Driver'
 */
export async function sendLoginNotification(email, fullName, userType) {
    const templatePath = path.join(__dirname, '../views/emails/login-notification.ejs');
    
    const html = await ejs.renderFile(templatePath, {
        fullName,
        loginTime: new Date().toLocaleString('en-US', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        }),
        userType
    });

    await mailer.sendMail({
        from: `"BoRide Security" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Login Notification - BoRide',
        html
    });
}

/**
 * Send ride booking confirmation
 */
export async function sendRideBookedEmail(studentEmail, rideData) {
    const templatePath = path.join(__dirname, '../views/emails/ride-booked.ejs');
    
    const html = await ejs.renderFile(templatePath, {
        studentName: rideData.studentName,
        rideId: rideData.rideId,
        pickupLocation: rideData.pickupLocation,
        dropoffLocation: rideData.dropoffLocation,
        fare: rideData.fare,
        paymentMethod: rideData.paymentMethod
    });

    await mailer.sendMail({
        from: `"BoRide" <${process.env.MAIL_USER}>`,
        to: studentEmail,
        subject: 'Ride Booked Successfully - BoRide',
        html
    });
}

/**
 * Send ride acceptance notification
 */
export async function sendRideAcceptedEmail(studentEmail, rideData) {
    const templatePath = path.join(__dirname, '../views/emails/ride-accepted.ejs');
    
    const html = await ejs.renderFile(templatePath, {
        studentName: rideData.studentName,
        rideId: rideData.rideId,
        pickupLocation: rideData.pickupLocation,
        driverName: rideData.driverName,
        driverPhone: rideData.driverPhone,
        vehicleInfo: rideData.vehicleInfo,
        estimatedArrival: rideData.estimatedArrival
    });

    await mailer.sendMail({
        from: `"BoRide" <${process.env.MAIL_USER}>`,
        to: studentEmail,
        subject: 'Driver Accepted Your Ride - BoRide',
        html
    });
}

/**
 * Send ride completion notification
 */
export async function sendRideCompletedEmail(studentEmail, rideData) {
    const templatePath = path.join(__dirname, '../views/emails/ride-completed.ejs');
    
    const html = await ejs.renderFile(templatePath, {
        studentName: rideData.studentName,
        rideId: rideData.rideId,
        driverName: rideData.driverName,
        duration: rideData.duration,
        totalFare: rideData.totalFare,
        paymentMethod: rideData.paymentMethod,
        walletBalance: rideData.walletBalance
    });

    await mailer.sendMail({
        from: `"BoRide" <${process.env.MAIL_USER}>`,
        to: studentEmail,
        subject: 'Trip Completed - BoRide',
        html
    });
}
