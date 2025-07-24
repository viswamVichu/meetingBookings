const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// ✅ Booking routes
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/pending", bookingController.getPendingBookings);
router.post("/:id/approve", bookingController.approveBooking);
router.post("/:id/reject", bookingController.rejectBooking);

// ✅ Updated: Patch route directly calls controller (no async wrapper)
router.patch("/:id", bookingController.updateBookingStatus);

module.exports = router;
