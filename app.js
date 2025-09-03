const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const profilRoutes = require("./routes/profile");
const kelengkapanData = require("./routes/kelengkapan");
const generatedDocumentRoutes = require("./routes/generatedDocument");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", profilRoutes);
app.use("/api/kelengkapan", kelengkapanData);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/generated-documents", generatedDocumentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
