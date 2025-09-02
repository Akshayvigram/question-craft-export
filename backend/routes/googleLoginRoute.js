const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const router = express.Router();

const JWT_SECRET = "8a895d7bae90d2a2b68af62fc59bdcfd958642a23a2ab70b571f0b91bec3f4d02c93eaa9f8635075a6a0b96ef0b6c63cca5519f103d9b40b05e3a7f0dba8d11c";

router.post("/auth/google", async (req, res) => {
  console.log("---- Google Auth Request Received ----");
  console.log("Request body:", req.body);

  try {
    const { token } = req.body; // This is the Google access token (starts with ya29...)
    if (!token) {
      console.warn("⚠ Missing Google access token in request body");
      return res.status(400).json({ success: false, error: "Missing Google access token" });
    }

    console.log("📡 Verifying Google access token...");
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);
    if (!googleRes.ok) {
      throw new Error(`Google API returned ${googleRes.status}`);
    }

    const userInfo = await googleRes.json();
    console.log("✅ Google access token valid. User info:", userInfo);

    console.log("🔑 Creating JWT for app...");
    const appToken = jwt.sign(
      {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎫 JWT created:", appToken);

    res.json({
      success: true,
      token: appToken,
      user: {
        googleId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
