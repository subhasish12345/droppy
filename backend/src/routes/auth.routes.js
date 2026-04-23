const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/guest", authController.guestLogin);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.put("/claim", authMiddleware, authController.claimAccount);

module.exports = router;
