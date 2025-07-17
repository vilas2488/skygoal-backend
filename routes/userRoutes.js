const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const jwtAuthMiddleware = require("../middleware/authMiddleware"); 

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  const user = await User.findOne({ userId: req.user.userId });
  res.json(user);
});

router.put("/password", auth, async (req, res) => {
  const { password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.updateOne({ userId: req.user.userId }, { password: hash });
  res.json({ message: "Password updated" });
});


router.put("/update-password", jwtAuthMiddleware, async (req, res) => {
  const userId = req.user.userId; // comes from token
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password too short" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { userId }, // match by userId field
      { password: hashedPassword }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
