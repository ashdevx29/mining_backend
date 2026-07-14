// controllers/referralController.js
const User = require('../models/User');

exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const directReferrals = await User.find({ referredBy: user._id })
      .select('fullName email createdAt balance')
      .sort({ createdAt: -1 })
      .limit(20);

    // ✅ Web URL banaye (Local + Production)
    const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralLink = `${BASE_URL}/signup?ref=${user.referralCode}`;

    res.json({
      success: true,
      totalReferrals: user.totalReferrals || 0,
      referralMiningBonus: user.referralMiningBonus || 0,
      referralLink,           // ← Ab sahi web link aayega
      referrals: directReferrals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReferralTree = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      level1: user.totalReferrals || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};










// // controllers/referralController.js
// const User = require('../models/User');

// exports.getReferralStats = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const directReferrals = await User.find({ referredBy: user._id })
//       .select('fullName email createdAt balance')
//       .sort({ createdAt: -1 })
//       .limit(20);

//     res.json({
//       success: true,
//       totalReferrals: user.totalReferrals || 0,
//       referralBoost: user.referralBoost || 0,
//       referralLink: `https://t.me/MineBot?start=${user.referralCode}`,
//       referrals: directReferrals
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getReferralTree = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     // You can expand this for full tree if needed
//     res.json({
//       success: true,
//       level1: user.totalReferrals || 0,
//       // level2, level3 logic can be added later
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };