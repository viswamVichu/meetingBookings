const { Op } = require("sequelize");
const Booking = require("../models/bookingModel");
const { sendApproverMail } = require("../utils/mailer");
const validator = require("validator");
const createBooking = async (req, res) => {
  try {
    console.log("🔍 Inside createBooking controller");
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

    console.log("📦 Incoming data:", req.body);

    // Validate required fields
    for (const [key, value] of Object.entries({
      BookingName,
      ProjectName,
      ProgramTitle,
      EventInCharge,
      InChargeEmail,
      ApproverEmail,
      MeetingRoom,
      StartTime,
      EndTime,
    })) {
      if (!value) {
        return res.status(400).json({ error: `Missing field: ${key}` });
      }
    }

    if (
      !validator.isEmail(InChargeEmail) ||
      !validator.isEmail(ApproverEmail)
    ) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const parsedStart = new Date(StartTime);
    const parsedEnd = new Date(EndTime);
    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (parsedEnd <= parsedStart) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    const overlap = await Booking.findOne({
      where: {
        MeetingRoom,
        StartTime: { [Op.lt]: parsedEnd },
        EndTime: { [Op.gt]: parsedStart },
      },
    });

    if (overlap) {
      return res
        .status(409)
        .json({ error: "Room already booked at this time." });
    }

    const parsedParticipants = parseInt(Participants, 10);
    if (isNaN(parsedParticipants) || parsedParticipants <= 0) {
      return res
        .status(400)
        .json({ error: "Participants must be a positive number" });
    }

    const bookingPayload = {
      BookingName,
      ProjectName,
      ProgramTitle,
      Participants: parsedParticipants,
      EventInCharge,
      InChargeEmail,
      ApproverEmail,
      MeetingRoom,
      StartTime: parsedStart,
      EndTime: parsedEnd,
      AudioVisual,
      VideoConf,
      Catering,
      Status: "pending",
    };

    const newBooking = await Booking.create(bookingPayload);
    console.log("✅ Booking created:", newBooking.id);
    return res.status(201).json(newBooking);
  } catch (error) {
    console.error("❌ Create Booking Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧠 Controller: Get All Bookings
const getBookings = async (req, res) => {
  try {
    console.log("📍 Inside getBookings");
    const where = {};
    if (req.query.status) where.Status = req.query.status;
    const bookings = await Booking.findAll({ where });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Get Bookings Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧠 Controller: Approve Booking
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
        console.error("📧 Mail Error:", mailErr);
      }
    }

    res.json({ message: "Booking approved" });
  } catch (error) {
    console.error("❌ Approve Booking Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧠 Controller: Reject Booking
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
    console.error("❌ Reject Booking Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧠 Controller: Get Pending Bookings
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { Status: "pending" } });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Get Pending Bookings Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};
// 🛠️ Controller: Update Booking Status (for PATCH requests)
// 🛠️ Controller: PATCH Booking Status
// 🛠️ Controller: PATCH Booking Status
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status || req.body.Status; // ✅ Handle both keys

  console.log(`🔄 Booking PATCH for ID: ${id} → Status: ${status}`);

  if (!status) {
    return res.status(400).json({ error: "Missing booking status" });
  }

  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.Status = status;
    await booking.save();

    res.status(200).json({
      message: `Booking status updated to '${status}'`,
      booking,
    });
  } catch (error) {
    console.error("❌ Update Status Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getBookings,
  approveBooking,
  rejectBooking,
  getPendingBookings,
  updateBookingStatus, // ✅ add this line
};
