// kelengkapanDataRoutes.js
const express = require("express");
const router = express.Router();
const kelengkapanDataController = require("../controllers/kelengkapanData");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  kelengkapanDataController.getAllKelengkapanData
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  kelengkapanDataController.createKelengkapanData
);

router.get(
  "/user/:userId/latest",
  authenticateToken,
  kelengkapanDataController.getLatestKelengkapanDataByUserId
);

router.get(
  "/user/:userId",
  authenticateToken,
  kelengkapanDataController.getKelengkapanDataByUserId
);

router.delete(
  "/bulk/delete",
  authenticateToken,
  authorizeRoles(["admin"]),
  kelengkapanDataController.bulkDeleteKelengkapanData
);

router.get(
  "/:id",
  authenticateToken,
  kelengkapanDataController.getKelengkapanDataById
);

router.put(
  "/user/:id",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  kelengkapanDataController.updateKelengkapanData
);

// DELETE single kelengkapan data
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  kelengkapanDataController.deleteKelengkapanData
);

module.exports = router;
