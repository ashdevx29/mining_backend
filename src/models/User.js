// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  email: { type: String, unique: true, lowercase: true, sparse: true },
  phone: String,
  password: String,
  referralCode: { type: String, unique: true },
  // models/User.js me add karo
  referralMiningBonus: { type: Number, default: 0 }, // Total extra USDT per mining
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level1Referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level2Referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level3Referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  totalReferrals: { type: Number, default: 0 },
  referralBoost: { type: Number, default: 0 }, // For mining bonus

  balance: { type: Number, default: 0 },
  totalMined: { type: Number, default: 0 },

  dailyStreak: { type: Number, default: 0 },
  lastCheckin: Date,
  lastMiningDate: String, // "YYYY-MM-DD"

  walletAddress: String,
  achievements: [{ type: String }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);



