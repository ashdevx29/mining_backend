// controllers/taskController.js
const User = require('../models/User');

const TASKS = [
  { id: 1, title: "Join Telegram Channel", reward: 50, type: "social" },
  { id: 2, title: "Follow on X", reward: 30, type: "social" },
  // Add more
];

exports.getTasks = async (req, res) => {
  try {
    res.json({ success: true, tasks: TASKS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const user = await User.findById(req.user.id);

    // Add task completion logic + reward
    user.balance += 50; // example
    await user.save();

    res.json({ success: true, message: "Task completed", reward: 50 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};