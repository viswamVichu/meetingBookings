const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const sequelize = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
app.use(
  cors({
    origin: "https://meeting-bookings-frontend-aip9.vercel.app",
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
