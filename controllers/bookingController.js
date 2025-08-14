const { Op } = require("sequelize");
const Booking = require("../models/bookingModel");
const { sendApproverMail } = require("../utils/mailer");
const validator = require("validator");

// 📝 Create Booking Controller
const createBooking = async (req, res) => {
  try {
    const {
      BookingName,
      ProjectName,
      ProgramName,
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

    // Required field check
    const requiredFields = {
      BookingName,
      ProjectName,
      ProgramName,
      ProgramTitle,
      EventInCharge,
      InChargeEmail,
      ApproverEmail,
      MeetingRoom,
      StartTime,
      EndTime,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // Email validation
    if (
      !validator.isEmail(InChargeEmail) ||
      !validator.isEmail(ApproverEmail)
    ) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Parse and validate time
    const parsedStart = new Date(StartTime);
    const parsedEnd = new Date(EndTime);

    if (
      parsedEnd <= parsedStart ||
      isNaN(parsedStart.getTime()) ||
      isNaN(parsedEnd.getTime())
    ) {
      return res.status(400).json({ error: "Invalid timing" });
    }

    // Parse participants
    const parsedParticipants = parseInt(Participants, 10);
    if (isNaN(parsedParticipants) || parsedParticipants <= 0) {
      return res
        .status(400)
        .json({ error: "Participants must be a positive number" });
    }

    // Overlap check with error capture
    let overlap = null;
    try {
      overlap = await Booking.findOne({
        where: {
          MeetingRoom,
          StartTime: { [Op.lt]: parsedEnd },
          EndTime: { [Op.gt]: parsedStart },
        },
      });
    } catch (queryErr) {
      console.error("❌ Error during overlap check:", queryErr.message);
      return res
        .status(500)
        .json({ error: "DB query error during overlap check" });
    }

    if (overlap) {
      return res
        .status(409)
        .json({ error: "Room already booked at this time" });
    }

    // Booking payload
    const bookingPayload = {
      BookingName,
      ProjectName,
      ProgramName,
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

    // Send email (optional)
    try {
      const subject = "📅 New Meeting Booking Request";
      const htmlBody = `
        <h3>Meeting Request Details</h3>
        <p><strong>Event In-Charge:</strong> ${EventInCharge}<br/>
        <strong>Room:</strong> ${MeetingRoom}<br/>
        <strong>Time:</strong> ${parsedStart} – ${parsedEnd}<br/>
        <strong>Program:</strong> ${ProgramTitle}<br/>
        <strong>Project:</strong> ${ProjectName}</p>
        <strong>Program Name:</strong> ${ProgramName}<br/>

        <p>Please review the request in the meeting portal.</p>
      `;
      await sendApproverMail(ApproverEmail, subject, htmlBody);
    } catch (mailError) {
      console.error("📧 Email send failed:", mailError.message);
    }

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("❌ Booking creation failed:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧠 Get Bookings (with email/status filters)
const getBookings = async (req, res) => {
  try {
    console.log("📍 getBookings triggered");

    const where = {};

    // ✅ Filter by InChargeEmail if email provided
    if (req.query.email) {
      console.log("🔍 Filtering by email:", req.query.email);
      where.InChargeEmail = req.query.email;
    }

    // ✅ Filter by status if provided

    // ✅ Sort by StartTime DESC (latest first)
    const bookings = await Booking.findAll({
      where,
      order: [["StartTime", "DESC"]],
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Get Bookings Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Approve Booking
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

// ❌ Reject Booking
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

// 📌 Get Only Pending Bookings
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { Status: "pending" } });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Get Pending Bookings Error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔄 Update Booking Status (PATCH)
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status || req.body.Status;

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
  updateBookingStatus,
};
