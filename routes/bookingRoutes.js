const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking); // booking + mail
router.get("/", bookingController.getBookings);
router.get("/pending", bookingController.getPendingBookings);
router.post("/:id/approve", bookingController.approveBooking);
router.post("/:id/reject", bookingController.rejectBooking);
router.patch("/:id", bookingController.updateBookingStatus);

module.exports = router;
