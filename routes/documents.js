// documentRoutes.js
const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/pengajuan",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.getAllPengajuan
);

router.post(
  "/upload",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.uploadDocument
);

router.get(
  "/user/:userId",
  authenticateToken,
  documentController.getUserDocuments
);

router.get(
  "/pengajuan/:id_pengajuan",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.getDocumentsByPengajuanId
);

router.delete(
  "/bulk/delete",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.bulkDeleteDocuments
);

router.delete("/:id", authenticateToken, documentController.deleteDocument);

router.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.getAllDocuments
);
router.get(
  "/surat",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.getAllDocumentsSurat
);

router.get("/:id", authenticateToken, documentController.getDocumentById);

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.updateDocumentStatus
);

// Surat
router.post(
  "/generate-surat",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.generateSuratPengantar
);
router.get(
  "/surat/download/:id",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.downloadSurat
);
router.get(
  "/surat/user/:userId",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.getUserSurat
);
// --- TAMBAHKAN ROUTE INI ---
router.get(
  "/surat/user/:userId/pengajuan/:pengajuanId",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.getUserSuratByPengajuan
);

router.get(
  "/surat",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.getAllSuratPengantar
);

router.put(
  "/surat/:id/status",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  documentController.updateSuratPengantarStatus
);

router.delete(
  "/surat/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.deleteSuratPengantar
);
router.get(
  "/letters",
  authenticateToken,
  authorizeRoles(["admin"]),
  documentController.getAllGeneratedLetters
);
module.exports = router;
