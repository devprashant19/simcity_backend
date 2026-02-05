const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Firebase UID based signup/login
 */
exports.firebaseAuth = async (req, res) => {
  try {
    const { firebaseUid, username, email, password, emailVerified } = req.body;

    if (!firebaseUid || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    let user = await User.findOne({ firebaseUid });

    // 🔁 Already exists → LOGIN
    if (user) {
      // Enforce Email Verification
      if (!emailVerified) {
        return res.status(403).json({ message: "Email not verified. Please check your inbox." });
      }

      // 🔹 BACKFILL DEFAULTS (for existing users)
      if (user.attacksLeft === undefined || user.helpLeft === undefined) {
        user.attacksLeft = user.attacksLeft ?? 3;
        user.helpLeft = user.helpLeft ?? 3;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user
      });
    }

    // 🆕 New user → SIGNUP
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      firebaseUid,
      username,
      email,
      password: hashedPassword,
      // Default schemas apply here, but explicit is fine too
      attacksLeft: 3,
      helpLeft: 3
    });

    // NEW: Require Verification
    res.status(201).json({
      message: "User created. Please verify your email before logging in.",
      user: { ...user.toObject(), token: null } // No token
    });
  } catch (err) {
    console.error("Firebase Auth Error:", err);
    // Handle Duplicate Key Error (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please choose another.`
      });
    }
    // Standardize error response
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
