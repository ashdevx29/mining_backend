require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/mining', require('./src/routes/miningRoutes'));  
app.use('/api/referral', require('./src/routes/referralRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/daily', require('./src/routes/dailyRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/achievements', require('./src/routes/achievementsRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
// app.use('/api/notifications', require('./src/routes/notificationsRoutes'));


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

