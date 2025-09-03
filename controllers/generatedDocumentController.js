const db = require("../config/db");

class GeneratedDocumentController {
  constructor() {
    this.getMyGeneratedDocuments = this.getMyGeneratedDocuments.bind(this);
  }

  async getMyGeneratedDocuments(req, res) {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let query = `
      SELECT
        d.id,
        d.user_id,
        u.username,
        u.email,
        d.application_id,
        ua.status AS application_status,
        d.id_pengajuan,
        tp.nama_pengajuan,
        d.file_name,
        d.file_path,
        d.file_size,
        d.mime_type,
        d.original_name,
        d.document_type,
        d.status AS document_status,
        d.admin_notes,
        d.user_note,
        d.is_complete,
        d.uploaded_at,
        d.updated_at
      FROM
        documents d
      JOIN
        users u ON d.user_id = u.id
      LEFT JOIN
        tabel_pengajuan tp ON d.id_pengajuan = tp.id_pengajuan
      LEFT JOIN
        user_applications ua ON d.application_id = ua.id
      WHERE
        d.document_type = 'generated_document'
    `;
    const queryParams = [];

    if (!isAdmin) {
      query += ` AND d.user_id = ?`;
      queryParams.push(userId);
    }

    query += ` ORDER BY d.uploaded_at DESC`;

    try {
      const [results] = await db.query(query, queryParams);
      res.json(results);
    } catch (err) {
      console.error("Database error fetching generated documents:", err);
      return res.status(500).json({
        message: "Error fetching generated documents.",
        error: err.message,
      });
    }
  }
}

module.exports = new GeneratedDocumentController();
