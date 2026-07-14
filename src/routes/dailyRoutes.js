// routes/dailyRoutes.js
const express = require('express');
const router = express.Router();
const dailyCheckinController = require('../controllers/dailyCheckinController');
const { authMiddleware } = require('../middleware/auth');

router.post('/claim', authMiddleware, dailyCheckinController.claimDaily);
router.get('/streak', authMiddleware, dailyCheckinController.getStreak);

module.exports = router;