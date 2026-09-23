import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import CallHistoryList from '../calls/CallHistoryList';
import IncomingCallModal from '../call/IncomingCallModal';
import CallScreen from '../call/CallScreen';
import { useAuth } from '../../context/AuthContext';

const ChatApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'calls'
  const [currentContact, setCurrentContact] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      if (!mobile) setShowChatList(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChat = (contactNumber) => {
    setCurrentContact(contactNumber);
    if (isMobileView) setShowChatList(false);
  };

  const handleBackToList = () => {
    setCurrentContact(null);
    setShowChatList(true);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-clay-bg dark:bg-clay-bgDark text-clay-muted dark:text-clay-mutedDark">
        Loading your chats…
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-clay-bg dark:bg-clay-bgDark">
      {(isMobileView ? showChatList : true) && (
        <div className={`${isMobileView ? 'w-full' : 'w-1/3 max-w-md'} ${isMobileView && !showChatList ? 'hidden' : ''} flex flex-col`}>
          <div className="p-3">
            <div className="flex bg-clay-surface dark:bg-clay-surfaceDark rounded-full p-1 shadow-clay-inset dark:shadow-clay-dark-inset">
              {[
                { key: 'chats', label: 'Chats', icon: MessageCircle },
                { key: 'calls', label: 'Calls', icon: Phone },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-shadow ${
                    activeTab === key
                      ? 'bg-clay-primary text-white shadow-clay-sm'
                      : 'text-clay-muted dark:text-clay-mutedDark'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'chats' ? (
              <ChatList onSelectChat={handleSelectChat} />
            ) : (
              <CallHistoryList />
            )}
          </div>
        </div>
      )}

      {(isMobileView ? !showChatList : true) && (
        <div className={`${isMobileView ? 'w-full' : 'w-2/3 flex-1'}`}>
          <ChatWindow
            myNumber={user.phoneNumber}
            currentContact={currentContact}
            onBackToList={handleBackToList}
          />
        </div>
      )}

      <IncomingCallModal />
      <CallScreen />
    </div>
  );
};

export default ChatApp;
