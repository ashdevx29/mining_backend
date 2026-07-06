const nodemailer = require('nodemailer');

const sendOtp = async (email, otp) => {
  try {
    console.log(`Attempting to send OTP to: ${email}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false   // ← Yeh add karo
      }
    });

    const info = await transporter.sendMail({
      from: `"Crypto App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code - Crypto App',
      html: `
        <h2>Your OTP is: <strong>${otp}</strong></h2>
        <p>This OTP is valid for 1 minute only.</p>
      `,
    });

    console.log(`✅ OTP Sent Successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    console.error("Full Error:", error);
    throw error;
  }
};

module.exports = sendOtp;



