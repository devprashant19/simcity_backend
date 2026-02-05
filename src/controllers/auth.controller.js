const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Firebase UID based signup/login
 */
exports.firebaseAuth = async (req, res) => {
  try {
    const { firebaseUid, username, email, password } = req.body;

    if (!firebaseUid || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    let user = await User.findOne({ firebaseUid });

    // 🔁 Already exists → LOGIN
    if (user) {
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
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
