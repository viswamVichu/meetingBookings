const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./db");
const { sendApproverMail } = require("./utils/mailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Test Mail Route
app.get("/api/test-mail", async (req, res) => {
  try {
    await sendApproverMail(
      "viswam733@gmail.com", // 👈 your own mail, for testing
      "📬 Test Mail from Meeting System",
      "testuser@example.com"
    );
    res.send("✅ Mail sent successfully to viswam733@gmail.com");
    console.log(sendApproverMail);
  } catch (err) {
    console.error("❌ Test mail failed:", err.message);
    res.status(500).send("Mail sending error");
  }
});

// ✅ Clean CORS Setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://meeting-bookings-frontend.vercel.app", // ✅ No trailing slash
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("⛔ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ✅ Mount Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api", authRoutes);

// ✅ Connect to DB
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected.");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Models synced.");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
