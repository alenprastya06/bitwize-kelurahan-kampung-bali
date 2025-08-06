const db = require("../config/db");
require("dotenv").config();

// Add this function to your profileController.js
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Get user profile request for user ID:", userId);

    const query = `
      SELECT 
        id, username, email, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, agama, kewarganegaraan, no_ktp_sktld, alamat_lengkap,
        pekerjaan, phone, profile_picture, address, role, is_active, 
        email_verified, created_at, last_login, updated_at
      FROM users WHERE id = ?
    `;

    const [results] = await db.execute(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.status(200).json({
      message: "Profil user berhasil diambil!",
      user: results[0],
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ message: "Error mengambil profil user." });
  }
};
exports.completeProfile = async (req, res) => {
  try {
    const {
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      kewarganegaraan,
      no_ktp_sktld,
      alamat_lengkap,
      pekerjaan,
      phone,
      profile_picture,
    } = req.body;

    const userId = req.user.id;

    console.log("Complete profile request received for user ID:", userId);

    if (!nama_lengkap || !tempat_lahir || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({
        message:
          "Nama lengkap, tempat lahir, tanggal lahir, dan jenis kelamin wajib diisi.",
      });
    }

    // Validasi jenis kelamin
    if (!["L", "P"].includes(jenis_kelamin)) {
      return res.status(400).json({
        message: "Jenis kelamin harus 'L' (Laki-laki) atau 'P' (Perempuan).",
      });
    }

    // Validasi format tanggal lahir (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tanggal_lahir)) {
      return res.status(400).json({
        message: "Format tanggal lahir harus YYYY-MM-DD.",
      });
    }

    // Validasi nomor KTP jika diisi (harus 16 digit)
    if (no_ktp_sktld && !/^\d{16}$/.test(no_ktp_sktld)) {
      return res.status(400).json({
        message: "Nomor KTP/SKTLD harus 16 digit angka.",
      });
    }

    // Check if user exists
    const checkUserQuery = "SELECT id FROM users WHERE id = ?";
    const [userExists] = await db.execute(checkUserQuery, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Update user profile
    const updateQuery = `
      UPDATE users SET 
        nama_lengkap = ?,
        tempat_lahir = ?,
        tanggal_lahir = ?,
        jenis_kelamin = ?,
        agama = ?,
        kewarganegaraan = ?,
        no_ktp_sktld = ?,
        alamat_lengkap = ?,
        pekerjaan = ?,
        phone = ?,
        profile_picture = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    console.log("Executing update profile query for user:", userId);

    const [result] = await db.execute(updateQuery, [
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama || null,
      kewarganegaraan || "Indonesia",
      no_ktp_sktld || null,
      alamat_lengkap || null,
      pekerjaan || null,
      phone || null,
      profile_picture || null,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Gagal memperbarui profil." });
    }

    console.log("Profile updated successfully for user:", userId);

    // Get updated user data (without password)
    const getUserQuery = `
      SELECT 
        id, username, email, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, agama, kewarganegaraan, no_ktp_sktld, alamat_lengkap,
        pekerjaan, phone, profile_picture, role, is_active, email_verified,
        created_at, updated_at
      FROM users WHERE id = ?
    `;

    const [updatedUser] = await db.execute(getUserQuery, [userId]);

    res.status(200).json({
      message: "Profil berhasil dilengkapi!",
      user: updatedUser[0],
    });
  } catch (err) {
    console.error("Complete profile error:", err);

    if (err.code === "ER_DATA_TOO_LONG") {
      return res
        .status(400)
        .json({ message: "Data terlalu panjang untuk salah satu field." });
    }

    if (err.code === "ER_TRUNCATED_WRONG_VALUE") {
      return res.status(400).json({ message: "Format data tidak valid." });
    }

    return res.status(500).json({ message: "Error melengkapi profil user." });
  }
};

// API untuk mendapatkan profil user lengkap
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Get profile request for user ID:", userId);

    const query = `
      SELECT 
        id, username, email, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, agama, kewarganegaraan, no_ktp_sktld, alamat_lengkap,
        pekerjaan, phone, profile_picture, address, role, is_active, 
        email_verified, created_at, last_login, updated_at
      FROM users WHERE id = ?
    `;

    const [results] = await db.execute(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.status(200).json({
      message: "Profil berhasil diambil!",
      user: results[0],
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Error mengambil profil user." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateFields = req.body;

    console.log("Update profile request for user ID:", userId, updateFields);

    const allowedFields = [
      "nama_lengkap",
      "tempat_lahir",
      "tanggal_lahir",
      "jenis_kelamin",
      "agama",
      "kewarganegaraan",
      "no_ktp_sktld",
      "alamat_lengkap",
      "pekerjaan",
      "phone",
      "profile_picture",
      "address",
    ];

    const fieldsToUpdate = {};
    Object.keys(updateFields).forEach((key) => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = updateFields[key];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada field yang valid untuk diupdate." });
    }

    if (
      fieldsToUpdate.jenis_kelamin &&
      !["L", "P"].includes(fieldsToUpdate.jenis_kelamin)
    ) {
      return res.status(400).json({
        message: "Jenis kelamin harus 'L' (Laki-laki) atau 'P' (Perempuan).",
      });
    }

    // Validasi tanggal lahir jika ada
    if (fieldsToUpdate.tanggal_lahir) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fieldsToUpdate.tanggal_lahir)) {
        return res.status(400).json({
          message: "Format tanggal lahir harus YYYY-MM-DD.",
        });
      }
    }

    // Validasi nomor KTP jika ada
    if (
      fieldsToUpdate.no_ktp_sktld &&
      !/^\d{16}$/.test(fieldsToUpdate.no_ktp_sktld)
    ) {
      return res.status(400).json({
        message: "Nomor KTP/SKTLD harus 16 digit angka.",
      });
    }

    // Build dynamic update query
    const setClause = Object.keys(fieldsToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);
    values.push(userId);

    const updateQuery = `
      UPDATE users SET 
        ${setClause},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await db.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User tidak ditemukan atau tidak ada perubahan." });
    }

    console.log("Profile updated successfully for user:", userId);

    // Get updated user data
    const getUserQuery = `
      SELECT 
        id, username, email, nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, agama, kewarganegaraan, no_ktp_sktld, alamat_lengkap,
        pekerjaan, phone, profile_picture, address, role, is_active, 
        email_verified, created_at, updated_at
      FROM users WHERE id = ?
    `;

    const [updatedUser] = await db.execute(getUserQuery, [userId]);

    res.status(200).json({
      message: "Profil berhasil diperbarui!",
      user: updatedUser[0],
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Error memperbarui profil user." });
  }
};
