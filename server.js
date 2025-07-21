const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const sequelize = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://meeting-bookings-frontend-aip9.vercel.app", // Vercel prod
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/bookings", bookingRoutes);

// DB connection + model sync
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected.");

    return sequelize.sync({ alter: true }); // ensures model is in sync with DB
  })
  .then(() => {
    console.log("✅ Models synced.");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect/sync DB:", err);
  });
