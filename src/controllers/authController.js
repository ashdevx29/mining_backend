const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');

// Temporary OTP Store (Production mein Redis use karein)
const otpStore = new Map();

const authController = {
  
  // ====================== SIGNUP ======================
  async signup(req, res) {
    try {
      const { fullName, email, phone, password, referralCode } = req.body;

      if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate a unique referral code for the new user
      const crypto = require('crypto');
      const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase() + Math.floor(Math.random() * 1000);

      // Referral logic
      let referredBy = null;
      let level1Referrer = null;
      let level2Referrer = null;
      let level3Referrer = null;

      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = referrer._id;
          level1Referrer = referrer._id;
          level2Referrer = referrer.level1Referrer;
          level3Referrer = referrer.level2Referrer;

          // Increase totalReferrals count for all 3 levels
          referrer.totalReferrals += 1;
          await referrer.save();

          if (level2Referrer) {
            await User.findByIdAndUpdate(level2Referrer, { $inc: { totalReferrals: 1 } });
          }
          if (level3Referrer) {
            await User.findByIdAndUpdate(level3Referrer, { $inc: { totalReferrals: 1 } });
          }
        }
      }

      await User.create({
        fullName,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy,
        level1Referrer,
        level2Referrer,
        level3Referrer
      });

      res.status(201).json({
        success: true,
        message: "Account created successfully!"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ====================== LOGIN (Send OTP) ======================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email.toLowerCase(), { 
        otp, 
        expires: Date.now() + 60000 // 60 seconds
      });

      await sendOtp(email, otp);

      res.json({ success: true, message: "OTP sent successfully to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ====================== VERIFY OTP ======================

  // ====================== VERIFY OTP (Dono flows ke liye) ======================
// async verifyOtp(req, res) {
//   try {
//     const { email, otp } = req.body;
//     const storedData = otpStore.get(email.toLowerCase());

//     if (!storedData || Date.now() > storedData.expires) {
//       return res.status(400).json({ success: false, message: "OTP has expired" });
//     }

//     if (storedData.otp !== otp) {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     // Token generate karo (dono flows ke liye)
//     const token = jwt.sign(
//       { id: email.toLowerCase() }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: '7d' }
//     );

//     // ❌ Yahan delete MAT karo
//     // otpStore.delete(email.toLowerCase());

//     res.json({
//       success: true,
//       message: "OTP verified successfully",
//       token
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// },

// ====================== VERIFY OTP ======================
async verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData || Date.now() > storedData.expires) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ User ko find karo aur uska _id use karo
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    otpStore.delete(email.toLowerCase());   // Login ke liye delete

    res.json({
      success: true,
      message: "Login successful",
      token,
      user   // ← User data bhi return karo taaki /me call na karni pade
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
},



  // ====================== FORGOT PASSWORD (Send Reset OTP) ======================
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(400).json({ success: false, message: "No account found with this email" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 60000 });

      await sendOtp(email, otp);

      res.json({ success: true, message: "Reset OTP sent to your email" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // ====================== RESET PASSWORD ======================
  // async resetPassword(req, res) {
  //   try {
  //     const { email, otp, newPassword } = req.body;

  //     const storedData = otpStore.get(email.toLowerCase());
  //     if (!storedData || Date.now() > storedData.expires || storedData.otp !== otp) {
  //       return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  //     }

  //     const user = await User.findOne({ email: email.toLowerCase() });
  //     if (!user) {
  //       return res.status(400).json({ success: false, message: "User not found" });
  //     }

  //     const salt = await bcrypt.genSalt(10);
  //     user.password = await bcrypt.hash(newPassword, salt);
  //     await user.save();

  //     otpStore.delete(email.toLowerCase());

  //     res.json({ success: true, message: "Password reset successful. Please login again." });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },
  async resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const storedData = otpStore.get(email.toLowerCase());
    if (!storedData || Date.now() > storedData.expires || storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // ✅ Yahan delete karo
    otpStore.delete(email.toLowerCase());

    res.json({ success: true, message: "Password reset successful. Please login again." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
},

  // ====================== GET ME ======================
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = authController;