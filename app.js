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

// Define allowed origins
const allowedOrigins = [
  "https://sidarabali.my.id",
  "http://localhost:3000", // For development
  "http://127.0.0.1:3000", // For development
];

// Configure CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps) or from an allowed origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// Apply CORS middleware ONCE and early in the stack
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", profilRoutes);
app.use("/api/kelengkapan", kelengkapanData);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
    });
  } else {
    // Pass other errors to the default Express error handler
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
