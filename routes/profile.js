const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

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
