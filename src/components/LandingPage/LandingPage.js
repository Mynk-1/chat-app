import React, { useState } from 'react';
import { X, UserCircle } from 'lucide-react';
import LoginForm from '../Auth/LoginForm';
import background from "../../assets/background1.jpg"
const LandingPage = () => {
  const [showMobileLogin, setShowMobileLogin] = useState(false);

  const handleLoginClick = () => {
    setShowMobileLogin(true);
  };

  const handleClose = () => {
    setShowMobileLogin(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Login Icon */}
      <header className="bg-white border-b relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-indigo-600">ChatConnect</h1>
            <button
              onClick={handleLoginClick}
              className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
              aria-label="Login"
            >
              <UserCircle size={28} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow relative">
        {/* Mobile Login Form Overlay */}
        <div 
          className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
            showMobileLogin ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
            >
              <X size={24} />
            </button>
            <div className="mt-12">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`relative ${showMobileLogin ? 'hidden md:block' : ''}`}>
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
             backgroundImage: `url(${background})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-white/90"></div>
          </div>

          {/* Hero Section */}
          <main className="relative z-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Content */}
              <div className="text-left">
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/768px-WhatsApp.svg.png?20220228223904"
                    alt="WhatsApp Logo"
                    className="w-16 h-16"
                  />
                  <h2 className="text-4xl tracking-tight font-extrabold text-gray-900">
                    Real-Time Chat Platform
                  </h2>
                </div>
                <p className="mt-3 text-base text-gray-500 sm:text-lg md:text-xl">
                  Connect with friends, family, and colleagues instantly through our secure 
                  real-time messaging platform. Experience seamless communication with 
                  features like instant messaging, file sharing, and voice calls.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        ✓
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">End-to-End Encryption</h3>
                      <p className="mt-1 text-gray-500">Your messages are secure and private</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        ✓
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Group Chats</h3>
                      <p className="mt-1 text-gray-500">Create and manage group conversations</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        ✓
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">File Sharing</h3>
                      <p className="mt-1 text-gray-500">Share documents, images, and videos instantly</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Login Form (Desktop only) */}
              <div className="hidden md:block mt-8 md:mt-0">
                <LoginForm />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;