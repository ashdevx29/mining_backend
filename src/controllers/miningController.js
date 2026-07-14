// controllers/miningController.js
const User = require('../models/User');
const MiningSession = require('../models/MiningSession');

const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

const getReferralBonus = async (userId) => {
  const user = await User.findById(userId);
  return user?.totalReferrals || 0;
};

exports.startMining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });
    if (activeSession) {
      return res.status(400).json({ success: false, message: "Mining already active" });
    }

    const today = new Date().toISOString().split('T')[0];
    if (user.lastMiningDate === today) {
      return res.status(400).json({ success: false, message: "You have already mined today" });
    }

    const session = await MiningSession.create({
      user: user._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + MINING_DURATION),
      baseReward: 1,
      isActive: true,
      completed: false
    });

    user.lastMiningDate = today;
    await user.save();

    res.json({ success: true, message: "Mining started successfully", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.claimMining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const session = await MiningSession.findOne({ user: user._id, isActive: true });

    if (!session || new Date() < session.endTime) {
      return res.status(400).json({ success: false, message: "Mining not completed yet" });
    }

    const referralBonus = await getReferralBonus(user._id);
    const totalReward = session.baseReward + referralBonus;

    user.balance += totalReward;
    user.totalMined += totalReward;

    session.isActive = false;
    session.completed = true;
    session.referralBonus = referralBonus;
    session.totalReward = totalReward;

    await Promise.all([user.save(), session.save()]);

    res.json({
      success: true,
      message: "Reward claimed successfully",
      reward: totalReward
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const session = await MiningSession.findOne({ 
      user: req.user.id, 
      isActive: true 
    });

    if (!session) {
      return res.json({ success: true, session: null });
    }

    const now = Date.now();
    const startTime = new Date(session.startTime).getTime();
    const elapsed = now - startTime;
    const duration = MINING_DURATION;
    const progress = Math.min((elapsed / duration) * 100, 100);
    const canClaim = progress >= 100;

    // Real-time earned amount
    const totalReward = session.totalReward || (session.baseReward + (session.referralBonus || 0));
    const earnedSoFar = Math.floor((progress / 100) * totalReward);

    res.json({
      success: true,
      session: {
        ...session.toObject(),
        duration: MINING_DURATION,
        progress: Math.floor(progress),
        canClaim,
        earnedSoFar,        // ← Real-time earning
        totalReward
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};









// // controllers/miningController.js
// const User = require('../models/User');
// const MiningSession = require('../models/MiningSession');

// const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// // Get total referral bonus (Level 1-3)
// const getReferralBonus = async (userId) => {
//   const user = await User.findById(userId);
//   return user?.totalReferrals || 0; // You can enhance with level-wise later
// };

// exports.startMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });
//     if (activeSession) {
//       return res.status(400).json({ success: false, message: "Mining already active" });
//     }

//     const today = new Date().toISOString().split('T')[0];
//     if (user.lastMiningDate === today) {
//       return res.status(400).json({ success: false, message: "You have already mined today" });
//     }

//     const session = await MiningSession.create({
//       user: user._id,
//       startTime: new Date(),
//       endTime: new Date(Date.now() + MINING_DURATION),
//       baseReward: 1,
//       isActive: true,
//       completed: false
//     });

//     user.lastMiningDate = today;
//     await user.save();

//     res.json({ success: true, message: "Mining started successfully", session });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.claimMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const session = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (!session || new Date() < session.endTime) {
//       return res.status(400).json({ success: false, message: "Mining not completed yet" });
//     }

//     const referralBonus = await getReferralBonus(user._id);
//     const totalReward = session.baseReward + referralBonus;

//     user.balance += totalReward;
//     user.totalMined += totalReward;

//     session.isActive = false;
//     session.completed = true;
//     session.referralBonus = referralBonus;
//     session.totalReward = totalReward;

//     await Promise.all([user.save(), session.save()]);

//     res.json({
//       success: true,
//       message: "Reward claimed successfully",
//       reward: totalReward
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getStatus = async (req, res) => {
//   try {
//     const session = await MiningSession.findOne({ 
//       user: req.user.id, 
//       isActive: true 
//     });

//     if (!session) {
//       return res.json({ success: true, session: null });
//     }

//     const now = Date.now();
//     const elapsed = now - new Date(session.startTime).getTime();
//     const progress = Math.min((elapsed / MINING_DURATION) * 100, 100);
//     const canClaim = progress >= 100;

//     res.json({
//       success: true,
//       session: {
//         ...session.toObject(),
//         duration: MINING_DURATION,
//         progress: Math.floor(progress),
//         canClaim
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




// const User = require('../models/User');
// const MiningSession = require('../models/MiningSession');

// const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// exports.startMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const activeSession = await MiningSession.findOne({ 
//       user: user._id, 
//       isActive: true 
//     });
//     if (activeSession) {
//       return res.status(400).json({ success: false, message: "Mining already active" });
//     }

//     const todayDate = new Date().toISOString().split('T')[0];
//     if (user.lastMiningDate === todayDate) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "You have already started mining today. Come back tomorrow!" 
//       });
//     }

//     // Reward: 1 base + 1 per referral (adjust logic if needed)
//     const baseReward = 1;
//     const referralBonus = user.totalReferrals || 0;
//     const totalReward = baseReward + referralBonus;

//     const session = await MiningSession.create({
//       user: user._id,
//       startTime: new Date(),
//       endTime: new Date(Date.now() + MINING_DURATION),
//       reward: totalReward,
//       isActive: true,
//       completed: false
//     });

//     user.lastMiningDate = todayDate;
//     await user.save();

//     res.json({
//       success: true,
//       message: "Mining started successfully",
//       session
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.claimMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const session = await MiningSession.findOne({ 
//       user: user._id, 
//       isActive: true 
//     });

//     if (!session || new Date() < session.endTime) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Mining not completed yet" 
//       });
//     }

//     user.balance = (user.balance || 0) + session.reward;
//     user.totalMined = (user.totalMined || 0) + session.reward;

//     session.isActive = false;
//     session.completed = true;

//     await Promise.all([user.save(), session.save()]);

//     res.json({
//       success: true,
//       message: "Reward claimed successfully",
//       reward: session.reward
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const session = await MiningSession.findOne({ 
//       user: user._id, 
//       isActive: true 
//     });

//     if (!session) {
//       return res.json({ success: true, session: null });
//     }

//     res.json({
//       success: true,
//       session: {
//         ...session.toObject(),
//         duration: MINING_DURATION
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




// // controllers/miningController.js
// const User = require('../models/User');
// const MiningSession = require('../models/MiningSession');

// const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// exports.startMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });
//     if (activeSession) return res.status(400).json({ message: "Mining already active" });

//     const todayDate = new Date().toISOString().split('T')[0];
//     if (user.lastMiningDate === todayDate) {
//       return res.status(400).json({ message: "You have already started mining today. Come back tomorrow!" });
//     }

//     // Reward Logic
//     const baseReward = 1;
//     const referralBonus = user.totalReferrals || 0;        // +1 USDT per referral
//     const totalReward = baseReward + referralBonus;

//     const session = await MiningSession.create({
//       user: user._id,
//       startTime: new Date(),
//       endTime: new Date(Date.now() + MINING_DURATION),
//       reward: totalReward,
//       isActive: true,
//       completed: false
//     });

//     user.lastMiningDate = todayDate;
//     await user.save();

//     res.json({ 
//       success: true, 
//       message: "Mining started successfully",
//       session 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.claimMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const session = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (!session || new Date() < session.endTime) {
//       return res.status(400).json({ message: "Mining not completed yet" });
//     }

//     user.balance += session.reward;
//     user.totalMined += session.reward;

//     session.isActive = false;
//     session.completed = true;

//     await Promise.all([user.save(), session.save()]);

//     res.json({ 
//       success: true, 
//       message: "Reward claimed successfully",
//       reward: session.reward 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const session = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (!session) {
//       return res.json({ success: true, session: null });
//     }

//     res.json({ 
//       success: true, 
//       session: {
//         ...session.toObject(),
//         duration: MINING_DURATION
//       } 
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };







// const User = require('../models/User');
// const MiningSession = require('../models/MiningSession');

// const MINING_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// exports.startMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const activeSession = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (activeSession) return res.status(400).json({ message: "Mining already active" });

//     const todayDate = new Date().toISOString().split('T')[0];
//     if (user.lastMiningDate === todayDate) {
//       return res.status(400).json({ message: "You have already started mining today. Come back tomorrow!" });
//     }

//     // Reward: 1 USDT base + 1 USDT per 3-level referral
//     const baseReward = 1;
//     const referralBonus = user.totalReferrals;
//     const totalReward = baseReward + referralBonus;

//     const session = await MiningSession.create({
//       user: user._id,
//       startTime: new Date(),
//       endTime: new Date(Date.now() + MINING_DURATION),
//       reward: totalReward,
//       isActive: true
//     });

//     user.lastMiningDate = todayDate;
//     await user.save();

//     res.json({ success: true, session });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.claimMining = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const session = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (!session || new Date() < session.endTime) {
//       return res.status(400).json({ message: "Mining not completed yet" });
//     }

//     user.balance += session.reward;
//     user.totalMined += session.reward;
//     session.isActive = false;
//     session.completed = true;

//     await user.save();
//     await session.save();

//     res.json({ success: true, reward: session.reward });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// exports.getStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const session = await MiningSession.findOne({ user: user._id, isActive: true });

//     if (!session) {
//       return res.json({ success: true, session: null });
//     }

//     res.json({ 
//       success: true, 
//       session: {
//         ...session.toObject(),
//         duration: 8 * 60 * 60 * 1000   // 8 hours in ms
//       } 
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // exports.getStatus = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id);
// //     const session = await MiningSession.findOne({ user: user._id, isActive: true });

// //     if (!session) {
// //       return res.json({ success: true, session: null });
// //     }

// //     res.json({ success: true, session });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };