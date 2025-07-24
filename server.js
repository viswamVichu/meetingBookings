// const express = require("express");
// const cors = require("cors");
// const bookingRoutes = require("./routes/bookingRoutes");
// const sequelize = require("./db");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// // Middleware
// app.use(
//   cors({
//     origin: "https://meeting-bookings-frontend-aip9.vercel.app",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
// app.use(express.json());

// // Routes
// app.use("/api/bookings", bookingRoutes);

// // DB connection + model sync
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("✅ Database connected.");

//     return sequelize.sync({ alter: true }); // ensures model is in sync with DB
//   })
//   .then(() => {
//     console.log("✅ Models synced.");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect/sync DB:", err);
//   });
const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Setup for both frontend URLs
// ✅ CORS setup first
const allowedOrigins = [
  "http://localhost:5173",
  "https://meeting-bookings-frontend.vercel.app/",
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
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ Added PATCH
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Preflight handler

// ✅ Incoming logs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ✅ JSON body parsing
app.use(express.json());

// ✅ Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api", authRoutes);
// ✅ DB Connect + Sync
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected.");
    return sequelize.sync({ alter: true });
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
