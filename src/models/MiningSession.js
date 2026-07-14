// models/MiningSession.js
const mongoose = require('mongoose');

const miningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  baseReward: { type: Number, default: 1 },
  referralBonus: { type: Number, default: 0 },
  totalReward: { type: Number },
  isActive: { type: Boolean, default: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MiningSession', miningSchema);


// const mongoose = require('mongoose');

// const miningSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   startTime: Date,
//   endTime: Date,
//   reward: Number,
//   isActive: Boolean,
//   completed: { type: Boolean, default: false }
// });

// module.exports = mongoose.model('MiningSession', miningSchema);