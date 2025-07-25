const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendApproverMail } = require("../utils/mailer"); // 👈 added

// 📝 Register route (status = 'pending' + mail to approver)
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await User.create({ email, password, role, status: "pending" });

    // 📩 Notify approver
    await sendApproverMail(
      "approver@example.com", // 🔁 you can pull this dynamically later
      "New Registration Pending Approval",
      email
    );

    res.status(201).json({
      success: true,
      message: "User registered and pending approval",
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔒 Login route (BLOCK if not approved)
// 🔒 Login route (allow approvers to log in even if not approved)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // ✅ Only block non-approvers if not approved
    if (user.role !== "approver" && user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval. Please wait.",
      });
    }

    console.log(user.status);
    res.status(200).json({
      success: true,
      role: user.role,
      status: user.status,
      message: "Login successful",
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Approve user
router.post("/approve-user/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "approved";
    await user.save();

    res.json({ success: true, message: "User approved" });
  } catch (err) {
    console.error("❌ Approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📥 Get all pending users
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.findAll({ where: { status: "pending" } });

    console.log("📋 Fetched pending users:", pendingUsers); // ✅ AFTER definition

    res.status(200).json(pendingUsers);
  } catch (err) {
    console.error("❌ Fetch pending error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
