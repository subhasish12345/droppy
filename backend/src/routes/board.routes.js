const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const boardController = require("../controllers/board.controller");

// All routes require auth
router.use(authMiddleware);

router.post("/", boardController.createBoard);
router.get("/", boardController.getBoards);
router.get("/:id", boardController.getBoardById);
router.post("/:id/invite", boardController.inviteMember);
router.post("/:id/join", boardController.joinBoard);

module.exports = router;
