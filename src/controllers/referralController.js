const User = require('../models/User');

exports.addReferral = async (newUser, referrerCode) => {
  if (!referrerCode) return newUser;

  const referrer = await User.findOne({ referralCode: referrerCode });
  if (!referrer) return newUser;

  newUser.referredBy = referrer._id;

  // Increase referrer's total referrals count
  referrer.totalReferrals += 1;
  referrer.referralBoost += 1;        // +1 USDT per referral

  await referrer.save();
  await newUser.save();

  console.log(`New referral added. ${referrer.fullName} now has +${referrer.referralBoost} USDT/day boost`);

  return newUser;
};

// Get user's total referral boost
exports.getReferralBoost = async (userId) => {
  const user = await User.findById(userId);
  return user ? user.referralBoost : 0;
};




// exports.getReferralStats = async (req, res) => {
//   const user = await User.findById(req.user.id).populate('referredBy');
//   const directReferrals = await User.countDocuments({ referredBy: user._id });
//   // Level 2, Level 3 logic bhi add kar sakte hain
//   res.json({ referrals: directReferrals, earnings: user.referralEarnings || 0 });
// };