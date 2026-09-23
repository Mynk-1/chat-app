import React, { useState, useRef } from 'react';
import { Phone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth.api';

const OTP_LENGTH = 6;

const LoginForm = () => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(phoneNumber);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setOtpDigits(Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || ''));
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== OTP_LENGTH) return;

    setLoading(true);
    setError('');
    try {
      await verifyOtp(phoneNumber, otp);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setError('');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-clay-primary flex items-center justify-center mb-6 shadow-clay-sm">
              {step === 'phone' ? (
                <Phone className="h-8 w-8 text-white" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-clay-text dark:text-clay-textDark mb-2">
              {step === 'phone' ? 'Welcome Back' : 'Verify your number'}
            </h2>
            <p className="text-clay-muted dark:text-clay-mutedDark mb-8">
              {step === 'phone'
                ? 'Sign in with your phone number to continue'
                : `Enter the code sent to ${phoneNumber}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-clay-text dark:text-clay-textDark mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="block w-full px-4 py-3 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-inset dark:shadow-clay-dark-inset
                           text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark
                           focus:outline-none"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-clay-danger dark:text-clay-dangerDark bg-clay-danger/15 px-4 py-2 rounded-clay">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full flex justify-center items-center px-6 py-3 rounded-full
                         text-base font-semibold text-white bg-clay-primary shadow-clay-sm
                         active:shadow-clay-inset disabled:opacity-50 disabled:cursor-not-allowed
                         transition-shadow duration-200"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    className="w-11 h-13 py-2 text-center text-lg font-semibold rounded-clay bg-clay-bg dark:bg-clay-bgDark
                      shadow-clay-inset dark:shadow-clay-dark-inset text-clay-text dark:text-clay-textDark focus:outline-none"
                  />
                ))}
              </div>

              {error && (
                <div className="text-sm text-clay-danger dark:text-clay-dangerDark bg-clay-danger/15 px-4 py-2 rounded-clay">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpDigits.some((d) => !d)}
                className="w-full flex justify-center items-center px-6 py-3 rounded-full
                         text-base font-semibold text-white bg-clay-primary shadow-clay-sm
                         active:shadow-clay-inset disabled:opacity-50 disabled:cursor-not-allowed
                         transition-shadow duration-200"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={handleChangeNumber}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-clay-muted dark:text-clay-mutedDark"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change number
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-clay-muted dark:text-clay-mutedDark">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
