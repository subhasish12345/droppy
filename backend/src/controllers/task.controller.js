const taskService = require("../services/task.service");

// POST /tasks
const createTask = async (req, res) => {
  try {
    const { boardId, listId, title, description, assignedTo, dueDate } = req.body;
    if (!boardId || !listId || !title) return res.status(400).json({ error: "boardId, listId, and title are required" });

    const task = await taskService.createTask(boardId, listId, req.user.id, title, description, assignedTo, dueDate);
    return res.status(201).json(task);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// PATCH /tasks/:id
const updateTask = async (req, res) => {
  try {
    const { boardId, ...data } = req.body;
    if (!boardId) return res.status(400).json({ error: "boardId is required" });

    const task = await taskService.updateTask(req.params.id, boardId, req.user.id, data);
    return res.status(200).json(task);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// PATCH /tasks/:id/move
const moveTask = async (req, res) => {
  try {
    const { boardId, listId, position } = req.body;
    if (!boardId || !listId || position === undefined) {
      return res.status(400).json({ error: "boardId, listId, and position are required" });
    }

    const task = await taskService.moveTask(req.params.id, boardId, req.user.id, listId, position);
    return res.status(200).json(task);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to move task" });
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { boardId } = req.body;
    if (!boardId) return res.status(400).json({ error: "boardId is required" });

    await taskService.deleteTask(req.params.id, boardId, req.user.id);
    return res.status(204).send();
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Access denied" });
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

module.exports = { createTask, updateTask, moveTask, deleteTask };
