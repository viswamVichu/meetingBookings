const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { sendMail } = require("../utils/mailer"); // Optional mailer

// 🆕 Create booking + send email notification
router.post("/", bookingController.createBooking);

// 📦 Get all bookings (can filter with query params)
router.get("/", bookingController.getBookings);

// ⏳ Get all pending bookings
router.get("/pending", bookingController.getPendingBookings);

// ✅ Approve a booking (updates Status to 'approved')
router.post("/:id/approve", bookingController.approveBooking);

// ❌ Reject a booking (updates Status to 'rejected')
router.post("/:id/reject", bookingController.rejectBooking);

// 🔄 Manually update status (or any field) for booking
router.patch("/:id", bookingController.updateBookingStatus);

module.exports = router;
