const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  renderHtmlTemplate,
  generatePdfFromHtml,
} = require("../utils/pdfGenerator"); // Import the new utility

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Error: File upload only supports images (jpeg/jpg/png), PDFs, and Office documents (doc/docx/xls/xlsx)."
        )
      );
    }
  },
});

// Helper function for checking and inserting document
const checkAndInsertDocument = async (
  user_id,
  document_type,
  id_pengajuan,
  fileName,
  filePath,
  fileSize,
  mimeType,
  originalName,
  res
) => {
  let checkQuery;
  let queryParams;

  if (id_pengajuan !== null) {
    checkQuery =
      "SELECT id FROM documents WHERE user_id = ? AND document_type = ? AND id_pengajuan = ?";
    queryParams = [user_id, document_type, id_pengajuan];
  } else {
    checkQuery =
      "SELECT id FROM documents WHERE user_id = ? AND document_type = ? AND id_pengajuan IS NULL";
    queryParams = [user_id, document_type];
  }

  try {
    const [checkResults] = await db.query(checkQuery, queryParams);

    if (checkResults.length > 0) {
      // If a file was uploaded but a duplicate exists, delete the new file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      let duplicateMessage =
        "Document of this type already exists for this user.";
      if (id_pengajuan !== null) {
        duplicateMessage += " (within this 'Pengajuan')";
      } else {
        duplicateMessage += " (not linked to a 'Pengajuan')";
      }
      return res.status(400).json({
        message:
          duplicateMessage +
          ". Please delete the existing document first if you want to replace it.",
      });
    }

    const insertQuery =
      "INSERT INTO documents (user_id, id_pengajuan, file_name, file_path, file_size, mime_type, original_name, document_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    const [insertResult] = await db.query(insertQuery, [
      user_id,
      id_pengajuan,
      fileName,
      filePath,
      fileSize,
      mimeType,
      originalName,
      document_type,
    ]);

    res.status(201).json({
      message: "Dokumen berhasil diupload!",
      documentId: insertResult.insertId,
      fileName: fileName,
      originalName: originalName,
      fileSize: fileSize,
      mimeType: mimeType,
      filePath: filePath,
    });
  } catch (err) {
    // If an error occurs during database insertion, delete the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Database error during document check/insertion:", err);
    return res.status(500).json({
      message:
        "Error saving document info to database. Please try again later.",
      error_details: err.sqlMessage || err.message,
    });
  }
};

// --- EXPORTED CONTROLLER FUNCTIONS ---

exports.uploadDocument = (req, res) => {
  upload.single("document")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ message: "File upload error.", error: err.message });
    } else if (err) {
      console.error("Unknown file upload error:", err);
      return res
        .status(500)
        .json({ message: "File upload failed.", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { user_id, document_type, id_pengajuan } = req.body;
    const fileName = req.file.filename;
    const filePath = req.file.path;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;

    if (!user_id || !document_type) {
      // Only unlink if file exists and parameters are missing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res
        .status(400)
        .json({ message: "User ID and Document Type are required." });
    }

    try {
      if (id_pengajuan) {
        const checkPengajuanQuery =
          "SELECT id_pengajuan, status FROM tabel_pengajuan WHERE id_pengajuan = ?";
        const [pengajuanResults] = await db.query(checkPengajuanQuery, [
          id_pengajuan,
        ]);

        if (pengajuanResults.length === 0) {
          if (fs.existsSync(filePath)) {
            // Ensure file is deleted on invalid pengajuan
            fs.unlinkSync(filePath);
          }
          return res
            .status(400)
            .json({ message: "Invalid 'Pengajuan' ID provided." });
        }
        if (pengajuanResults[0].status !== "active") {
          if (fs.existsSync(filePath)) {
            // Ensure file is deleted on inactive pengajuan
            fs.unlinkSync(filePath);
          }
          return res
            .status(400)
            .json({ message: "This pengajuan is no longer active." });
        }
      }

      await checkAndInsertDocument(
        parseInt(user_id), // Ensure user_id is integer
        document_type,
        id_pengajuan ? parseInt(id_pengajuan) : null, // Ensure id_pengajuan is integer or null
        fileName,
        filePath,
        fileSize,
        mimeType,
        originalName,
        res
      );
    } catch (dbError) {
      if (fs.existsSync(filePath)) {
        // Ensure file is deleted on any dbError
        fs.unlinkSync(filePath);
      }
      console.error("Database error during upload or validation:", dbError);
      return res.status(500).json({
        message: "Error processing document upload. Please try again later.",
        error_details: dbError.sqlMessage || dbError.message,
      });
    }
  });
};

exports.getAllPengajuan = async (req, res) => {
  const query = `
    SELECT
      tp.id_pengajuan,
      tp.nama_pengajuan,
      tp.description,
      tp.status,
      tp.created_at,
      COUNT(d.id) as document_count,
      COUNT(DISTINCT d.user_id) as user_count,
      SUM(CASE WHEN d.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN d.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN d.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
    FROM tabel_pengajuan tp
    LEFT JOIN documents d ON tp.id_pengajuan = d.id_pengajuan
    WHERE tp.status = 'active'
    GROUP BY tp.id_pengajuan, tp.nama_pengajuan, tp.description, tp.status, tp.created_at
    ORDER BY tp.id_pengajuan ASC
  `;

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching pengajuan types:", err);
    return res
      .status(500)
      .json({ message: "Error fetching pengajuan types.", error: err.message });
  }
};

exports.getDocumentsByPengajuanId = async (req, res) => {
  const pengajuanId = req.params.id_pengajuan;

  if (!pengajuanId) {
    return res.status(400).json({ message: "Pengajuan ID is required." });
  }

  const query = `
    SELECT
      d.id,
      d.user_id,
      u.username,
      u.email,
      d.id_pengajuan,
      tp.nama_pengajuan,
      d.file_name,
      d.file_path,
      d.file_size,
      d.mime_type,
      d.original_name,
      d.document_type,
      d.status,
      d.admin_notes,
      d.is_complete,
      d.uploaded_at,
      d.updated_at
    FROM documents d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN tabel_pengajuan tp ON d.id_pengajuan = tp.id_pengajuan -- Use LEFT JOIN here
    WHERE d.id_pengajuan = ?
    ORDER BY d.uploaded_at DESC
  `;

  try {
    const [results] = await db.query(query, [pengajuanId]);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching documents by pengajuan ID:", err);
    return res.status(500).json({
      message: "Error fetching documents for this pengajuan.",
      error: err.message,
    });
  }
};

exports.getUserDocuments = async (req, res) => {
  const userId = req.params.userId;
  const pengajuanId = req.query.id_pengajuan;

  // Security check: A user should only be able to retrieve their own documents
  // unless they are an admin.
  if (req.user.id !== parseInt(userId) && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only access your own documents." });
  }

  let query = `
    SELECT
      d.id,
      d.user_id,
      d.id_pengajuan,
      tp.nama_pengajuan,
      d.file_name,
      d.file_path,
      d.file_size,
      d.mime_type,
      d.original_name,
      d.document_type,
      d.status,
      d.admin_notes,
      d.is_complete,
      d.uploaded_at,
      d.updated_at
    FROM documents d
    LEFT JOIN tabel_pengajuan tp ON d.id_pengajuan = tp.id_pengajuan
    WHERE d.user_id = ?
  `;
  const queryParams = [userId];

  if (pengajuanId) {
    query += ` AND d.id_pengajuan = ?`;
    queryParams.push(pengajuanId);
  }

  query += ` ORDER BY d.uploaded_at DESC`;

  try {
    const [results] = await db.query(query, queryParams);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching user documents:", err);
    return res
      .status(500)
      .json({ message: "Error fetching user documents.", error: err.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  const query = `
    SELECT * FROM v_documents_with_details
    ORDER BY username, uploaded_at DESC
  `;

  try {
    const [results] = await db.query(query);

    const documentsByUser = results.reduce((acc, doc) => {
      const userId = doc.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: doc.username,
          email: doc.email,
          documents: [],
        };
      }
      const { username, email, user_id, ...docWithoutUserInfo } = doc;
      acc[userId].documents.push(docWithoutUserInfo);
      return acc;
    }, {});

    const responseArray = Object.values(documentsByUser);
    res.json(responseArray);
  } catch (err) {
    console.error("Database error fetching all documents:", err);
    return res
      .status(500)
      .json({ message: "Error fetching all documents.", error: err.message });
  }
};
exports.getAllDocumentsSurat = async (req, res) => {
  const query = `
    SELECT 
      sp.*,
      u.username as user_username,
      a.username as approved_by_username,
      tp.nama_pengajuan
    FROM surat_pengantar sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN users a ON sp.approved_by = a.id
    JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    ORDER BY sp.created_at DESC
  `;

  try {
    const [results] = await db.query(query);

    const formattedResults = results.map((row) => ({
      ...row,
      is_downloaded: Boolean(row.is_downloaded),
      generated_at: row.generated_at
        ? new Date(row.generated_at).toISOString()
        : null,
      expires_at: row.expires_at
        ? new Date(row.expires_at).toISOString()
        : null,
      created_at: row.created_at
        ? new Date(row.created_at).toISOString()
        : null,
      updated_at: row.updated_at
        ? new Date(row.updated_at).toISOString()
        : null,
      approved_by_username: row.approved_by_username || null,
    }));
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all surat pengantar",
      data: formattedResults,
      count: formattedResults.length,
    });
  } catch (err) {
    console.error("Database error fetching all surat_pengantar:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching all surat pengantar",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  const documentId = req.params.id;
  const { status, admin_notes, is_complete, id_pengajuan } = req.body;

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Valid status is required (pending, approved, rejected).",
    });
  }

  let updateFields =
    "`status` = ?, `admin_notes` = ?, `is_complete` = ?, `updated_at` = CURRENT_TIMESTAMP";
  let queryParams = [status, admin_notes, is_complete];

  try {
    if (id_pengajuan !== undefined && id_pengajuan !== null) {
      const checkPengajuanQuery =
        "SELECT id_pengajuan, status FROM tabel_pengajuan WHERE id_pengajuan = ?";
      const [pengajuanResults] = await db.query(checkPengajuanQuery, [
        id_pengajuan,
      ]);

      if (pengajuanResults.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid 'Pengajuan' ID provided for update." });
      }
      if (pengajuanResults[0].status !== "active") {
        return res
          .status(400)
          .json({ message: "Cannot update document for inactive pengajuan." });
      }
      updateFields += ", `id_pengajuan` = ?";
      queryParams.push(id_pengajuan);
    }
    queryParams.push(documentId);

    const query = `UPDATE documents SET ${updateFields} WHERE id = ?`;
    const [result] = await db.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Document not found." });
    }
    res.json({ message: "Document status updated successfully!" });
  } catch (err) {
    console.error("Database error updating document status:", err);
    return res
      .status(500)
      .json({ message: "Error updating document status.", error: err.message });
  }
};

exports.getDocumentById = async (req, res) => {
  const documentId = req.params.id;
  const query = `SELECT * FROM v_documents_with_details WHERE id = ?`;

  try {
    const [results] = await db.query(query, [documentId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Database error fetching document by ID:", err);
    return res
      .status(500)
      .json({ message: "Error fetching document.", error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user ? req.user.id : null;

  if (!documentId) {
    return res.status(400).json({ message: "Document ID is required." });
  }

  try {
    const getDocQuery = "SELECT * FROM documents WHERE id = ?";
    const [results] = await db.query(getDocQuery, [documentId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const document = results[0];

    // Security check: A user can only delete their own document
    // unless they are an admin.
    if (
      userId &&
      document.user_id !== userId &&
      (!req.user || req.user.role !== "admin")
    ) {
      return res.status(403).json({
        message: "You don't have permission to delete this document.",
      });
    }

    const filePath = document.file_path;
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      } catch (fileErr) {
        console.error(`Error deleting file: ${fileErr.message}`);
      }
    }

    const deleteQuery = "DELETE FROM documents WHERE id = ?";
    const [result] = await db.query(deleteQuery, [documentId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Document not found in database." });
    }

    res.json({
      message: "Document deleted successfully!",
      deletedDocumentId: documentId,
    });
  } catch (err) {
    console.error("Database error deleting document:", err);
    return res.status(500).json({
      message: "Error deleting document from database.",
      error: err.message,
    });
  }
};

exports.getPengajuanStats = async (req, res) => {
  const query = "SELECT * FROM v_pengajuan_stats ORDER BY id_pengajuan";

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching pengajuan stats:", err);
    return res.status(500).json({
      message: "Error fetching pengajuan statistics.",
      error: err.message,
    });
  }
};

exports.bulkDeleteDocuments = async (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return res.status(400).json({ message: "Document IDs array is required." });
  }

  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can perform bulk delete." });
  }

  try {
    const placeholders = documentIds.map(() => "?").join(",");
    const getDocsQuery = `SELECT file_path FROM documents WHERE id IN (${placeholders})`;
    const [results] = await db.query(getDocsQuery, documentIds);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents found with the provided IDs." });
    }

    const deletedFiles = [];
    const failedFiles = [];

    results.forEach((doc) => {
      const filePath = doc.file_path;
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(filePath);
        } catch (fileErr) {
          console.error(`Error deleting file ${filePath}: ${fileErr.message}`);
          failedFiles.push(filePath);
        }
      }
    });

    const deleteQuery = `DELETE FROM documents WHERE id IN (${placeholders})`;
    const [result] = await db.query(deleteQuery, documentIds);

    res.json({
      message: `Successfully deleted ${result.affectedRows} documents.`,
      deletedCount: result.affectedRows,
      deletedFilesCount: deletedFiles.length,
      failedFilesCount: failedFiles.length,
      details: {
        deletedFilePaths: deletedFiles,
        failedFilePaths: failedFiles,
      },
    });
  } catch (err) {
    console.error("Database error performing bulk delete:", err);
    return res.status(500).json({
      message: "Error deleting documents from database.",
      error: err.message,
    });
  }
};

exports.deleteUserDocuments = async (userId, callback) => {
  try {
    const getDocsQuery = "SELECT file_path FROM documents WHERE user_id = ?";
    const [results] = await db.query(getDocsQuery, [userId]);

    const filePaths = results.map((doc) => doc.file_path);
    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`File deleted: ${filePath}`);
        } catch (fileErr) {
          console.error(`Error deleting file ${filePath}: ${fileErr.message}`);
        }
      }
    });

    const deleteQuery = "DELETE FROM documents WHERE user_id = ?";
    const [result] = await db.query(deleteQuery, [userId]);
    callback(null, result);
  } catch (err) {
    console.error("Database error deleting user documents:", err);
    callback(err);
  }
};

exports.generateSuratPengantar = async (req, res) => {
  const {
    user_id,
    id_pengajuan,
    letter_number,
    letter_content,
    approved_by,
    kelengkapan_data_id,
  } = req.body;

  if (
    !user_id ||
    !id_pengajuan ||
    !letter_number ||
    !letter_content ||
    !approved_by
  ) {
    return res.status(400).json({
      message:
        "All fields (user_id, id_pengajuan, letter_number, letter_content, approved_by) are required.",
    });
  }

  let userInfo, pengajuanInfo, approvedByInfo, kelengkapanData;
  try {
    const [userResults] = await db.query(
      "SELECT id, username, email, phone, address, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, kewarganegaraan, no_ktp_sktld, alamat_lengkap, pekerjaan FROM users WHERE id = ?",
      [user_id]
    );
    userInfo = userResults;
    const [pengajuanResults] = await db.query(
      "SELECT nama_pengajuan FROM tabel_pengajuan WHERE id_pengajuan = ?",
      [id_pengajuan]
    );
    pengajuanInfo = pengajuanResults;
    const [approvedResults] = await db.query(
      "SELECT username FROM users WHERE id = ?",
      [approved_by]
    );
    approvedByInfo = approvedResults;
    console.log(
      `Fetching kelengkapan data for user_id: ${user_id}, kelengkapan_data_id: ${kelengkapan_data_id}`
    );

    if (kelengkapan_data_id) {
      console.log("Using specific kelengkapan_data_id");
      const [kelengkapanResults] = await db.query(
        "SELECT id, rt, rw, no_surat_pengantar, tanggal_surat_pengantar, nama_lengkap, luas_lahan, alamat_lahan, created_at FROM kelengkapan_data WHERE id = ? AND user_id = ?",
        [kelengkapan_data_id, user_id]
      );
      kelengkapanData = kelengkapanResults;
      console.log("Kelengkapan data by ID:", kelengkapanData);
    } else {
      console.log("Fetching latest kelengkapan data for user");
      const [kelengkapanResults] = await db.query(
        "SELECT id, rt, rw, no_surat_pengantar, tanggal_surat_pengantar, nama_lengkap, luas_lahan, alamat_lahan, created_at FROM kelengkapan_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [user_id]
      );
      kelengkapanData = kelengkapanResults;
      console.log("Latest kelengkapan data:", kelengkapanData);
    }
    if (kelengkapanData.length === 0) {
      console.warn(`No kelengkapan_data found for user_id: ${user_id}`);
      return res.status(400).json({
        message:
          "Data kelengkapan tidak ditemukan untuk user ini. Silakan lengkapi data kelengkapan terlebih dahulu.",
      });
    }
    if (userInfo.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    if (pengajuanInfo.length === 0) {
      return res.status(400).json({ message: "Pengajuan not found." });
    }

    if (approvedByInfo.length === 0) {
      return res.status(400).json({ message: "Approver not found." });
    }
  } catch (dbErr) {
    console.error(
      "Database error fetching user/pengajuan/approver/kelengkapan info:",
      dbErr
    );
    return res.status(500).json({
      message: "Error fetching related data for surat generation.",
      error_details: dbErr.sqlMessage || dbErr.message,
    });
  }

  const user = userInfo[0];
  const pengajuan = pengajuanInfo[0];
  const approver = approvedByInfo[0];
  const kelengkapan = kelengkapanData[0];

  let templateFileName = "suratPengantar.html";
  if (
    pengajuan.nama_pengajuan ===
    "Standar Pelayanan Pemberian Surat Keterangan Peningkatan Hak atas tanah"
  ) {
    templateFileName = "suratPengantar.html";
  }
  if (
    pengajuan.nama_pengajuan ===
    "Standar Pelayanan Pencatatan Surat Pernyataan Ahli Waris WNI"
  ) {
    templateFileName = "PeningkatanHak.html";
  } else if (
    pengajuan.nama_pengajuan ===
    "Standar Pelayanan Kelengkapan Administrasi Permohonan Rekomendasi Hak Atas Tanah Eks Kota Praja"
  ) {
    templateFileName = "ExKotaPraja.html";
  }

  let suratTemplate;
  try {
    suratTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/", templateFileName),
      "utf8"
    );
  } catch (readErr) {
    console.error(
      `Error reading surat pengantar template (${templateFileName}):`,
      readErr
    );
    return res.status(500).json({
      message: `Failed to load surat template: ${templateFileName}.`,
      error_details: readErr.message,
    });
  }
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      return new Date(dateValue).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "";
    }
  };

  const dataForTemplate = {
    letter_number: letter_number,
    recipient_nama_lengkap: user.nama_lengkap || "",
    recipient_username: user.username || "",
    recipient_email: user.email || "",
    recipient_phone: user.phone || "",
    recipient_address: user.address || "",
    recipient_tempat_lahir: user.tempat_lahir || "",
    recipient_tanggal_lahir: formatDate(user.tanggal_lahir),
    recipient_jenis_kelamin: user.jenis_kelamin || "",
    recipient_agama: user.agama || "",
    recipient_kewarganegaraan: user.kewarganegaraan || "",
    recipient_no_ktp_sktld: user.no_ktp_sktld || "",
    recipient_alamat_lengkap: user.alamat_lengkap || "",
    recipient_pekerjaan: user.pekerjaan || "",
    nama_pengajuan: pengajuan.nama_pengajuan || "",
    kelengkapan_rt: kelengkapan.rt || "",
    kelengkapan_rw: kelengkapan.rw || "",
    kelengkapan_no_surat_pengantar: kelengkapan.no_surat_pengantar || "",
    kelengkapan_tanggal_surat_pengantar: formatDate(
      kelengkapan.tanggal_surat_pengantar
    ),
    kelengkapan_nama_lengkap:
      kelengkapan.nama_lengkap || user.nama_lengkap || "",
    kelengkapan_luas_lahan: kelengkapan.luas_lahan || "",
    kelengkapan_alamat_lahan: kelengkapan.alamat_lahan || "",
    main_letter_body: letter_content,
    issue_date: formatDate(new Date()),
    approver_name: approver.username || "",
  };

  console.log("Template data being passed:", {
    kelengkapan_rt: dataForTemplate.kelengkapan_rt,
    kelengkapan_rw: dataForTemplate.kelengkapan_rw,
    kelengkapan_no_surat_pengantar:
      dataForTemplate.kelengkapan_no_surat_pengantar,
    kelengkapan_nama_lengkap: dataForTemplate.kelengkapan_nama_lengkap,
    kelengkapan_found: true,
  });

  const renderedHtml = renderHtmlTemplate(suratTemplate, dataForTemplate);
  const fileName = `surat_pengantar_${user_id}_${id_pengajuan}_${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  try {
    await generatePdfFromHtml(renderedHtml, filePath);
    const actualKelengkapanId = kelengkapan.id;
    const insertQuery = `
    INSERT INTO surat_pengantar
    (user_id, id_pengajuan, kelengkapan_data_id, letter_number, letter_path, letter_content, approved_by, status, created_at, original_file_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'generated', NOW(), ?)
  `;
    const insertValues = [
      user_id,
      id_pengajuan,
      actualKelengkapanId,
      letter_number,
      filePath,
      letter_content,
      approved_by,
      fileName,
    ];
    const [result] = await db.query(insertQuery, insertValues);
    res.status(201).json({
      message: "Surat pengantar generated and saved successfully!",
      suratId: result.insertId,
      letter_path: filePath,
      file_name: fileName,
      kelengkapan_data_found: true,
      kelengkapan_data_id: actualKelengkapanId,
      kelengkapan_data_used: kelengkapan,
    });
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Error during PDF generation or database insertion:", err);
    return res.status(500).json({
      message: "Error generating and saving surat pengantar.",
      error_details: err.message || "PDF generation or database error.",
    });
  }
};
exports.getSuratPengantarById = async (req, res) => {
  const suratId = req.params.id;
  const query = `
    SELECT sp.*, u.username as user_username, a.username as approved_by_username, tp.nama_pengajuan
    FROM surat_pengantar sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN users a ON sp.approved_by = a.id
    JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    WHERE sp.id = ?
  `;

  try {
    const [results] = await db.query(query, [suratId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Database error fetching surat_pengantar by ID:", err);
    return res
      .status(500)
      .json({ message: "Error fetching surat pengantar.", error: err.message });
  }
};

exports.getAllSuratPengantar = async (req, res) => {
  const query = `
    SELECT 
      sp.*,
      u.username as user_username,
      a.username as approved_by_username,
      tp.nama_pengajuan
    FROM surat_pengantar sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN users a ON sp.approved_by = a.id
    JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    ORDER BY sp.created_at DESC
  `;

  try {
    const [results] = await db.query(query);

    // Transform results to handle potential null values and format data
    const formattedResults = results.map((row) => ({
      ...row,
      // Ensure boolean fields are properly formatted
      is_downloaded: Boolean(row.is_downloaded),
      // Format dates if needed
      generated_at: row.generated_at
        ? new Date(row.generated_at).toISOString()
        : null,
      expires_at: row.expires_at
        ? new Date(row.expires_at).toISOString()
        : null,
      created_at: row.created_at
        ? new Date(row.created_at).toISOString()
        : null,
      updated_at: row.updated_at
        ? new Date(row.updated_at).toISOString()
        : null,
      // Handle null approved_by_username
      approved_by_username: row.approved_by_username || null,
    }));

    res.status(200).json({
      success: true,
      message: "Successfully retrieved all surat pengantar",
      data: formattedResults,
      count: formattedResults.length,
    });
  } catch (err) {
    console.error("Database error fetching all surat_pengantar:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching all surat pengantar",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

exports.updateSuratPengantarStatus = async (req, res) => {
  const suratId = req.params.id;
  const { status } = req.body;

  if (!status || !["generated", "downloaded", "expired"].includes(status)) {
    return res.status(400).json({
      message: "Valid status is required (generated, downloaded, expired).",
    });
  }

  let updateQuery =
    "UPDATE surat_pengantar SET status = ?, updated_at = CURRENT_TIMESTAMP";
  const queryParams = [status];

  if (status === "downloaded") {
    updateQuery +=
      ", is_downloaded = TRUE, download_count = COALESCE(download_count, 0) + 1"; // Ensure download_count is not null
  }

  updateQuery += " WHERE id = ?";
  queryParams.push(suratId);

  try {
    const [result] = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }
    res.json({ message: "Surat pengantar status updated successfully!" });
  } catch (err) {
    console.error("Database error updating surat_pengantar status:", err);
    return res.status(500).json({
      message: "Error updating surat pengantar status.",
      error: err.message,
    });
  }
};

exports.deleteSuratPengantar = async (req, res) => {
  const suratId = req.params.id;
  const userId = req.user ? req.user.id : null; // Get authenticated user ID

  try {
    const getSuratQuery =
      "SELECT letter_path, user_id FROM surat_pengantar WHERE id = ?";
    const [results] = await db.query(getSuratQuery, [suratId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }

    const surat = results[0];

    // Security check: Only the owner of the surat or an admin can delete it.
    if (
      userId && // Check if userId exists (user is authenticated)
      surat.user_id !== userId && // User is not the owner of the surat
      (!req.user || req.user.role !== "admin") // User is not an admin
    ) {
      return res.status(403).json({
        message: "You don't have permission to delete this surat pengantar.",
      });
    }

    const filePath = surat.letter_path;
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      } catch (fileErr) {
        console.error(`Error deleting file: ${fileErr.message}`);
      }
    }

    const deleteQuery = "DELETE FROM surat_pengantar WHERE id = ?";
    const [result] = await db.query(deleteQuery, [suratId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Surat pengantar not found in database." });
    }
    res.json({
      message: "Surat pengantar deleted successfully!",
      deletedSuratId: suratId,
    });
  } catch (err) {
    console.error("Database error deleting surat_pengantar:", err);
    return res.status(500).json({
      message: "Error deleting surat pengantar from database.",
      error: err.message,
    });
  }
};

exports.downloadSurat = (req, res) => {
  const suratId = req.params.id;
  const userId = req.user ? req.user.id : null; // Assuming req.user is populated by authentication middleware

  db.query(
    "SELECT letter_path, original_file_name, user_id FROM surat_pengantar WHERE id = ?", // Select user_id as well
    [suratId]
  )
    .then(async ([results]) => {
      if (results.length === 0) {
        return res.status(404).json({ message: "Surat not found." });
      }

      const surat = results[0];
      const filePath = surat.letter_path;
      const originalFileName =
        surat.original_file_name ||
        `surat_pengantar_${suratId}_${Date.now()}.pdf`;

      if (
        userId &&
        surat.user_id !== userId &&
        (!req.user || req.user.role !== "admin")
      ) {
        return res.status(403).json({
          message: "You don't have permission to download this surat.",
        });
      }

      if (fs.existsSync(filePath)) {
        try {
          const updateQuery =
            "UPDATE surat_pengantar SET status = 'downloaded', download_count = COALESCE(download_count, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
          await db.query(updateQuery, [suratId]);
        } catch (updateErr) {
          console.warn(
            "Could not update download count/status for surat:",
            updateErr.message
          );
        }

        res.download(filePath, originalFileName, (downloadErr) => {
          if (downloadErr) {
            console.error("Error downloading surat:", downloadErr);
            if (!res.headersSent) {
              res
                .status(500)
                .json({ message: "Error initiating file download." });
            }
          }
        });
      } else {
        res.status(404).json({ message: "File not found on server." });
      }
    })
    .catch((err) => {
      console.error("Database error fetching surat path for download:", err);
      return res
        .status(500)
        .json({ message: "Error fetching surat for download." });
    });
};

exports.getUserSurat = async (req, res) => {
  const userId = req.params.userId;
  // This route is specifically for fetching all surat for a user,
  // without filtering by pengajuanId.
  const query = `
    SELECT sp.*, tp.nama_pengajuan
    FROM surat_pengantar sp
    LEFT JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    WHERE sp.user_id = ?
    ORDER BY sp.created_at DESC
  `;

  try {
    const [results] = await db.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching user surat pengantar:", err);
    return res.status(500).json({
      message: "Error fetching user surat pengantar.",
      error: err.message,
    });
  }
};

exports.getUserSuratByPengajuan = async (req, res) => {
  const { userId, pengajuanId } = req.params;

  if (req.user.id !== parseInt(userId) && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only access your own surat." });
  }

  try {
    const [rows] = await db.query(
      `SELECT sp.*, tp.nama_pengajuan
       FROM surat_pengantar sp
       JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
       WHERE sp.user_id = ? AND sp.id_pengajuan = ?
       ORDER BY sp.created_at DESC`, // Added ordering
      [userId, pengajuanId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching user surat by pengajuan ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching user surat by pengajuan ID." });
  }
};

exports.getAllGeneratedLetters = async (req, res) => {
  try {
    const query = `
      SELECT
          sp.id,
          sp.letter_number,
          sp.letter_path,
          sp.generated_at,
          u.username,
          tp.nama_pengajuan
      FROM
          surat_pengantar sp
      JOIN
          users u ON sp.user_id = u.id
      JOIN
          tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
      ORDER BY
          sp.generated_at DESC
    `;
    const [letters] = await db.query(query);
    res.json(letters);
  } catch (error) {
    console.error("Error fetching all generated letters:", error);
    res.status(500).json({
      message: "Error fetching generated letters",
      error: error.message,
    });
  }
};
