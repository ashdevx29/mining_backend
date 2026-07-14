// routes/miningRoutes.js   (or .jsx)
const express = require('express');
const router = express.Router();
const miningController = require('../controllers/miningController');
const { authMiddleware } = require('../middleware/auth');

router.post('/start', authMiddleware, miningController.startMining);
router.post('/claim', authMiddleware, miningController.claimMining);
router.get('/status', authMiddleware, miningController.getStatus);

module.exports = router;
