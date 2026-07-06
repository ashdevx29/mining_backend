const User = require('../models/User');
const MiningSession = require('../models/MiningSession');

const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

exports.startMining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });

    if (activeSession) return res.status(400).json({ message: "Mining already active" });

    const session = await MiningSession.create({
      user: user._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + MINING_DURATION),
      reward: user.level * 25 * 8, // 8 hours
      isActive: true
    });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.claimMining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const session = await MiningSession.findOne({ user: user._id, isActive: true });

    if (!session || new Date() < session.endTime) {
      return res.status(400).json({ message: "Mining not completed yet" });
    }

    user.balance += session.reward;
    user.totalMined += session.reward;
    session.isActive = false;
    session.completed = true;

    await user.save();
    await session.save();

    res.json({ success: true, reward: session.reward });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};