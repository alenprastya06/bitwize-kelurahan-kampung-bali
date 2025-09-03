const express = require("express");
const router = express.Router();
const generatedDocumentController = require("../controllers/generatedDocumentController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/me",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  generatedDocumentController.getMyGeneratedDocuments.bind(generatedDocumentController)
);

module.exports = router;