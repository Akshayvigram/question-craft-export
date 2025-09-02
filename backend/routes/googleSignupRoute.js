// routes/signupRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const createDbPool = require("../awsdb");
//const config = require("../config"); // DB config

const router = express.Router();

// Constants
const JWT_SECRET = "8a895d7bae90d2a2b68af62fc59bdcfd958642a23a2ab70b571f0b91bec3f4d02c93eaa9f8635075a6a0b96ef0b6c63cca5519f103d9b40b05e3a7f0dba8d11c";
const GOOGLE_CLIENT_ID = "878546422282-e76o734cnqu31sj79iivkt6qhnf6l7s0.apps.googleusercontent.com";

// DB pool
module.exports = function(db, config) {


// Google OAuth2 client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google signup route
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Missing Google token" });
    }

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // ✅ Check if user already exists
    const rows = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "User already exists. Please login instead.",
      });
    }

    // ✅ Insert new user into DB
    const [result] = await pool.query(
      "INSERT INTO users (name, email, google_id, picture, is_active, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [name, email, googleId, picture, 1, "user"]
    );

    const newUserId = result.insertId;

    // ✅ Generate JWT
    const authToken = jwt.sign({ id: newUserId, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      success: true,
      message: "Signup successful",
      token: authToken,
      user: {
        id: newUserId,
        name,
        email,
        picture,
        googleId,
      },
    });
  } catch (error) {
    console.error("Google signup error:", error);
    return res.status(500).json({ success: false, error: "Google signup failed" });
  }
});

return router;
}