import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send, Phone, Video } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { EVENTS } from '../../socket/events';
import * as messageApi from '../../api/message.api';
import ContactProfilePanel from './ContactProfilePanel';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const TYPING_STOP_DELAY_MS = 2000;

const ChatWindow = ({ currentContact, myNumber, onBackToList }) => {
  const socket = useSocket();
  const { contacts, updateContactProfile, typingNumbers } = useChat();
  const { startCall, callState } = useCall();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const contact = contacts.find((c) => c.contactNumber === currentContact) || {
    contactNumber: currentContact,
  };
  const isContactTyping = typingNumbers.has(currentContact);

  const stopTyping = () => {
    if (isTypingRef.current) {
      socket?.emit(EVENTS.TYPING_STOP, { recipient: currentContact });
      isTypingRef.current = false;
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !currentContact) return;

    if (!isTypingRef.current) {
      socket.emit(EVENTS.TYPING_START, { recipient: currentContact });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !currentContact || !socket) return;
    socket.emit(EVENTS.MESSAGE_SEND, { recipient: currentContact, content: newMessage.trim() });
    setNewMessage('');
    stopTyping();
  };

  // Load history + mark the thread read whenever a different chat is opened.
  useEffect(() => {
    if (!currentContact || !socket) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const { data } = await messageApi.getMessages(currentContact);
        if (!cancelled) setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    loadMessages();

    socket.emit(EVENTS.CHAT_OPEN, { contactNumber: currentContact });

    const handleNewMessage = (message) => {
      const belongsToThisChat =
        (message.sender === currentContact && message.recipient === myNumber) ||
        (message.sender === myNumber && message.recipient === currentContact);
      if (belongsToThisChat) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on(EVENTS.MESSAGE_NEW, handleNewMessage);

    return () => {
      cancelled = true;
      socket.off(EVENTS.MESSAGE_NEW, handleNewMessage);
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContact, socket, myNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!currentContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-clay-bg dark:bg-clay-bgDark">
        <div className="text-center text-clay-muted dark:text-clay-mutedDark">
          <p className="text-xl">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-clay-bg dark:bg-clay-bgDark">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 p-3">
        <div className="flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm">
          <button onClick={onBackToList} className="mr-3 md:hidden" aria-label="Back to chat list">
            <ArrowLeft className="h-6 w-6 text-clay-text dark:text-clay-textDark" />
          </button>

          <button onClick={() => setShowProfile(true)} className="flex items-center flex-1 min-w-0 text-left">
            <div
              className="relative w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: getAvatarColor(contact) }}
            >
              {getInitials(contact)}
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-clay-secondary border-2 border-clay-surface dark:border-clay-surfaceDark rounded-full" />
              )}
            </div>
            <div className="ml-3 min-w-0">
              <h2 className="text-base font-semibold text-clay-text dark:text-clay-textDark truncate">
                {getDisplayName(contact)}
              </h2>
              <p className="text-xs text-clay-muted dark:text-clay-mutedDark">
                {isContactTyping ? 'typing…' : contact.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => callState === 'idle' && startCall(currentContact, 'audio')}
              aria-label="Start audio call"
              className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset flex items-center justify-center text-clay-primary dark:text-clay-primaryDark"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              onClick={() => callState === 'idle' && startCall(currentContact, 'video')}
              aria-label="Start video call"
              className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset flex items-center justify-center text-clay-primary dark:text-clay-primaryDark"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
        {messages.map((message) => (
          <div key={message._id} className={`flex ${message.sender === myNumber ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-clay px-4 py-2 shadow-clay-sm ${
                message.sender === myNumber
                  ? 'bg-clay-primary text-white dark:shadow-clay-dark-sm'
                  : 'bg-clay-surface text-clay-text dark:bg-clay-surfaceDark dark:text-clay-textDark dark:shadow-clay-dark-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span
                className={`text-xs mt-1 block ${
                  message.sender === myNumber ? 'text-white/70' : 'text-clay-muted dark:text-clay-mutedDark'
                }`}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isContactTyping && (
          <div className="flex justify-start">
            <div className="rounded-clay px-4 py-2 shadow-clay-sm bg-clay-surface dark:bg-clay-surfaceDark dark:shadow-clay-dark-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-clay-muted dark:bg-clay-mutedDark animate-bounce" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-inset dark:shadow-clay-dark-inset
              text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark
              focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            aria-label="Send message"
            className="w-12 h-12 rounded-full bg-clay-primary text-white shadow-clay-sm active:shadow-clay-inset
              flex items-center justify-center flex-shrink-0
              disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showProfile && (
        <ContactProfilePanel
          contact={contact}
          onClose={() => setShowProfile(false)}
          onSave={updateContactProfile}
        />
      )}
    </div>
  );
};

export default ChatWindow;
