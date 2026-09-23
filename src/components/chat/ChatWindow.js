import React, { useEffect, useState, useRef } from 'react';
import { List, useDynamicRowHeight, useListRef } from 'react-window';
import { ArrowLeft, Send, Phone, Video, Users, MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { EVENTS } from '../../socket/events';
import * as messageApi from '../../api/message.api';
import ContactProfilePanel from './ContactProfilePanel';
import MessageRow from './MessageRow';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

const TYPING_STOP_DELAY_MS = 2000;
const DEFAULT_MESSAGE_ROW_HEIGHT = 64;

const ChatWindow = ({ currentChat, onBackToList }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const myNumber = user?.phoneNumber;
  const { chats, updateContactProfile, typingNumbers } = useChat();
  const { startCall, callState } = useCall();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const listRef = useListRef(null);

  const isGroup = currentChat?.type === 'group';
  const chatKey = isGroup ? currentChat?.groupId : currentChat?.contactNumber;

  // Prefer the live entry from the chats list (has nickname/avatar/online),
  // falling back to whatever selectChat was given (e.g. a fresh search
  // result that isn't in the persisted list yet).
  const contact =
    (!isGroup && chats.find((c) => c.type === 'contact' && c.contactNumber === chatKey)) ||
    currentChat || { contactNumber: chatKey };

  const isContactTyping = !isGroup && typingNumbers.has(chatKey);
  const rowCount = messages.length + (isContactTyping ? 1 : 0);
  // Resets the measured-height cache when switching chats — different
  // conversations have completely different message content/heights.
  const dynamicRowHeight = useDynamicRowHeight({ defaultRowHeight: DEFAULT_MESSAGE_ROW_HEIGHT, key: chatKey });

  const stopTyping = () => {
    if (isTypingRef.current) {
      socket?.emit(EVENTS.TYPING_STOP, { recipient: chatKey });
      isTypingRef.current = false;
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !chatKey || isGroup) return;

    if (!isTypingRef.current) {
      socket.emit(EVENTS.TYPING_START, { recipient: chatKey });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !chatKey || !socket) return;
    const payload = isGroup ? { groupId: chatKey, content: newMessage.trim() } : { recipient: chatKey, content: newMessage.trim() };
    socket.emit(EVENTS.MESSAGE_SEND, payload);
    setNewMessage('');
    stopTyping();
  };

  // Load history whenever a different chat is opened. (chat:open/close are
  // emitted by ChatContext.selectChat/closeChat, not here.)
  useEffect(() => {
    if (!chatKey || !socket) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const { data } = isGroup
          ? await messageApi.getGroupMessages(chatKey)
          : await messageApi.getMessages(chatKey);
        if (!cancelled) setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    loadMessages();

    const handleNewMessage = (message) => {
      const belongsToThisChat = isGroup
        ? message.groupId === chatKey
        : (message.sender === chatKey && message.recipient === myNumber) ||
          (message.sender === myNumber && message.recipient === chatKey);
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
  }, [chatKey, isGroup, socket, myNumber]);

  // Dynamic-height rows are measured after render, so the target row's exact
  // position can shift right after this fires — a second call on the next
  // frame catches that (react-window's own recommendation for this case;
  // "smooth" behavior isn't supported for dynamic-height lists anyway).
  useEffect(() => {
    if (rowCount === 0) return;
    listRef.current?.scrollToRow({ index: rowCount - 1, align: 'end' });
    const raf = requestAnimationFrame(() => {
      listRef.current?.scrollToRow({ index: rowCount - 1, align: 'end' });
    });
    return () => cancelAnimationFrame(raf);
  }, [rowCount, listRef]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!chatKey) {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-clay-bg dark:bg-clay-bgDark px-6">
        <div className="w-24 h-24 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay dark:shadow-clay-dark flex items-center justify-center mb-6">
          <MessageCircle className="h-10 w-10 text-clay-primary dark:text-clay-primaryDark" />
        </div>
        <h2 className="text-xl font-semibold text-clay-text dark:text-clay-textDark">
          Select a chat to start messaging
        </h2>
        <p className="mt-2 text-sm text-clay-muted dark:text-clay-mutedDark text-center max-w-xs">
          Choose a conversation from the list, or search a phone number to start a new one.
        </p>
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

          {isGroup ? (
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-clay-primary text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h2 className="text-base font-semibold text-clay-text dark:text-clay-textDark truncate">
                  {currentChat.name}
                </h2>
                <p className="text-xs text-clay-muted dark:text-clay-mutedDark">
                  {currentChat.members?.length ? `${currentChat.members.length} members` : 'Group'}
                </p>
              </div>
            </div>
          ) : (
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
          )}

          {!isGroup && (
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => callState === 'idle' && startCall(chatKey, 'audio')}
                aria-label="Start audio call"
                className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset flex items-center justify-center text-clay-primary dark:text-clay-primaryDark"
              >
                <Phone className="h-5 w-5" />
              </button>
              <button
                onClick={() => callState === 'idle' && startCall(chatKey, 'video')}
                aria-label="Start video call"
                className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset flex items-center justify-center text-clay-primary dark:text-clay-primaryDark"
              >
                <Video className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        {rowCount > 0 && (
          <List
            listRef={listRef}
            rowComponent={MessageRow}
            rowCount={rowCount}
            rowHeight={dynamicRowHeight}
            rowProps={{ messages, myNumber, isGroup, isContactTyping }}
            className="no-scrollbar"
            style={{ height: '100%', width: '100%' }}
          />
        )}
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

      {showProfile && !isGroup && (
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
