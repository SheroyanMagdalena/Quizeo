const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@etud.ufar\.am$/,
  },
  password: {
    type: String,
    required: true,
  },
});

// Explicitly set collection name to "Users"
module.exports = mongoose.model("User", userSchema, "Users");
