const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // ✅ Email verification status
    verificationToken: { type: String }, // ✅ Token for email verification

    // ✅ Add Password Reset Fields
    resetToken: { type: String }, // Token for password reset
    resetTokenExpires: { type: Date }, // Expiry date for reset token
});

module.exports = mongoose.model("User", UserSchema);
