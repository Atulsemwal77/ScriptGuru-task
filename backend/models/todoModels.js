const mongoose = require("mongoose");

const toDoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["todo", "in_progress", "done"],
    default: "todo",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  assignedTo: { type: String }, 
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Todo", toDoSchema);
