const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected test route — verify middleware works
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Token valid",
    user: req.user,
  });
});

module.exports = router;
