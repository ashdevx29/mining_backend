const User = require('../models/User');
const MiningSession = require('../models/MiningSession');

const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

exports.startMining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });

    if (activeSession) return res.status(400).json({ message: "Mining already active" });

    const todayDate = new Date().toISOString().split('T')[0];
    if (user.lastMiningDate === todayDate) {
      return res.status(400).json({ message: "You have already started mining today. Come back tomorrow!" });
    }

    // Reward: 1 USDT base + 1 USDT per 3-level referral
    const baseReward = 1;
    const referralBonus = user.totalReferrals;
    const totalReward = baseReward + referralBonus;

    const session = await MiningSession.create({
      user: user._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + MINING_DURATION),
      reward: totalReward,
      isActive: true
    });

    user.lastMiningDate = todayDate;
    await user.save();

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

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const session = await MiningSession.findOne({ user: user._id, isActive: true });

    if (!session) {
      return res.json({ success: true, session: null });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};