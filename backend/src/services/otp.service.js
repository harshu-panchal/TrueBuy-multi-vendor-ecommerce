import crypto from 'crypto';
import { sendEmail } from './email.service.js';

/**
 * Generates a 6-digit OTP and sets expiry (10 minutes)
 * @param {Object} user - Mongoose user/vendor document
 * @param {string} type - Purpose label (for logging)
 */
export const sendOTP = async (user, type = 'verification') => {
    // Efficiently prevent duplicate sends within a short window (e.g., 30s)
    const now = Date.now();
    const lastSentAt = user.otpExpiry ? user.otpExpiry.getTime() - (10 * 60 * 1000) : 0;
    if (user.otp && (now - lastSentAt < 30 * 1000)) {
        return user.otp;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(now + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            to: user.email,
            subject: 'TrueBuy Account Verification Code',
            text: `Hello,\n\nYour TrueBuy verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.\n\nBest regards,\nThe TrueBuy Team`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Welcome to TrueBuy!</h2>
                <p style="color: #555; font-size: 16px;">Hello,</p>
                <p style="color: #555; font-size: 16px;">Please use the following verification code to complete your secure sign in or registration process:</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
                </div>
                <p style="color: #555; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                <p style="color: #888; font-size: 12px; text-align: center;">If you did not request this email, you can safely ignore it.</p>
                <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} TrueBuy. All rights reserved.</p>
            </div>
            `,
        });
    } catch (err) {
        // Keep auth flow working in environments where SMTP is not configured.
        console.warn(`[OTP] Email send failed for ${user.email}: ${err.message}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[OTP] ${type} OTP generated for ${user.email}`);
        }
    }

    return otp;
};
