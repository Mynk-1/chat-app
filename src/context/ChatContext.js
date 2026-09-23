import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useSettings } from './SettingsContext';
import { EVENTS } from '../socket/events';
import * as chatApi from '../api/chat.api';
import * as contactApi from '../api/contact.api';
import * as groupApi from '../api/group.api';
import { getDisplayName } from '../utils/avatar';

const ChatContext = createContext(null);

const chatKeyOf = (chat) => (chat.type === 'group' ? chat.groupId : chat.contactNumber);

export const ChatProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { notificationsEnabled } = useSettings();

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); // { type: 'contact'|'group', contactNumber|groupId, ... }
  const [typingNumbers, setTypingNumbers] = useState(() => new Set());

  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const currentChatRef = useRef(currentChat);
  currentChatRef.current = currentChat;
  const notificationsEnabledRef = useRef(notificationsEnabled);
  notificationsEnabledRef.current = notificationsEnabled;

  const refreshChats = useCallback(async () => {
    try {
      const { data } = await chatApi.getChats();
      setChats(data.chats);
    } catch (error) {
      console.error('Failed to load chats', error);
    }
  }, []);

  // Single place that both selects a chat locally and tells the server what
  // this user is actively viewing (so the unread-count logic on the backend
  // knows not to bump the badge for a chat that's already open).
  const selectChat = useCallback(
    (chat) => {
      setCurrentChat(chat);
      if (!socket) return;
      if (chat.type === 'group') socket.emit(EVENTS.CHAT_OPEN, { groupId: chat.groupId });
      else socket.emit(EVENTS.CHAT_OPEN, { contactNumber: chat.contactNumber });
    },
    [socket]
  );

  const closeChat = useCallback(() => {
    setCurrentChat(null);
    socket?.emit(EVENTS.CHAT_CLOSE);
  }, [socket]);

  const createGroup = useCallback(async (name, members) => {
    await groupApi.createGroup(name, members);
    // The backend emits CHATS_UPDATED to every member including us, but
    // refresh directly too so the creator sees it without waiting on that.
    await refreshChats();
  }, [refreshChats]);

  // Nickname/avatar are owner-only labels (never seen by the other side), so
  // a plain REST round-trip is enough — no socket broadcast needed.
  const updateContactProfile = useCallback(async (contactNumber, profile) => {
    const { data } = await contactApi.updateContactProfile(contactNumber, profile);
    setChats(data.chats);
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const handleChatsUpdated = (updatedChats) => setChats(updatedChats);

    // Live online/offline dot without waiting for a full chat-list refetch.
    const handlePresenceChanged = ({ contactNumber, online }) => {
      setChats((prev) => prev.map((c) => (c.contactNumber === contactNumber ? { ...c, online } : c)));
    };

    // Tracked globally (not just in the open ChatWindow) so ChatList can show
    // a "typing…" preview for a contact even when their chat isn't open.
    const handleTypingUpdate = ({ from, isTyping }) => {
      setTypingNumbers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(from);
        else next.delete(from);
        return next;
      });
    };

    // A toast for messages that arrive anywhere other than the chat you're
    // currently looking at — mirrors the backend's own "is this the chat
    // they're actively viewing" check used for the unread badge.
    const handleMessageNew = (message) => {
      if (message.sender === user.phoneNumber) return;
      if (!notificationsEnabledRef.current) return;

      const key = message.groupId || message.sender;
      const active = currentChatRef.current;
      const isActive = active && chatKeyOf(active) === key;
      if (isActive) return;

      const existing = chatsRef.current.find((c) => chatKeyOf(c) === key);
      const title = existing ? (existing.type === 'group' ? existing.name : getDisplayName(existing)) : key;

      showToast({
        title,
        message: message.content,
        onClick: () =>
          selectChat(
            existing ||
              (message.groupId
                ? { type: 'group', groupId: message.groupId, name: title }
                : { type: 'contact', contactNumber: message.sender })
          ),
      });
    };

    socket.on(EVENTS.CHATS_UPDATED, handleChatsUpdated);
    socket.on(EVENTS.PRESENCE_CHANGED, handlePresenceChanged);
    socket.on(EVENTS.TYPING_UPDATE, handleTypingUpdate);
    socket.on(EVENTS.MESSAGE_NEW, handleMessageNew);

    refreshChats();

    return () => {
      socket.off(EVENTS.CHATS_UPDATED, handleChatsUpdated);
      socket.off(EVENTS.PRESENCE_CHANGED, handlePresenceChanged);
      socket.off(EVENTS.TYPING_UPDATE, handleTypingUpdate);
      socket.off(EVENTS.MESSAGE_NEW, handleMessageNew);
    };
  }, [socket, user, refreshChats, showToast, selectChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        selectChat,
        closeChat,
        createGroup,
        updateContactProfile,
        typingNumbers,
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
