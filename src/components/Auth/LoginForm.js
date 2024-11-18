import React, { useContext, useState } from 'react';
import { Phone } from 'lucide-react';
import { ContactContext } from '../../Context/ContactContext';
import { useNavigate} from "react-router-dom"

const LoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const navigate = useNavigate();


  const { setUserDetails } = useContext(ContactContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      const response = await fetch('https://chat-app-backend-weld-two.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber
          
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setUserDetails(data.user)
      navigate("/chat");

    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center  ">
      <div className="max-w-md w-full mx-4 transform transition-all hover:scale-[1.01] duration-300">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 transform transition-transform hover:rotate-12 duration-300">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600 mb-8">
                Sign in with your phone number to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl
                         text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500
                         hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 transform hover:scale-[1.02]"
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
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;