const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/task.controller");

router.use(authMiddleware);

router.post("/", taskController.createTask);
router.patch("/:id", taskController.updateTask);
router.patch("/:id/move", taskController.moveTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
