// controllers/userControllers.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken"); // uncomment to use JWT

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // avoid revealing whether email exists in prod; for dev this is okay
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Example: Generate JWT (optional)
    /*
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email }
    });
    */

    // Basic success reply (no token)
    return res.status(200).json({ message: "Login successful", user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Failed to login", error: err.message });
  }
};

module.exports = { loginUser };
