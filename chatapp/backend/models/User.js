const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // ✅ New field: Email verified or not
    verificationToken: { type: String }, // ✅ Token for email verification
});

module.exports = mongoose.model("User", UserSchema);
