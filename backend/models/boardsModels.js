const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }], // many todos
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);
