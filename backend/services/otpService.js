const otpStore = new Map();

const generateOtp = (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(phone, { otp, expiresAt });
  setTimeout(() => otpStore.delete(phone), 5 * 60 * 1000);
  return otp;
};

const verifyOtp = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return { success: false, message: 'OTP not found' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, message: 'OTP expired' };
  }
  if (record.otp !== otp) return { success: false, message: 'Invalid OTP' };
  otpStore.delete(phone);
  return { success: true, message: 'OTP verified' };
};

module.exports = { generateOtp, verifyOtp };
