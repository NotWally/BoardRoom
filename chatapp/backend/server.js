const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

if (!MONGO_URI) {
    console.error("❌ MongoDB URI is not defined.");
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected..."))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

app.use("/api/auth", authRoutes);

// ✅ Serve Static Frontend Files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ✅ Middleware: Authenticate Protected Routes
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "🚫 Unauthorized Access!" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "❌ Invalid Token!" });
        }
        req.user = user;
        next();
    });
}

// ✅ Protect Dashboard Page
app.get("/dashboard.html", authenticateToken, (req, res) => {
    res.sendFile(path.join(frontendPath, "dashboard.html"));
});

// ✅ Serve `login.html` and Other Pages Correctly
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, req.path), (err) => {
        if (err) {
            res.sendFile(path.join(frontendPath, "index.html"));
        }
    });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
