// routes/boardsRoute.js
const express = require("express");
const router = express.Router();
const Board = require("../models/boardsModels");
const Todo = require("../models/todoModels");
const User = require("../models/userModel"); 

// GET /boards  -> list all boards (frontend expects this)
router.get("/boards", async (req, res) => {
  try {
    const boards = await Board.find().sort({ createdAt: -1 }).lean();
    res.json({ boards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /boards
router.post("/boards", async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    const board = await Board.create({ name, description, createdBy });

    // optionally push board into user's boards array (ensure User exists)
    if (createdBy) {
      try {
        await User.findByIdAndUpdate(createdBy, { $push: { boards: board._id } });
      } catch (uErr) {
        // don't crash the whole route if user update fails — just warn
        console.warn("Failed to push board into user:", uErr.message);
      }
    }

    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /boards/:boardId/todos
router.post("/boards/:boardId/todos", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, dueDate, assignedTo } = req.body;

    const todo = await Todo.create({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo,
    });

    await Board.findByIdAndUpdate(boardId, { $push: { todos: todo._id } });

    res.status(201).json({ todo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /boards/:boardId
router.get("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId)
      .populate({ path: "todos", options: { sort: { createdAt: -1 } } })
      .lean();
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json({ board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /boards/:boardId/todos/:todoId
router.delete("/boards/:boardId/todos/:todoId", async (req, res) => {
  try {
    const { boardId, todoId } = req.params;
    await Todo.findByIdAndDelete(todoId);
    await Board.findByIdAndUpdate(boardId, { $pull: { todos: todoId } });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/todos/:todoId/status", async (req, res) => {
  try {
    const { todoId } = req.params;
    const { status } = req.body;

    // Validate status
    const allowed = ["todo", "in_progress", "done"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    // Update and return the new todo
    const updated = await Todo.findByIdAndUpdate(
      todoId,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Todo not found" });

    return res.json({ todo: updated });
  } catch (err) {
    console.error("Update todo status error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
