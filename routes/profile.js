const express = require("express");
const cors = require("cors");
const router = express.Router();
const profileController = require("../controllers/profileController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourdomain.com",
    // Tambahkan domain lain yang diizinkan
  ],
  credentials: true, // Jika menggunakan cookies/session
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

// Apply CORS to all routes in this router
router.use(cors(corsOptions));

// Profile routes
router.put(
  "/profile/complete",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  profileController.completeProfile
);

router.get(
  "/profile",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  profileController.getProfile
);

router.patch(
  "/profile",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  profileController.updateProfile
);

router.get(
  "/profile/:userId",
  authenticateToken,
  authorizeRoles(["admin"]),
  profileController.getUserProfile
);

module.exports = router;
