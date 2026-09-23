import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { EVENTS } from '../socket/events';
import * as contactApi from '../api/contact.api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const socket = useSocket();
  const [contacts, setContacts] = useState([]);
  const [typingNumbers, setTypingNumbers] = useState(() => new Set());

  const refreshContacts = useCallback(async () => {
    try {
      const { data } = await contactApi.getContacts();
      setContacts(data.contacts);
    } catch (error) {
      console.error('Failed to load contacts', error);
    }
  }, []);

  const addContact = useCallback(
    (contactNumber) => {
      socket?.emit(EVENTS.CONTACT_ADD, { contactNumber });
    },
    [socket]
  );

  // Nickname/avatar are owner-only labels (never seen by the other side), so
  // a plain REST round-trip is enough — no socket broadcast needed.
  const updateContactProfile = useCallback(async (contactNumber, profile) => {
    const { data } = await contactApi.updateContactProfile(contactNumber, profile);
    setContacts(data.contacts);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleContactsUpdated = (updatedContacts) => setContacts(updatedContacts);

    // Live online/offline dot without waiting for a full contact-list refetch.
    const handlePresenceChanged = ({ contactNumber, online }) => {
      setContacts((prev) =>
        prev.map((c) => (c.contactNumber === contactNumber ? { ...c, online } : c))
      );
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

    socket.on(EVENTS.CONTACT_UPDATED, handleContactsUpdated);
    socket.on(EVENTS.PRESENCE_CHANGED, handlePresenceChanged);
    socket.on(EVENTS.TYPING_UPDATE, handleTypingUpdate);

    refreshContacts();

    return () => {
      socket.off(EVENTS.CONTACT_UPDATED, handleContactsUpdated);
      socket.off(EVENTS.PRESENCE_CHANGED, handlePresenceChanged);
      socket.off(EVENTS.TYPING_UPDATE, handleTypingUpdate);
    };
  }, [socket, refreshContacts]);

  return (
    <ChatContext.Provider value={{ contacts, addContact, updateContactProfile, typingNumbers }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
