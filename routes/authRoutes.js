const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await User.create({ email, password, role });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;

// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");

// // 📝 Register new user with status: "pending"
// router.post("/register", async (req, res) => {
//   const { email, password, role } = req.body;

//   try {
//     if (!email || !password || !role) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(409).json({ message: "Email already exists" });
//     }

//     await User.create({ email, password, role, status: "pending" }); // ✅ added status
//     res
//       .status(201)
//       .json({ success: true, message: "User registered and pending approval" });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🔐 Login allowed only if approved
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (user.password !== password) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid password" });
//     }

//     if (user.status !== "approved") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Your account is pending approval" });
//     }

//     res.json({ success: true, role: user.role });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🛂 Approver route to approve user
// router.post("/approve-user/:id", async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.status = "approved";
//     await user.save();

//     res.json({ success: true, message: "User approved" });
//   } catch (err) {
//     console.error("Approver error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // 📥 Fetch all users with pending status (optional for approver panel)
// router.get("/pending-users", async (req, res) => {
//   try {
//     const pendingUsers = await User.findAll({ where: { status: "pending" } });
//     res.status(200).json(pendingUsers);
//   } catch (err) {
//     console.error("Pending users fetch error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
