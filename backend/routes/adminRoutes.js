const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword || !process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Admin login is not configured.",
      });
    }

    const usernameMatches = username === adminUsername;
    const passwordMatches = await bcrypt.compare(
      password,
      adminPassword
    ).catch(() => false);

    // Also support a plain password stored in the private backend .env.
    const plainPasswordMatches = password === adminPassword;

    if (!usernameMatches || (!passwordMatches && !plainPasswordMatches)) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      { username: adminUsername, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: { username: adminUsername },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

module.exports = router;