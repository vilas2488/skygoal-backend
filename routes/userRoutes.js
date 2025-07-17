const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");

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

module.exports = router;
