const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendApproverMail } = require("../utils/mailer");

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

    const subject = "📝 New User Registration Awaiting Approval";
    const htmlBody = `
      <p>A new user has registered with the following details:</p>
      <ul>
        <li>Email: <strong>${email}</strong></li>
        <li>Role: ${role}</li>
      </ul>
      <p>Login to approve or reject this user.</p>
    `;
    await sendApproverMail("approver@example.com", subject, htmlBody);

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
    // if (user.role !== "approver" && user.status !== "approved") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account is pending approval. Please wait.",
    //   });
    // }

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

router.post("/bookings/:id/approve", async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.Status = "approved";
    await booking.save();

    // ✅ Optional: mail notification
    if (booking.Email) {
      await sendMail(
        booking.Email,
        "✅ Booking Approved",
        `
        <p>Hello ${booking.BookingName},</p>
        <p>Your booking for <strong>${booking.MeetingRoom}</strong> has been approved.</p>
        <p>Time: ${booking.StartTime} to ${booking.EndTime}</p>
        <p>Thank you!</p>
        `
      );
    }

    res.json({ success: true, message: "Booking approved" });
  } catch (err) {
    console.error("❌ Booking approval error:", err);
    res.status(500).json({ message: "Server error during approval" });
  }
});

// ❌ Reject booking
router.post("/bookings/:id/reject", async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.Status = "rejected";
    await booking.save();

    res.json({ success: true, message: "Booking rejected" });
  } catch (err) {
    console.error("❌ Booking rejection error:", err);
    res.status(500).json({ message: "Server error during rejection" });
  }
});

// ✅ Get all approved bookings
router.get("/bookings", async (req, res) => {
  const statusFilter = req.query.status || "approved";
  try {
    const bookings = await Booking.findAll({ where: { Status: statusFilter } });
    res.json(bookings);
  } catch (err) {
    console.error("❌ Fetch bookings error:", err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
});

// 📥 Get pending bookings
router.get("/bookings/pending", async (req, res) => {
  try {
    const pending = await Booking.findAll({ where: { Status: "pending" } });
    res.json(pending);
  } catch (err) {
    console.error("❌ Pending fetch error:", err);
    res.status(500).json({ message: "Failed to fetch pending bookings" });
  }
});
router.get("/bookings/cancelled", async (req, res) => {
  try {
    const cancelled = await Booking.findAll({
      where: { Status: "cancelled" },
      order: [["StartTime", "DESC"]],
    });
    res.status(200).json(cancelled);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error fetching cancelled bookings" });
  }
});

module.exports = router;
