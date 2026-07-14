// controllers/dailyCheckinController.js
const User = require('../models/User');

const DAILY_REWARDS = [50, 100, 150, 200, 300, 400, 1000];

exports.claimDaily = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().toDateString();

    if (user.lastCheckin && new Date(user.lastCheckin).toDateString() === today) {
      return res.status(400).json({ success: false, message: "Already claimed today" });
    }

    const day = (user.dailyStreak || 0) % 7;
    const reward = DAILY_REWARDS[day];

    user.balance += reward;
    user.dailyStreak = (user.dailyStreak || 0) + 1;
    user.lastCheckin = new Date();

    await user.save();

    res.json({
      success: true,
      message: "Daily reward claimed",
      reward,
      streak: user.dailyStreak
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      streak: user.dailyStreak || 0,
      lastCheckin: user.lastCheckin
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};