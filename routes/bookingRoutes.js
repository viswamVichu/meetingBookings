const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController"); // Make sure path is correct!

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/pending", bookingController.getPendingBookings);
router.post("/:id/approve", bookingController.approveBooking);
router.post("/:id/reject", bookingController.rejectBooking);

module.exports = router;
