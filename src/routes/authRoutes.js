import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
// POST /api/auth/register
router.post("/register", async (req, res) => {
  // - Validate input
  const { name, email, password } = req.body;

  try {
    if (password === "" || email === "" || name === "") {
      return res.status(400).json({
        success: false,
        message: "email,password and name are required",
      });
    }
    if (emailPattern.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid email provided" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
    }

    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: "name must be at least 3 characters",
      });
    }

    // - Check if user exists
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
    }
    // - Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // - Save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    // - Return user (without password)
    return res.status(201).json({
      success: true,
      data: {
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      message: "Registration successful",
    });
  } catch (error) {
    console.log("Register error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    // - Find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    // - Compare password
    const passMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    // - Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    // - Return token
    return res
      .status(200)
      .json({ success: true, token, message: "Login successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;
