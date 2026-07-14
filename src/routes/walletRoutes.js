// routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/auth');

// Existing Routes
router.post('/connect', authMiddleware, walletController.connectWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);

// New Withdraw Routes
router.post('/withdraw', authMiddleware, walletController.createWithdrawal);
router.get('/withdrawals', authMiddleware, walletController.getWithdrawals);

module.exports = router;


// // routes/walletRoutes.js
// const express = require('express');
// const router = express.Router();
// const walletController = require('../controllers/walletController');
// const { authMiddleware } = require('../middleware/auth');

// router.post('/connect', authMiddleware, walletController.connectWallet);
// router.get('/transactions', authMiddleware, walletController.getTransactions);

// module.exports = router;