const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  await User.create({ email, password, role });
  res
    .status(201)
    .json({ success: true, message: "User registered successfully" });
});

module.exports = router;
