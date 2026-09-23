import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(phoneNumber);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-clay-primary flex items-center justify-center mb-6 shadow-clay-sm">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-clay-text dark:text-clay-textDark mb-2">Welcome Back</h2>
            <p className="text-clay-muted dark:text-clay-mutedDark mb-8">
              Sign in with your phone number to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
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
