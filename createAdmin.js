const bcrypt = require("bcryptjs");
const db = require("./config/db"); // Pastikan path ini benar ke file koneksi DB Anda
require("dotenv").config({ path: "./.env" }); // Pastikan path ke .env file benar

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "masuk123"; // GANTI INI DENGAN PASSWORD ADMIN ANDA

async function createAdminUser() {
  if (ADMIN_PASSWORD === "masuk123") {
    console.warn(
      "WARNING: Using default admin password. Please change ADMIN_PASSWORD in .env or createAdmin.js."
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const checkAdminQuery =
      "SELECT COUNT(*) AS count FROM users WHERE role = ?";
    const [rows] = await db.promise().query(checkAdminQuery, ["admin"]); // Menggunakan promise() untuk async/await

    if (rows[0].count > 0) {
      console.log("Admin user already exists. Skipping creation.");
      return;
    }

    const insertAdminQuery =
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await db
      .promise()
      .query(insertAdminQuery, [
        ADMIN_USERNAME,
        ADMIN_EMAIL,
        hashedPassword,
        "admin",
      ]);
    console.log(
      `Admin user '${ADMIN_USERNAME}' created successfully with ID: ${result.insertId}`
    );
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      console.error(
        "Username or email might already exist. Please check your database."
      );
    }
  } finally {
    db.end(); // Tutup koneksi database setelah selesai
  }
}

createAdminUser();
