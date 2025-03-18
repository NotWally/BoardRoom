const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library"); // ✅ Correct import

dotenv.config(); // ✅ Load environment variables

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret"; // ✅ Use consistent secret
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

if (!process.env.JWT_SECRET) {
    console.warn(
        "⚠️ Warning: JWT_SECRET is not set in .env file! Using default."
    );
}

// ✅ Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // ✅ Use environment variables
        pass: process.env.EMAIL_PASS, // ✅ App password
    },
});

// ✅ Resend Verification Email Route
router.post("/resend-verification", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.verified)
            return res.status(400).json({ message: "Already verified" });

        const email = user.email; // ✅ FIXED: Get user's email from database

        // ✅ Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        await user.save();

        const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: '"BoardRoom Team" <no-reply@boardroom.com>',
            to: email, // ✅ FIXED: Now using `user.email`
            subject: "📧 Verify Your Email - BoardRoom",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #202020;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #141414;">
                        <div style="text-align: center; padding-bottom: 20px;">
                            <img src="https://bit.ly/4kImmno" alt="BoardRoom Logo" style="max-width: 150px; margin-bottom: 10px;">
                            <h2 style="color: #56FF72; margin: 0;">Welcome to BoardRoom! 🎉</h2>
                        </div>
                        <p style="color: #fff; font-size: 16px; line-height: 1.5; text-align: center;">
                            Thank you for signing up for <strong>BoardRoom</strong>! Before getting started, please verify your email address by clicking the button below.
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${verificationUrl}" style="
                                background-color: #56FF72;
                                color: #141414;
                                padding: 12px 24px;
                                border-radius: 5px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: bold;
                                display: inline-block;">
                                ✅ Verify My Email
                            </a>
                        </div>
                        <p style="color: #555; font-size: 14px; text-align: center;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="word-wrap: break-word; text-align: center; font-size: 14px; color: #777;">
                            <a href="${verificationUrl}" style="color: #56FF72;">${verificationUrl}</a>
                        </p>
                        <hr style="border: 0; height: 1px; background-color: #ddd; margin: 20px 0;">
                        <p style="color:rgb(177, 177, 177); font-size: 12px; text-align: center;">
                            If you didn’t sign up for BoardRoom, please ignore this email or contact support.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        res.json({ message: "Verification email has been resent." });
    } catch (error) {
        console.error("❌ Error resending verification email:", error);
        res.status(500).json({
            message: "Error resending verification email.",
        });
    }
});

// ✅ Verify Email Route
router.get("/verify-email/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user)
            return res
                .status(400)
                .json({ message: "Invalid or expired verification token." });

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        res.redirect("http://localhost:5000/verified.html");
    } catch (error) {
        console.error("❌ Verification error:", error);
        res.status(500).json({ message: "Error during verification." });
    }
});

// ✅ Registration Route
router.post("/register", async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ message: "All fields are required." });
        }

        username = username.toLowerCase();
        email = email.toLowerCase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email is already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verified: false,
            verificationToken,
        });

        await newUser.save();

        // ✅ Send Verification Email
        const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: '"BoardRoom Team" <no-reply@boardroom.com>',
            to: email, // ✅ FIXED: Now using `user.email`
            subject: "📧 Verify Your Email - BoardRoom",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #202020;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #141414;">
                        <div style="text-align: center; padding-bottom: 20px;">
                            <img src="https://bit.ly/4kImmno" alt="BoardRoom Logo" style="max-width: 150px; margin-bottom: 10px;">
                            <h2 style="color: #56FF72; margin: 0;">Welcome to BoardRoom! 🎉</h2>
                        </div>
                        <p style="color: #fff; font-size: 16px; line-height: 1.5; text-align: center;">
                            Thank you for signing up for <strong>BoardRoom</strong>! Before getting started, please verify your email address by clicking the button below.
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${verificationUrl}" style="
                                background-color: #56FF72;
                                color: #141414;
                                padding: 12px 24px;
                                border-radius: 5px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: bold;
                                display: inline-block;">
                                ✅ Verify My Email
                            </a>
                        </div>
                        <p style="color: #555; font-size: 14px; text-align: center;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="word-wrap: break-word; text-align: center; font-size: 14px; color: #777;">
                            <a href="${verificationUrl}" style="color: #56FF72;">${verificationUrl}</a>
                        </p>
                        <hr style="border: 0; height: 1px; background-color: #ddd; margin: 20px 0;">
                        <p style="color:rgb(177, 177, 177); font-size: 12px; text-align: center;">
                            If you didn’t sign up for BoardRoom, please ignore this email or contact support.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        res.json({
            message:
                "Registration successful! Check your email to verify your account.",
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({
            message: "Registration failed. Try again later.",
        });
    }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
    try {
        let { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password)
            return res
                .status(400)
                .json({ message: "All fields are required." });

        emailOrUsername = emailOrUsername.toLowerCase();
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });

        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        // ✅ Use the SAME SECRET KEY to sign the JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Login failed. Try again later." });
    }
});

// ✅ Get User Data Route
router.get("/user", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select(
            "username email verified"
        );
        const totalUsers = await User.countDocuments();

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            totalUsers, // Add total user count
        });
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete-account", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const userEmail = user.email;
        const username = user.username;

        // ✅ Delete the user
        await User.findByIdAndDelete(decoded.id);

        // ✅ Send Goodbye Email
        await transporter.sendMail({
            from: '"BoardRoom Team" <no-reply@boardroom.com>',
            to: userEmail,
            subject: "👋 We're Sad to See You Go - BoardRoom",
            html: goodbyeEmailTemplate(username),
        });

        res.json({
            message: "✅ Account deleted successfully. Farewell email sent.",
        });
    } catch (error) {
        console.error("❌ Error deleting account:", error);
        res.status(500).json({ message: "Error deleting account." });
    }
});

// ✅ Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "❌ Email not found." });

        // ✅ Generate Reset Token & Expiry
        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 3600000; // ✅ Expires in 1 hour

        // ✅ FORCE SAVE THE USER
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { resetToken, resetTokenExpires: user.resetTokenExpires } },
            { new: true }
        );

        if (!updatedUser)
            return res.status(500).json({ message: "❌ Error saving token." });

        // ✅ Generate Password Reset Link
        const resetUrl = `http://localhost:5000/reset-password.html?token=${resetToken}`;

        // ✅ Send Reset Email
        await transporter.sendMail({
            from: '"BoardRoom Team" <no-reply@boardroom.com>',
            to: email,
            subject: "🔑 Reset Your Password - BoardRoom",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #202020;">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #141414;">
                        <div style="text-align: center; padding-bottom: 20px;">
                            <img src="https://bit.ly/4kImmno" alt="BoardRoom Logo" style="max-width: 150px; margin-bottom: 10px;">
                            <h2 style="color: #56FF72; margin: 0;">Reset Your Password 🔑</h2>
                        </div>
                        <p style="color: #fff; font-size: 16px; line-height: 1.5; text-align: center;">
                            We received a request to reset your password for your <strong>BoardRoom</strong> account.
                            Click the button below to set a new password. This link will expire in 1 hour.
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${resetUrl}" style="
                                background-color: #56FF72;
                                color: #141414;
                                padding: 12px 24px;
                                border-radius: 5px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: bold;
                                display: inline-block;">
                                🔑 Reset Password
                            </a>
                        </div>
                        <p style="color: #555; font-size: 14px; text-align: center;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="word-wrap: break-word; text-align: center; font-size: 14px; color: #777;">
                            <a href="${resetUrl}" style="color: #56FF72;">${resetUrl}</a>
                        </p>
                        <hr style="border: 0; height: 1px; background-color: #ddd; margin: 20px 0;">
                        <p style="color:rgb(177, 177, 177); font-size: 12px; text-align: center;">
                            If you didn’t request a password reset, you can safely ignore this email. No changes have been made to your account.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        res.json({ message: "📧 Password reset link sent to your email." });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: "❌ Error sending reset link." });
    }
});

// ✅ Reset Password Route
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // ✅ Check if the user exists with this reset token & it's not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() }, // Ensure token is still valid
        });

        if (!user)
            return res
                .status(400)
                .json({ message: "❌ Invalid or expired token." });

        // ✅ Hash New Password & Save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ message: "✅ Password reset successful!" });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ message: "❌ Error resetting password." });
    }
});

router.get("/all-users", async (req, res) => {
    try {
        const users = await User.find({}, "username"); // Fetch all usernames
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users." });
    }
});

router.patch("/change-username", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const { newUsername } = req.body;
        if (!newUsername)
            return res.status(400).json({ message: "New username required." });

        // ✅ Check if username is already taken
        const usernameExists = await User.findOne({
            username: newUsername.toLowerCase(),
        });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already taken." });
        }

        // ✅ Update username
        user.username = newUsername.toLowerCase();
        await user.save();

        res.json({ message: "✅ Username updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating username:", error);
        res.status(500).json({ message: "Error updating username." });
    }
});

const goodbyeEmailTemplate = (username) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Goodbye from BoardRoom</title>
</head>
<body style="margin: 0; padding: 0; background-color: #141414; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" bgcolor="#141414" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="padding: 15px;">
                <table role="presentation" width="600" bgcolor="#1E1E1E" cellpadding="0" cellspacing="0" border="0" style="border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <img src="https://bit.ly/4kImmno" alt="BoardRoom Logo" width="100">
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="color: #FF4C4C; font-size: 22px; font-weight: bold;">
                            We're Sad to See You Go! 😢
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="color: #ffffff; font-size: 14px;">
                            Hello, <strong style="color: #56ff72;">${username}</strong>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="color: #cccccc; font-size: 12px; padding: 10px;">
                            We're sorry to see you leave <strong style="color: #56ff72;">BoardRoom</strong>. 
                            If there’s anything we could have done better, we'd love your feedback.
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 15px;">
                            <a href="mailto:boardroomcomms@gmail.com" style="
                                background-color: #FF4C4C;
                                color: #ffffff;
                                text-decoration: none;
                                font-size: 14px;
                                padding: 10px 20px;
                                border-radius: 5px;
                                display: inline-block;">
                                💬 Give Feedback
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="color: #cccccc; font-size: 12px; padding: 10px;">
                            If you ever wish to return, our doors are always open! <br>
                            Visit <a href="https://your-signup-link.com" style="color: #56ff72; text-decoration: none; font-weight: bold;">BoardRoom</a> to sign up again.
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="color: #777777; font-size: 10px; padding: 15px;">
                            If this was a mistake or you need help, please <a href="mailto:boardroomcomms@gmail.com" style="color: #56ff72; text-decoration: none;">contact our support team</a>.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

router.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(400).json({ message: "No token provided" });

        // ✅ Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const { sub, email, name } = ticket.getPayload(); // sub = Google ID

        let user = await User.findOne({ email });

        if (!user) {
            // ✅ Check if the username is already taken
            let baseUsername = name.replace(/\s+/g, ""); // Remove spaces from name
            let uniqueUsername = baseUsername;
            let count = 1;

            while (await User.findOne({ username: uniqueUsername })) {
                uniqueUsername = `${baseUsername}${count}`;
                count++;
            }

            // ✅ Create a new user with a unique username
            user = new User({
                googleId: sub,
                username: uniqueUsername, // ✅ Ensure unique username
                email: email,
                verified: true, // ✅ Google accounts are verified by default
            });

            await user.save();
        } else if (!user.googleId) {
            // ✅ If the user exists but was not created with Google, update them
            user.googleId = sub;
            await user.save();
        }

        // ✅ Generate JWT token for authentication
        const authToken = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token: authToken });
    } catch (error) {
        console.error("❌ Google login error:", error);
        res.status(500).json({ message: "Google login failed" });
    }
});

module.exports = router;
