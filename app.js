const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const profilRoutes = require("./routes/profile");
const kelengkapanData = require("./routes/kelengkapan");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// === CORS Configuration ===
const corsOptions = {
  origin: "https://sidarabali.my.id", // Ganti dengan domain frontend Anda
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Hanya aktifkan jika Anda pakai cookies / header auth
};

// Gunakan CORS dengan opsi
app.use(cors(corsOptions));

// Tangani preflight request (OPTIONS)
app.options("*", cors(corsOptions));

// === Middleware ===
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Routes ===
app.use("/api", profilRoutes);
app.use("/api/kelengkapan", kelengkapanData);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
