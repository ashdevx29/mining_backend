const Notification = require('../models/Notification');

// Get all notifications + unread count
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create notification (for internal use / admin)
exports.createNotification = async (userId, title, desc, badge = 'NEW') => {
  return await Notification.create({
    user: userId,
    title,
    desc,
    badge
  });
};