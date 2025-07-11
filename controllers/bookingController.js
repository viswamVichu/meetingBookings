const { Op } = require("sequelize");
const Booking = require("../models/bookingModel");
const { sendApproverMail } = require("../utils/mailer");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      BookingName,
      ProjectName,
      ProgramTitle,
      Participants,
      EventInCharge,
      InChargeEmail,
      ApproverEmail,
      MeetingRoom,
      StartTime,
      EndTime,
      AudioVisual,
      VideoConf,
      Catering,
    } = req.body;

    console.log("Incoming booking request:", req.body);

    if (!StartTime || !EndTime || !MeetingRoom || !BookingName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      where: {
        MeetingRoom,
        StartTime: { [Op.lt]: new Date(EndTime) },
        EndTime: { [Op.gt]: new Date(StartTime) },
      },
    });

    if (overlapping) {
      return res
        .status(409)
        .json({ error: "Room already booked at this time." });
    }

    // Create new booking
    const newBooking = await Booking.create({
      BookingName,
      ProjectName,
      ProgramTitle,
      Participants,
      EventInCharge,
      InChargeEmail,
      ApproverEmail,
      MeetingRoom,
      StartTime: new Date(StartTime),
      EndTime: new Date(EndTime),
      AudioVisual: Boolean(AudioVisual),
      VideoConf: Boolean(VideoConf),
      Catering: Boolean(Catering),
      Status: "pending",
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get all bookings
const getBookings = async (req, res) => {
  try {
    // Allow filtering by status: /api/bookings?status=approved
    const where = {};
    if (req.query.status) {
      where.Status = req.query.status;
    }
    const bookings = await Booking.findAll({ where });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve booking
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.Status !== "pending") {
      return res.status(400).json({ error: "Booking is not pending" });
    }

    booking.Status = "approved";
    await booking.save();

    if (booking.InChargeEmail) {
      try {
        await sendApproverMail(
          booking.InChargeEmail,
          "Booking Approved",
          `Your booking "${booking.BookingName}" has been approved.`
        );
      } catch (mailErr) {
        console.error("Error sending approval email:", mailErr);
      }
    }

    res.json({ message: "Booking approved" });
  } catch (error) {
    console.error("Approve Booking Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject booking
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.Status !== "pending") {
      return res.status(400).json({ error: "Booking is not pending" });
    }

    booking.Status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected" });
  } catch (error) {
    console.error("Reject Booking Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get only pending bookings
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { Status: "pending" } });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get Pending Bookings Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getBookings,
  approveBooking,
  rejectBooking,
  getPendingBookings,
};
