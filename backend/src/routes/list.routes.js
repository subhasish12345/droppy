const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const listController = require("../controllers/list.controller");

router.use(authMiddleware);

router.post("/", listController.createList);
router.patch("/:id", listController.updateList);
router.delete("/:id", listController.deleteList);

module.exports = router;
