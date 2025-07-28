const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://meeting-bookings-frontend.vercel.app",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors({ origin: true, credentials: true }));
app.options("*", cors(corsOptions));
app.use(express.json());

// ✅ Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api", authRoutes);

// ✅ Database Init
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected.");
    return sequelize.sync();
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
