import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Phone, Send } from 'lucide-react';

function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5) inputRefs.current[index]?.blur();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      setMessage('Valid phone number required');
      setMessageType('error');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { phone });
      setMessage('✅ OTP sent successfully!');
      setMessageType('success');
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Error sending OTP'));
      setMessageType('error');
    }
    setIsLoading(false);
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Enter complete 6-digit OTP');
      setMessageType('error');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phone,
        otp: otpString,
      });
      
      setMessage('✅ Login successful!');
      setMessageType('success');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('phone', phone);
      localStorage.setItem('deviceId', 'web-' + Date.now());
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Invalid OTP'));
      setMessageType('error');
      document.querySelector('.otp-container')?.classList.add('shake');
      setTimeout(() => {
        document.querySelector('.otp-container')?.classList.remove('shake');
      }, 500);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-4xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ChatWave</h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 'phone' ? 'Enter your phone number' : 'Enter the 6-digit code'}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 text-white rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                maxLength="15"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-slate-400 text-sm">
              Enter OTP sent to <span className="text-white font-medium">{phone}</span>
            </p>
            <div className="otp-container flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-700/50 text-white rounded-xl border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              ))}
            </div>
            <button
              onClick={verifyOtp}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={() => {
                setStep('phone');
                setMessage('');
                setMessageType('');
                setOtp(['', '', '', '', '', '']);
              }}
              className="w-full text-slate-400 hover:text-white text-sm transition text-center"
            >
              ← Change phone number
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-4 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
              messageType === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .otp-container.shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
