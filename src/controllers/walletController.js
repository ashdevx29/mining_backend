// controllers/walletController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');   // New Model

// Connect Wallet
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.walletAddress = walletAddress;
    await user.save();

    res.json({ 
      success: true, 
      message: "Wallet connected successfully", 
      walletAddress 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        _id: tx._id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        createdAt: tx.createdAt,
        label: tx.label || 'Transaction'
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== NEW WITHDRAW FUNCTIONS ====================

// Create Withdrawal
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, address } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validations
    if (!amount || amount < 500) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is 500 MINE" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Wallet address is required" });
    }
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const fee = Math.floor(amount * 0.05); // 5% fee
    const netAmount = amount - fee;

    // Create Withdrawal
    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      fee,
      netAmount,
      address,
      status: 'pending'
    });

    // Deduct balance from user
    user.balance -= amount;
    await user.save();

    // Optional: Create Transaction Record
    await Transaction.create({
      user: userId,
      type: 'debit',
      amount,
      description: `Withdrawal to ${address.substring(0, 8)}...`,
      label: 'Withdrawal'
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Withdrawal History
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      withdrawals
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};













// // controllers/walletController.js
// const User = require('../models/User');
// const Transaction = require('../models/Transaction'); // Create this model if needed

// exports.connectWallet = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     const user = await User.findById(req.user.id);

//     user.walletAddress = walletAddress;
//     await user.save();

//     res.json({ success: true, message: "Wallet connected", walletAddress });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ user: req.user.id })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     res.json({
//       success: true,
//       transactions: transactions.map(tx => ({
//         _id: tx._id,
//         type: tx.type,
//         amount: tx.amount,
//         description: tx.description,
//         createdAt: tx.createdAt,
//         label: tx.label || 'Transaction'
//       }))
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getTransactions = async (req, res) => {
//   try {
//     // Mock or real transactions
//     res.json({
//       success: true,
//       transactions: [
//         { id: 1, type: "mining", amount: 200, time: "2h ago" },
//         // ...
//       ]
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };