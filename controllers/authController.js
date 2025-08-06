const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("Register request received:", { username, email });
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");
    const query =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    console.log("Executing insert query:", query);
    const [result] = await db.execute(query, [username, email, hashedPassword]);
    console.log("User registered successfully, ID:", result.insertId);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }
    if (err.name === "ValidationError" || err.message.includes("bcrypt")) {
      return res.status(500).json({ message: "Error hashing password." });
    }
    return res.status(500).json({ message: "Error registering user." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error." });
    }
    const query = "SELECT * FROM users WHERE username = ?";
    const [results] = await db.execute(query, [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const user = results[0];
    console.log("User found:", {
      id: user.id,
      username: user.username,
      role: user.role,
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const response = {
      message: "Login successful!",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    };
    res.json(response);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(500).json({ message: "Error generating token." });
    }
    if (err.message.includes("bcrypt")) {
      return res.status(500).json({ message: "Error comparing passwords." });
    }
    return res.status(500).json({ message: "Error logging in." });
  }
};
