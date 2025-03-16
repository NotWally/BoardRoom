const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Load environment variables

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret"; // ✅ Use consistent secret

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

        // ✅ Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        await user.save();

        const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: '"BoardRoom Team" <no-reply@boardroom.com>',
            to: user.email,
            subject: "Verify Your Email - BoardRoom",
            html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
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

        if (!username || !email || !password)
            return res
                .status(400)
                .json({ message: "All fields are required." });

        username = username.toLowerCase();
        email = email.toLowerCase();

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res
                .status(400)
                .json({ message: "Email is already in use." });

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
            to: email,
            subject: "Verify Your Email - BoardRoom",
            html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
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
        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified,
        });
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
