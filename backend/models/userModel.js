const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: String,
  email: { type: String, unique: true }, // optional
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
