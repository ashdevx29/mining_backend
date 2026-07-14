const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get User Settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Setting (Toggle)
const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!['notifications', 'sound', 'vibration', 'darkMode', 'autoMine', 'twoFactor'].includes(key)) {
      return res.status(400).json({ message: 'Invalid setting key' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [`settings.${key}`]: value },
      { new: true }
    ).select('settings');

    res.json({
      success: true,
      settings: user.settings,
      message: `${key} updated successfully`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // You can clear token from client side
    // Optional: invalidate session
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change PIN → Redirect logic handled in frontend
const changePin = async (req, res) => {
  res.json({
    success: true,
    message: "Redirecting to PIN reset",
    redirectTo: "/reset"   // or your frontend route
  });
};

module.exports = {
  getSettings,
  updateSetting,
  logout,
  changePin
};