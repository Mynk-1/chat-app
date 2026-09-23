import React, { useState } from 'react';
import { X, UserCircle, MessageCircle, ShieldCheck, Users, Video } from 'lucide-react';
import LoginForm from '../auth/LoginForm';

const features = [
  {
    icon: ShieldCheck,
    title: 'Private by default',
    description: 'Your conversations stay between you and your contacts.',
  },
  {
    icon: Users,
    title: 'Simple contacts',
    description: 'Add people by phone number and start chatting instantly.',
  },
  {
    icon: Video,
    title: 'Audio & video calls',
    description: 'Jump from a chat straight into a call, no extra app needed.',
  },
];

const LandingPage = () => {
  const [showMobileLogin, setShowMobileLogin] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Soft clay background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-clay-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-clay-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-clay-danger/10 blur-3xl" />
      </div>

      <header className="relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-clay-primary shadow-clay-sm flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-clay-text dark:text-clay-textDark">ChatConnect</h1>
            </div>
            <button
              onClick={() => setShowMobileLogin(true)}
              className="md:hidden w-11 h-11 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm flex items-center justify-center text-clay-primary dark:text-clay-primaryDark"
              aria-label="Login"
            >
              <UserCircle size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Login Overlay */}
      <div
        className={`fixed inset-0 bg-clay-bg dark:bg-clay-bgDark z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          showMobileLogin ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            onClick={() => setShowMobileLogin(false)}
            className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm flex items-center justify-center text-clay-text dark:text-clay-textDark mb-8"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <LoginForm />
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-clay-text dark:text-clay-textDark">
              Real-time chat, calls, and contacts — all in one place
            </h2>
            <p className="mt-4 text-lg text-clay-muted dark:text-clay-mutedDark">
              ChatConnect brings instant messaging and WebRTC audio/video calls
              together with a simple, phone-number-based contact list.
            </p>

            <div className="mt-10 space-y-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-center gap-4 p-4 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-clay-primary flex items-center justify-center shadow-clay-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-clay-text dark:text-clay-textDark">{title}</h3>
                    <p className="text-sm text-clay-muted dark:text-clay-mutedDark">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
