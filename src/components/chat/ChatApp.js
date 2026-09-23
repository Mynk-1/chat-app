import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import IncomingCallModal from '../call/IncomingCallModal';
import CallScreen from '../call/CallScreen';
import Toast from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const ChatApp = () => {
  const { user } = useAuth();
  const { currentChat, selectChat, closeChat } = useChat();
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

  const handleSelectChat = (chat) => {
    selectChat(chat);
    if (isMobileView) setShowChatList(false);
  };

  const handleBackToList = () => {
    closeChat();
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
        <div
          className={`${isMobileView ? 'w-full' : 'w-1/3 max-w-md border-r border-clay-muted/20 dark:border-clay-mutedDark/20'} ${
            isMobileView && !showChatList ? 'hidden' : ''
          } flex flex-col`}
        >
          <ChatList onSelectChat={handleSelectChat} />
        </div>
      )}

      {(isMobileView ? !showChatList : true) && (
        <div className={`${isMobileView ? 'w-full' : 'w-2/3 flex-1'}`}>
          <ChatWindow currentChat={currentChat} onBackToList={handleBackToList} />
        </div>
      )}

      <IncomingCallModal />
      <CallScreen />
      <Toast />
    </div>
  );
};

export default ChatApp;
