const express = require('express');
const router = express.Router();

// ✅ Corrected Protect Middleware Import
const { authMiddleware: protect } = require('../middleware/auth');

const settingsController = require('../controllers/settingsController');

router.get('/', protect, settingsController.getSettings);
router.put('/update', protect, settingsController.updateSetting);
router.post('/logout', protect, settingsController.logout);
router.post('/change-pin', protect, settingsController.changePin);

module.exports = router;