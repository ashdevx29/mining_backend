const User = require('../models/User');
const MiningSession = require('../models/MiningSession');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeMiningSessions = await MiningSession.countDocuments({ isActive: true });
    
    // Calculate total mined by aggregating all completed sessions
    const completedSessions = await MiningSession.find({ completed: true });
    const totalMined = completedSessions.reduce((acc, curr) => acc + curr.reward, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeMiningSessions,
        totalMined
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
