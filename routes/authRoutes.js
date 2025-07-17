const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOtp = require("../utils/sendOtp");
const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp });
  await sendOtp(email, otp);
  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record) return res.status(400).json({ message: "Invalid OTP" });
  await User.updateOne({ email }, { isVerified: true });
  await Otp.deleteMany({ email });
  res.json({ message: "Email verified" });
});

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, mobile, password } = req.body;
  console.log("Signup request received:", req.body);
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const userId = Date.now().toString();

  await User.create({
    userId,
    firstName,
    lastName,
    email,
    mobile,
    password: hash,
    isVerified: false,
  });

  // ✅ Generate and send OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp });
  await sendOtp(email, otp);

  res.json({ message: "Signup successful. Please verify your email." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res
      .status(403)
      .json({ message: "Too many attempts. Try again later." });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 3) {
      user.lockUntil = new Date(Date.now() + 3 * 60 * 60 * 1000);
    }
    await user.save();
    return res.status(401).json({ message: "Invalid password" });
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET);
  res.json({
    token,
    user: {
      userId: user.userId,
      name: user.firstName,
      email: user.email,
    },
  });
});

module.exports = router;
