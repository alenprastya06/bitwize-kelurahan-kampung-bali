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

// This is a new, more explicit CORS configuration.
// It allows only the specified origin to access your API.
// This is generally better practice for production environments.
const corsOptions = {
  // Use 'origin' to specify a single, allowed domain.
  // This will prevent the conflict with the '*' wildcard.
  origin: "https://sidarabali.my.id",
  optionsSuccessStatus: 200, // Some older browsers require this
};

// Apply the configured CORS middleware.
app.use(cors(corsOptions));

// If you need to allow multiple specific origins, you can pass
// an array instead:
// const multipleOrigins = ['https://sidarabali.my.id', 'https://another-domain.com'];
// const corsOptionsMultiple = { origin: multipleOrigins };
// app.use(cors(corsOptionsMultiple));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", profilRoutes);
app.use("/api/kelengkapan", kelengkapanData);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
