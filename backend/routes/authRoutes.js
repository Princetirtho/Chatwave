const express = require('express');
const router = express.Router();
const { generateOtp, verifyOtp } = require('../services/otpService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../src/models');

router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) return res.status(400).json({ error: 'Valid phone required' });
  const otp = generateOtp(phone);
  console.log(`📱 OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const result = verifyOtp(phone, otp);
  if (!result.success) return res.status(400).json({ error: result.message });
  
  let user = await User.findOne({ where: { phone } });
  if (!user) {
    user = await User.create({ phone, name: `User_${phone.slice(-4)}` });
  }
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  
  user.publicKey = publicKey;
  user.privateKey = privateKey;
  await user.save();
  
  const token = jwt.sign({ userId: user.id, phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ 
    success: true, 
    token, 
    user: { id: user.id, phone: user.phone, name: user.name },
    publicKey,
    privateKey
  });
});

module.exports = router;
