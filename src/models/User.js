const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, lowercase: true },
  phone: String,
  password: String,
  referralCode: { type: String, unique: true },

  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // All referrals (Level 1 + 2 + 3)
  totalReferrals: { type: Number, default: 0 },

  // Daily Mining Boost
  referralBoost: { type: Number, default: 0 }, // +1 USDT per referral

  balance: { type: Number, default: 0 },
  totalMined: { type: Number, default: 0 },

  dailyStreak: { type: Number, default: 0 },
  lastCheckin: Date,
  level: { type: Number, default: 1 },

  walletAddress: String,
  achievements: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: String,
//   email: { type: String, unique: true, lowercase: true },
//   phone: String,
//   password: String,
//   referralCode: { type: String, unique: true },
//   referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   balance: { type: Number, default: 0 },
//   totalMined: { type: Number, default: 0 },
//   referrals: { type: Number, default: 0 },
//   dailyStreak: { type: Number, default: 0 },
//   lastCheckin: Date,
//   level: { type: Number, default: 1 },
//   walletAddress: String,
//   achievements: [String],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('User', userSchema);








// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true, trim: true },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true, 
//     lowercase: true 
//   },
//   phone: { type: String, required: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('User', userSchema);