

// routes/referralRoutes.js
const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, referralController.getReferralStats);
router.get('/tree', authMiddleware, referralController.getReferralTree);

module.exports = router;