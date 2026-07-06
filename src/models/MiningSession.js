const mongoose = require('mongoose');

const miningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Date,
  endTime: Date,
  reward: Number,
  isActive: Boolean,
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('MiningSession', miningSchema);