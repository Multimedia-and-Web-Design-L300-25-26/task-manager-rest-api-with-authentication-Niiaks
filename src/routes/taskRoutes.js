import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    // - Create task
    const task = new Task({
      ...req.body,
    });
    // - Attach owner = req.user._id
    task.owner = req.user.id;
    task.save();

    return res
      .status(201)
      .json({ success: true, task, message: "task created" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: " Task Internal server error" });
  }
});

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    // - Return only tasks belonging to req.user
    const tasks = await Task.find({ owner: req.user.id })
      .sort({ createdAt: 1 })
      .exec();
    if (tasks.length === 0) {
      return res
        .status(200)
        .json({ success: true, tasks: [], message: "user has no tasks yet" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Task Internal server error" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // - Check ownership
    const userTask = await Task.findOne({ owner: req.user.id });
    if (!userTask) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete someone's task. Forbidden",
      });
    }
    // - Delete task
    await Task.findByIdAndDelete({ _id: id });
    return res.status(204).json({ success: true, message: "Task deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;
