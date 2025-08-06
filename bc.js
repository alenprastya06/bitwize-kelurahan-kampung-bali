const bcrypt = require("bcryptjs");
const password = "masuk123"; // Ganti dengan password admin yang Anda inginkan
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Hashed Password:", hashedPassword);
});
