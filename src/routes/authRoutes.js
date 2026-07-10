const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

// Public Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected Route
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;