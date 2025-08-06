const db = require("./config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  limits: { fileSize: 10 * 1024 * 1024 },
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

// Enhanced upload document function
exports.uploadDocument = (req, res) => {
  upload.single("document")(req, res, (err) => {
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
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "User ID and Document Type are required." });
    }

    // Validate pengajuan ID if provided
    if (id_pengajuan) {
      const checkPengajuanQuery =
        "SELECT id_pengajuan, status FROM tabel_pengajuan WHERE id_pengajuan = ?";
      db.query(checkPengajuanQuery, [id_pengajuan], (err, results) => {
        if (err) {
          fs.unlinkSync(filePath);
          console.error("Database error checking id_pengajuan:", err);
          return res.status(500).json({
            message: "Error verifying 'pengajuan' ID. Please try again later.",
            error_details: err.sqlMessage || err.message,
          });
        }

        if (results.length === 0) {
          fs.unlinkSync(filePath);
          return res
            .status(400)
            .json({ message: "Invalid 'Pengajuan' ID provided." });
        }

        if (results[0].status !== "active") {
          fs.unlinkSync(filePath);
          return res
            .status(400)
            .json({ message: "This pengajuan is no longer active." });
        }

        checkAndInsertDocument(
          user_id,
          document_type,
          id_pengajuan,
          fileName,
          filePath,
          fileSize,
          mimeType,
          originalName,
          res
        );
      });
    } else {
      checkAndInsertDocument(
        user_id,
        document_type,
        null,
        fileName,
        filePath,
        fileSize,
        mimeType,
        originalName,
        res
      );
    }
  });
};

const checkAndInsertDocument = (
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

  db.query(checkQuery, queryParams, (err, results) => {
    if (err) {
      fs.unlinkSync(filePath);
      console.error("Database error during document check:", err);
      return res.status(500).json({
        message: "Error checking existing documents. Please try again later.",
        error_details: err.sqlMessage || err.message,
      });
    }

    if (results.length > 0) {
      fs.unlinkSync(filePath);
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
          ". Please delete the existing document first or update it.",
      });
    }

    // Enhanced insert query with new fields
    const insertQuery =
      "INSERT INTO documents (user_id, id_pengajuan, file_name, file_path, file_size, mime_type, original_name, document_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    db.query(
      insertQuery,
      [
        user_id,
        id_pengajuan,
        fileName,
        filePath,
        fileSize,
        mimeType,
        originalName,
        document_type,
      ],
      (err, result) => {
        if (err) {
          fs.unlinkSync(filePath);
          console.error("Database error during document insertion:", err);
          return res.status(500).json({
            message:
              "Error saving document info to database. Please try again later.",
            error_details: err.sqlMessage || err.message,
          });
        }

        res.status(201).json({
          message: "Dokumen berhasil diupload!",
          documentId: result.insertId,
          fileName: fileName,
          originalName: originalName,
          fileSize: fileSize,
          mimeType: mimeType,
          filePath: filePath,
        });
      }
    );
  });
};

// Enhanced getAllPengajuan with statistics
exports.getAllPengajuan = (req, res) => {
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

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error fetching pengajuan types:", err);
      return res
        .status(500)
        .json({ message: "Error fetching pengajuan types." });
    }

    res.json(results);
  });
};

// Enhanced getDocumentsByPengajuanId
exports.getDocumentsByPengajuanId = (req, res) => {
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
    JOIN tabel_pengajuan tp ON d.id_pengajuan = tp.id_pengajuan
    WHERE d.id_pengajuan = ?
    ORDER BY d.uploaded_at DESC
  `;

  db.query(query, [pengajuanId], (err, results) => {
    if (err) {
      console.error("Database error fetching documents by pengajuan ID:", err);
      return res
        .status(500)
        .json({ message: "Error fetching documents for this pengajuan." });
    }

    res.json(results);
  });
};

// Enhanced getUserDocuments
exports.getUserDocuments = (req, res) => {
  const userId = req.params.userId;
  const pengajuanId = req.query.id_pengajuan;

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

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Database error fetching user documents:", err);
      return res
        .status(500)
        .json({ message: "Error fetching user documents." });
    }

    res.json(results);
  });
};

// Enhanced getAllDocuments using the view
exports.getAllDocuments = (req, res) => {
  const query = `
    SELECT * FROM v_documents_with_details
    ORDER BY username, uploaded_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error fetching all documents:", err);
      return res.status(500).json({ message: "Error fetching all documents." });
    }

    // Group documents by user
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
  });
};

// Enhanced updateDocumentStatus
exports.updateDocumentStatus = (req, res) => {
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

  const executeDocumentUpdate = () => {
    if (id_pengajuan !== undefined) {
      updateFields += ", `id_pengajuan` = ?";
      queryParams.push(id_pengajuan);
    }
    queryParams.push(documentId);

    const query = `UPDATE documents SET ${updateFields} WHERE id = ?`;

    db.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Database error updating document status:", err);
        return res
          .status(500)
          .json({ message: "Error updating document status." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Document not found." });
      }

      res.json({ message: "Document status updated successfully!" });
    });
  };

  if (id_pengajuan !== undefined && id_pengajuan !== null) {
    const checkPengajuanQuery =
      "SELECT id_pengajuan, status FROM tabel_pengajuan WHERE id_pengajuan = ?";
    db.query(checkPengajuanQuery, [id_pengajuan], (err, results) => {
      if (err) {
        console.error("Database error checking id_pengajuan for update:", err);
        return res.status(500).json({
          message:
            "Error verifying 'pengajuan' ID for update. Please try again later.",
          error_details: err.sqlMessage || err.message,
        });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid 'Pengajuan' ID provided for update." });
      }

      if (results[0].status !== "active") {
        return res
          .status(400)
          .json({ message: "Cannot update document for inactive pengajuan." });
      }

      executeDocumentUpdate();
    });
  } else {
    executeDocumentUpdate();
  }
};

// Rest of the functions remain the same but with enhanced error handling
exports.getDocumentById = (req, res) => {
  const documentId = req.params.id;
  const query = `SELECT * FROM v_documents_with_details WHERE id = ?`;

  db.query(query, [documentId], (err, results) => {
    if (err) {
      console.error("Database error fetching document by ID:", err);
      return res.status(500).json({ message: "Error fetching document." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    res.json(results[0]);
  });
};

// Enhanced deleteDocument with audit trail
exports.deleteDocument = (req, res) => {
  const documentId = req.params.id;
  const userId = req.user ? req.user.id : null;

  if (!documentId) {
    return res.status(400).json({ message: "Document ID is required." });
  }

  const getDocQuery = "SELECT * FROM documents WHERE id = ?";
  db.query(getDocQuery, [documentId], (err, results) => {
    if (err) {
      console.error("Database error fetching document for deletion:", err);
      return res.status(500).json({ message: "Error fetching document info." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const document = results[0];

    // Check permissions
    if (
      userId &&
      document.user_id !== userId &&
      (!req.user || req.user.role !== "admin")
    ) {
      return res.status(403).json({
        message: "You don't have permission to delete this document.",
      });
    }

    // Delete physical file
    const filePath = document.file_path;
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      } catch (fileErr) {
        console.error(`Error deleting file: ${fileErr.message}`);
      }
    }

    // Delete from database
    const deleteQuery = "DELETE FROM documents WHERE id = ?";
    db.query(deleteQuery, [documentId], (err, result) => {
      if (err) {
        console.error("Database error deleting document:", err);
        return res
          .status(500)
          .json({ message: "Error deleting document from database." });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Document not found in database." });
      }

      res.json({
        message: "Document deleted successfully!",
        deletedDocumentId: documentId,
      });
    });
  });
};

// Get pengajuan statistics
exports.getPengajuanStats = (req, res) => {
  const query = "SELECT * FROM v_pengajuan_stats ORDER BY id_pengajuan";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error fetching pengajuan stats:", err);
      return res
        .status(500)
        .json({ message: "Error fetching pengajuan statistics." });
    }

    res.json(results);
  });
};

// Existing functions continue...
exports.bulkDeleteDocuments = (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return res.status(400).json({ message: "Document IDs array is required." });
  }

  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can perform bulk delete." });
  }

  const placeholders = documentIds.map(() => "?").join(",");
  const getDocsQuery = `SELECT file_path FROM documents WHERE id IN (${placeholders})`;

  db.query(getDocsQuery, documentIds, (err, results) => {
    if (err) {
      console.error("Database error fetching documents for bulk delete:", err);
      return res
        .status(500)
        .json({ message: "Error fetching documents info." });
    }

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
    db.query(deleteQuery, documentIds, (err, result) => {
      if (err) {
        console.error("Database error performing bulk delete:", err);
        return res
          .status(500)
          .json({ message: "Error deleting documents from database." });
      }

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
    });
  });
};

// Continue with other existing functions...
exports.deleteUserDocuments = (userId, callback) => {
  const getDocsQuery = "SELECT file_path FROM documents WHERE user_id = ?";
  db.query(getDocsQuery, [userId], (err, results) => {
    if (err) {
      console.error(
        "Database error fetching user documents for deletion:",
        err
      );
      return callback(err);
    }

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
    db.query(deleteQuery, [userId], (err, result) => {
      if (err) {
        console.error("Database error deleting user documents:", err);
        return callback(err);
      }
      callback(null, result);
    });
  });
};

// Function to generate and save surat_pengantar
exports.generateSuratPengantar = (req, res) => {
  const { user_id, id_pengajuan, letter_number, letter_content, approved_by } =
    req.body;

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

  // You would typically generate the PDF/document content here and save it
  // For now, let's just create a dummy file and path
  const dummyFileName = `surat_pengantar_${Date.now()}.pdf`;
  const dummyFilePath = path.join(uploadDir, dummyFileName);
  fs.writeFileSync(
    dummyFilePath,
    `Surat Pengantar for ${letter_number}\n\n${letter_content}`
  ); // Simple file content

  const insertQuery = `
    INSERT INTO surat_pengantar
    (user_id, id_pengajuan, letter_number, letter_path, letter_content, approved_by, status)
    VALUES (?, ?, ?, ?, ?, ?, 'generated')
  `;

  db.query(
    insertQuery,
    [
      user_id,
      id_pengajuan,
      letter_number,
      dummyFilePath,
      letter_content,
      approved_by,
    ],
    (err, result) => {
      if (err) {
        fs.unlinkSync(dummyFilePath); // Clean up dummy file if DB insert fails
        console.error("Database error inserting surat_pengantar:", err);
        return res.status(500).json({
          message: "Error generating and saving surat pengantar.",
          error_details: err.sqlMessage || err.message,
        });
      }

      res.status(201).json({
        message: "Surat pengantar generated and saved successfully!",
        suratId: result.insertId,
        letter_path: dummyFilePath,
      });
    }
  );
};

// Function to get surat_pengantar by ID
exports.getSuratPengantarById = (req, res) => {
  const suratId = req.params.id;
  const query = `
    SELECT sp.*, u.username as user_username, a.username as approved_by_username, tp.nama_pengajuan
    FROM surat_pengantar sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN users a ON sp.approved_by = a.id
    JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    WHERE sp.id = ?
  `;

  db.query(query, [suratId], (err, results) => {
    if (err) {
      console.error("Database error fetching surat_pengantar by ID:", err);
      return res
        .status(500)
        .json({ message: "Error fetching surat pengantar." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }

    res.json(results[0]);
  });
};

// Function to get all surat_pengantar
exports.getAllSuratPengantar = (req, res) => {
  const query = `
    SELECT sp.*, u.username as user_username, a.username as approved_by_username, tp.nama_pengajuan
    FROM surat_pengantar sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN users a ON sp.approved_by = a.id
    JOIN tabel_pengajuan tp ON sp.id_pengajuan = tp.id_pengajuan
    ORDER BY sp.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error fetching all surat_pengantar:", err);
      return res
        .status(500)
        .json({ message: "Error fetching all surat pengantar." });
    }

    res.json(results);
  });
};

// Function to update surat_pengantar status (e.g., downloaded, expired)
exports.updateSuratPengantarStatus = (req, res) => {
  const suratId = req.params.id;
  const { status } = req.body; // 'downloaded', 'expired'

  if (!status || !["generated", "downloaded", "expired"].includes(status)) {
    return res.status(400).json({
      message: "Valid status is required (generated, downloaded, expired).",
    });
  }

  let updateQuery =
    "UPDATE surat_pengantar SET status = ?, updated_at = CURRENT_TIMESTAMP";
  const queryParams = [status, suratId];

  if (status === "downloaded") {
    updateQuery +=
      ", is_downloaded = TRUE, download_count = download_count + 1";
  }

  updateQuery += " WHERE id = ?";

  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Database error updating surat_pengantar status:", err);
      return res
        .status(500)
        .json({ message: "Error updating surat pengantar status." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }

    res.json({ message: "Surat pengantar status updated successfully!" });
  });
};

// Function to delete surat_pengantar
exports.deleteSuratPengantar = (req, res) => {
  const suratId = req.params.id;
  const userId = req.user ? req.user.id : null; // Assuming user info is in req.user

  const getSuratQuery =
    "SELECT letter_path, user_id FROM surat_pengantar WHERE id = ?";
  db.query(getSuratQuery, [suratId], (err, results) => {
    if (err) {
      console.error(
        "Database error fetching surat_pengantar for deletion:",
        err
      );
      return res
        .status(500)
        .json({ message: "Error fetching surat pengantar info." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Surat pengantar not found." });
    }

    const surat = results[0];

    // Basic authorization: allow admin or the user who created the surat to delete it
    if (
      userId &&
      surat.user_id !== userId &&
      (!req.user || req.user.role !== "admin")
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
    db.query(deleteQuery, [suratId], (err, result) => {
      if (err) {
        console.error("Database error deleting surat_pengantar:", err);
        return res
          .status(500)
          .json({ message: "Error deleting surat pengantar from database." });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Surat pengantar not found in database." });
      }

      res.json({
        message: "Surat pengantar deleted successfully!",
        deletedSuratId: suratId,
      });
    });
  });
};

// Missing function from prompt, assuming it handles deleting documents associated with a user
exports.deleteUserDocuments = (userId, callback) => {
  const getDocsQuery = "SELECT file_path FROM documents WHERE user_id = ?";
  db.query(getDocsQuery, [userId], (err, results) => {
    if (err) {
      console.error(
        "Database error fetching user documents for deletion:",
        err
      );
      return callback(err);
    }

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
    db.query(deleteQuery, [userId], (err, result) => {
      if (err) {
        console.error("Database error deleting user documents:", err);
        return callback(err);
      }
      callback(null, result);
    });
  });
};
