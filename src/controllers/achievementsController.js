// controllers/achievementsController.js
const User = require('../models/User');

const ALL_ACHIEVEMENTS = [
  { id: 'first_mine', title: 'First Mine', xp: 100 },
  // ... add all from frontend
];

exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      achievements: ALL_ACHIEVEMENTS,
      unlocked: user.achievements || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};