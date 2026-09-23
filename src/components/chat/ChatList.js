import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { EVENTS } from '../../socket/events';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const ChatList = ({ onSelectChat }) => {
  const { contacts, addContact, typingNumbers } = useChat();
  const socket = useSocket();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleResult = (result) => {
      setIsSubmitting(false);
      if (result.status === 'success') {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to add contact');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    };

    socket.on(EVENTS.CONTACT_ADD_RESULT, handleResult);
    return () => socket.off(EVENTS.CONTACT_ADD_RESULT, handleResult);
  }, [socket]);

  const handleAddUser = () => {
    const digits = searchValue.replace(/\D/g, '');
    if (!digits || digits.length < 10) {
      setError('Please enter a valid phone number');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    addContact(digits);
    setSearchValue('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-full max-w-md h-full flex flex-col">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter phone number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-inset dark:shadow-clay-dark-inset
                text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-clay-muted dark:text-clay-mutedDark" />
          </div>
          <button
            onClick={handleAddUser}
            disabled={isSubmitting}
            aria-label="Add contact"
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-clay-primary text-white shadow-clay-sm active:shadow-clay-inset disabled:opacity-50 transition-shadow"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset text-clay-muted dark:text-clay-mutedDark transition-shadow"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {showError && (
          <div className="mt-2 p-2 rounded-clay bg-clay-danger/20 text-clay-danger dark:text-clay-dangerDark text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-2 p-2 rounded-clay bg-clay-secondary/20 text-clay-secondary dark:text-clay-secondaryDark text-sm">
            {successMessage}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {contacts.length > 0 ? (
          contacts.map((chat) => {
            const isTyping = typingNumbers.has(chat.contactNumber);
            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat.contactNumber)}
                className="flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm cursor-pointer"
              >
                <div
                  className="relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: getAvatarColor(chat) }}
                >
                  <span className="text-lg font-semibold">{getInitials(chat)}</span>
                  {chat.online && (
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 bg-clay-secondary border-2 border-clay-surface dark:border-clay-surfaceDark rounded-full"
                      title="Online"
                    />
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-clay-text dark:text-clay-textDark truncate">
                      {getDisplayName(chat)}
                    </h3>
                    <span className="text-xs text-clay-muted dark:text-clay-mutedDark flex-shrink-0 ml-2">
                      {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      isTyping
                        ? 'text-clay-primary dark:text-clay-primaryDark font-medium'
                        : 'text-clay-muted dark:text-clay-mutedDark'
                    }`}
                  >
                    {isTyping ? 'typing…' : chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {chat.unreadMessageCount > 0 && (
                  <div className="ml-2 bg-clay-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {chat.unreadMessageCount}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="p-4 text-clay-muted dark:text-clay-mutedDark text-center">No chats available</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
