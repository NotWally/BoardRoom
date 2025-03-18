const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // ✅ Allow Google users without passwords
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    }, // ✅ Only required for non-Google users
    verified: { type: Boolean, default: false }, // ✅ New field for email verification
    verificationToken: { type: String }, // ✅ Token for email verification

    // ✅ Add Password Reset Fields
    resetToken: { type: String }, // Token for password reset
    resetTokenExpires: { type: Date }, // Expiry date for reset token
});

module.exports = mongoose.model("User", UserSchema);
