const db = require("../config/db");

// CREATE - Tambah data kelengkapan baru
exports.createKelengkapanData = async (req, res) => {
  const {
    user_id,
    rt,
    rw,
    no_surat_pengantar,
    tanggal_surat_pengantar,
    nama_lengkap,
    luas_lahan,
    alamat_lahan,
  } = req.body;

  // Validasi input wajib
  if (!user_id || !rt || !rw || !nama_lengkap) {
    return res.status(400).json({
      success: false,
      message: "User ID, RT, RW, dan Nama Lengkap wajib diisi.",
    });
  }

  // Security check: User hanya bisa menambah data untuk dirinya sendiri (kecuali admin)
  if (req.user.id !== parseInt(user_id) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Anda hanya bisa menambah data untuk diri sendiri.",
    });
  }

  try {
    // Cek apakah user exists
    const [userCheck] = await db.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);

    if (userCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    const insertQuery = `
      INSERT INTO kelengkapan_data 
      (user_id, rt, rw, no_surat_pengantar, tanggal_surat_pengantar, nama_lengkap, luas_lahan, alamat_lahan, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(insertQuery, [
      user_id,
      rt,
      rw,
      no_surat_pengantar || null,
      tanggal_surat_pengantar || null,
      nama_lengkap,
      luas_lahan || null,
      alamat_lahan || null,
    ]);

    res.status(201).json({
      success: true,
      message: "Data kelengkapan berhasil ditambahkan!",
      data: {
        id: result.insertId,
        user_id: parseInt(user_id),
        rt,
        rw,
        no_surat_pengantar,
        tanggal_surat_pengantar,
        nama_lengkap,
        luas_lahan,
        alamat_lahan,
      },
    });
  } catch (err) {
    console.error("Database error creating kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error menambahkan data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// READ - Ambil semua data kelengkapan (untuk admin)
exports.getAllKelengkapanData = async (req, res) => {
  // Hanya admin yang bisa mengakses semua data
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Hanya admin yang bisa mengakses semua data.",
    });
  }

  try {
    const query = `
      SELECT 
        kd.id,
        kd.user_id,
        u.username,
        u.email,
        u.nama_lengkap as user_nama_lengkap,
        kd.rt,
        kd.rw,
        kd.no_surat_pengantar,
        kd.tanggal_surat_pengantar,
        kd.nama_lengkap,
        kd.luas_lahan,
        kd.alamat_lahan,
        kd.created_at,
        kd.updated_at
      FROM kelengkapan_data kd
      JOIN users u ON kd.user_id = u.id
      ORDER BY kd.created_at DESC
    `;

    const [results] = await db.query(query);

    res.status(200).json({
      success: true,
      message: "Data kelengkapan berhasil diambil.",
      data: results,
      count: results.length,
    });
  } catch (err) {
    console.error("Database error fetching all kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error mengambil data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

exports.getKelengkapanDataByUserId = async (req, res) => {
  const userId = req.params.userId;
  if (req.user.id !== parseInt(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Anda hanya bisa mengakses data kelengkapan sendiri.",
    });
  }
  try {
    const query = `
      SELECT 
        kd.*,
        u.username,
        u.email
      FROM kelengkapan_data kd
      JOIN users u ON kd.user_id = u.id
      WHERE kd.user_id = ?
      ORDER BY kd.created_at DESC
    `;

    const [results] = await db.query(query, [userId]);

    res.status(200).json({
      success: true,
      message: "Data kelengkapan user berhasil diambil.",
      data: results,
      count: results.length,
    });
  } catch (err) {
    console.error("Database error fetching kelengkapan data by user ID:", err);
    return res.status(500).json({
      success: false,
      message: "Error mengambil data kelengkapan user.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

exports.getKelengkapanDataById = async (req, res) => {
  const kelengkapanId = req.params.id;

  try {
    const query = `
      SELECT 
        kd.*,
        u.username,
        u.email,
        u.nama_lengkap as user_nama_lengkap
      FROM kelengkapan_data kd
      JOIN users u ON kd.user_id = u.id
      WHERE kd.id = ?
    `;

    const [results] = await db.query(query, [kelengkapanId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan.",
      });
    }

    const kelengkapanData = results[0];

    // Security check: User hanya bisa mengakses data mereka sendiri (kecuali admin)
    if (req.user.id !== kelengkapanData.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Anda tidak memiliki akses ke data ini.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kelengkapan berhasil diambil.",
      data: kelengkapanData,
    });
  } catch (err) {
    console.error("Database error fetching kelengkapan data by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Error mengambil data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// UPDATE - Update data kelengkapan
exports.updateKelengkapanData = async (req, res) => {
  const kelengkapanId = req.params.id;
  const {
    rt,
    rw,
    no_surat_pengantar,
    tanggal_surat_pengantar,
    nama_lengkap,
    luas_lahan,
    alamat_lahan,
  } = req.body;

  // Validasi input wajib
  if (!rt || !rw || !nama_lengkap) {
    return res.status(400).json({
      success: false,
      message: "RT, RW, dan Nama Lengkap wajib diisi.",
    });
  }

  try {
    // Cek apakah data kelengkapan exists dan ambil user_id
    const [checkResult] = await db.query(
      "SELECT user_id FROM kelengkapan_data WHERE id = ?",
      [kelengkapanId]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan.",
      });
    }

    const kelengkapanData = checkResult[0];

    // Security check: User hanya bisa mengupdate data mereka sendiri (kecuali admin)
    if (req.user.id !== kelengkapanData.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Anda tidak memiliki akses untuk mengupdate data ini.",
      });
    }

    const updateQuery = `
      UPDATE kelengkapan_data 
      SET rt = ?, rw = ?, no_surat_pengantar = ?, tanggal_surat_pengantar = ?, 
          nama_lengkap = ?, luas_lahan = ?, alamat_lahan = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await db.query(updateQuery, [
      rt,
      rw,
      no_surat_pengantar || null,
      tanggal_surat_pengantar || null,
      nama_lengkap,
      luas_lahan || null,
      alamat_lahan || null,
      kelengkapanId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kelengkapan berhasil diupdate!",
      data: {
        id: parseInt(kelengkapanId),
        rt,
        rw,
        no_surat_pengantar,
        tanggal_surat_pengantar,
        nama_lengkap,
        luas_lahan,
        alamat_lahan,
      },
    });
  } catch (err) {
    console.error("Database error updating kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error mengupdate data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// DELETE - Hapus data kelengkapan
exports.deleteKelengkapanData = async (req, res) => {
  const kelengkapanId = req.params.id;

  try {
    // Cek apakah data kelengkapan exists dan ambil user_id
    const [checkResult] = await db.query(
      "SELECT user_id FROM kelengkapan_data WHERE id = ?",
      [kelengkapanId]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan.",
      });
    }

    const kelengkapanData = checkResult[0];

    // Security check: User hanya bisa menghapus data mereka sendiri (kecuali admin)
    if (req.user.id !== kelengkapanData.user_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Anda tidak memiliki akses untuk menghapus data ini.",
      });
    }

    // Cek apakah data kelengkapan sedang digunakan di surat_pengantar
    const [suratCheck] = await db.query(
      "SELECT COUNT(*) as count FROM surat_pengantar WHERE kelengkapan_data_id = ?",
      [kelengkapanId]
    );

    if (suratCheck[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Data kelengkapan tidak dapat dihapus karena sedang digunakan dalam surat pengantar.",
      });
    }

    const deleteQuery = "DELETE FROM kelengkapan_data WHERE id = ?";
    const [result] = await db.query(deleteQuery, [kelengkapanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kelengkapan berhasil dihapus!",
      deletedId: parseInt(kelengkapanId),
    });
  } catch (err) {
    console.error("Database error deleting kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error menghapus data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// BULK DELETE - Hapus multiple data kelengkapan (untuk admin)
exports.bulkDeleteKelengkapanData = async (req, res) => {
  const { kelengkapanIds } = req.body;

  if (
    !kelengkapanIds ||
    !Array.isArray(kelengkapanIds) ||
    kelengkapanIds.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Array ID data kelengkapan wajib diisi.",
    });
  }

  // Hanya admin yang bisa melakukan bulk delete
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Hanya admin yang bisa melakukan bulk delete.",
    });
  }

  try {
    // Cek apakah ada data yang sedang digunakan di surat_pengantar
    const placeholders = kelengkapanIds.map(() => "?").join(",");
    const [suratCheck] = await db.query(
      `SELECT kelengkapan_data_id FROM surat_pengantar WHERE kelengkapan_data_id IN (${placeholders})`,
      kelengkapanIds
    );

    if (suratCheck.length > 0) {
      const usedIds = suratCheck.map((row) => row.kelengkapan_data_id);
      return res.status(400).json({
        success: false,
        message:
          "Beberapa data kelengkapan tidak dapat dihapus karena sedang digunakan dalam surat pengantar.",
        usedIds: usedIds,
      });
    }

    const deleteQuery = `DELETE FROM kelengkapan_data WHERE id IN (${placeholders})`;
    const [result] = await db.query(deleteQuery, kelengkapanIds);

    res.status(200).json({
      success: true,
      message: `Berhasil menghapus ${result.affectedRows} data kelengkapan.`,
      deletedCount: result.affectedRows,
      deletedIds: kelengkapanIds,
    });
  } catch (err) {
    console.error("Database error bulk deleting kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error menghapus data kelengkapan.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// GET LATEST - Ambil data kelengkapan terbaru untuk user tertentu
exports.getLatestKelengkapanDataByUserId = async (req, res) => {
  const userId = req.params.userId;

  // Security check: User hanya bisa mengakses data mereka sendiri (kecuali admin)
  if (req.user.id !== parseInt(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Anda hanya bisa mengakses data kelengkapan sendiri.",
    });
  }

  try {
    const query = `
      SELECT 
        kd.*,
        u.username,
        u.email
      FROM kelengkapan_data kd
      JOIN users u ON kd.user_id = u.id
      WHERE kd.user_id = ?
      ORDER BY kd.created_at DESC
      LIMIT 1
    `;

    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kelengkapan tidak ditemukan untuk user ini.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kelengkapan terbaru berhasil diambil.",
      data: results[0],
    });
  } catch (err) {
    console.error("Database error fetching latest kelengkapan data:", err);
    return res.status(500).json({
      success: false,
      message: "Error mengambil data kelengkapan terbaru.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};
