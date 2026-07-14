const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getNotifications,
  markAllRead,
  markAsRead
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;