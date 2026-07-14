// routes/achievementsRoutes.js
const express = require('express');
const router = express.Router();
const achievementsController = require('../controllers/achievementsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, achievementsController.getAchievements);

module.exports = router;