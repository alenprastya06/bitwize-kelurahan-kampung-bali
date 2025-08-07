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

// CORS Configuration
const corsOptions = {
  origin: [
    "https://sidarabali.my.id",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", profilRoutes);
app.use("/api/kelengkapan", kelengkapanData);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
