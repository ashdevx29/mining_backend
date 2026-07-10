const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);

module.exports = router;
