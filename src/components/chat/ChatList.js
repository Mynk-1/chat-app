import React, { useState, useEffect } from 'react';
import { List } from 'react-window';
import { Search, MoreVertical, Users, UserPlus, LogOut, Settings as SettingsIcon, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import * as userApi from '../../api/user.api';
import CreateGroupModal from './CreateGroupModal';
import CallHistoryList from '../calls/CallHistoryList';
import SettingsModal from '../settings/SettingsModal';
import ChatRow from './ChatRow';
import { getAvatarColor, getDisplayName } from '../../utils/avatar';

// Fixed slot height per row (see ChatRow.js — the visible card is slightly
// shorter than this, with the remainder read as inter-row spacing).
const ROW_HEIGHT = 80;

const ChatList = ({ onSelectChat }) => {
  const { chats, typingNumbers } = useChat();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'calls'
  const [searchValue, setSearchValue] = useState('');
  const [lookup, setLookup] = useState(null); // null | 'loading' | { found: true|false }
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // WhatsApp-style flow: type a complete 10-digit number to look up whether
  // it's a registered user and message them directly — no separate "add
  // contact" step. The relationship is created automatically once a message
  // is actually sent (see contact.service.ensureContactRelation).
  useEffect(() => {
    if (activeTab !== 'chats') return;

    const digits = searchValue.replace(/\D/g, '');
    if (digits.length !== 10) {
      setLookup(null);
      return;
    }

    let cancelled = false;
    setLookup('loading');

    userApi
      .lookupUser(digits)
      .then(() => {
        if (!cancelled) setLookup({ found: true, phoneNumber: digits });
      })
      .catch(() => {
        if (!cancelled) setLookup({ found: false, phoneNumber: digits });
      });

    return () => {
      cancelled = true;
    };
  }, [searchValue, activeTab]);

  const handleMessageUser = (phoneNumber) => {
    onSelectChat({ type: 'contact', contactNumber: phoneNumber });
    setSearchValue('');
    setLookup(null);
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate('/');
  };

  const query = searchValue.trim().toLowerCase();
  const filteredChats =
    lookup || !query
      ? chats
      : chats.filter((c) =>
          (c.type === 'group' ? c.name : getDisplayName(c)).toLowerCase().includes(query)
        );

  return (
    <div className="w-full max-w-md h-full flex flex-col">
      {/* 1. Heading + menu */}
      <div className="p-3 pb-0 flex items-center justify-between">
        <h1 className="text-lg font-bold text-clay-text dark:text-clay-textDark">ChatConnect</h1>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Menu"
            className="w-10 h-10 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm active:shadow-clay-inset flex items-center justify-center text-clay-text dark:text-clay-textDark"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-clay-surface dark:bg-clay-surfaceDark rounded-clay shadow-clay dark:shadow-clay-dark overflow-hidden z-30">
                <button
                  onClick={() => {
                    setShowCreateGroup(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-clay-text dark:text-clay-textDark hover:bg-clay-bg dark:hover:bg-clay-bgDark"
                >
                  <Users className="h-4 w-4" />
                  New group
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-clay-text dark:text-clay-textDark hover:bg-clay-bg dark:hover:bg-clay-bgDark"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-clay-danger dark:text-clay-dangerDark hover:bg-clay-bg dark:hover:bg-clay-bgDark"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={activeTab === 'chats' ? 'Search or start new chat' : 'Search chats'}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-inset dark:shadow-clay-dark-inset
              text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-clay-muted dark:text-clay-mutedDark" />
        </div>
      </div>

      {/* 3. Chats / Calls tabs */}
      <div className="px-3">
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

      {/* 4. Content */}
      {activeTab === 'calls' ? (
        <CallHistoryList />
      ) : lookup || filteredChats.length === 0 ? (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
          {lookup === 'loading' && (
            <p className="p-4 text-center text-clay-muted dark:text-clay-mutedDark">Searching…</p>
          )}

          {lookup && lookup.found && (
            <button
              onClick={() => handleMessageUser(lookup.phoneNumber)}
              className="w-full flex items-center p-3 rounded-clay bg-clay-surface dark:bg-clay-surfaceDark shadow-clay-sm dark:shadow-clay-dark-sm"
            >
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                style={{ backgroundColor: getAvatarColor({ contactNumber: lookup.phoneNumber }) }}
              >
                <span className="text-lg font-semibold">{lookup.phoneNumber.slice(-2)}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0 text-left">
                <h3 className="text-sm font-semibold text-clay-text dark:text-clay-textDark">
                  {lookup.phoneNumber}
                </h3>
                <p className="text-sm text-clay-primary dark:text-clay-primaryDark flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" /> Message
                </p>
              </div>
            </button>
          )}

          {lookup && lookup.found === false && (
            <p className="p-4 text-center text-clay-muted dark:text-clay-mutedDark">
              No user found with this number
            </p>
          )}

          {!lookup && filteredChats.length === 0 && (
            <p className="p-4 text-clay-muted dark:text-clay-mutedDark text-center">
              {query ? 'No matches' : 'No chats yet — search a phone number to start one'}
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 px-3 py-3">
          <List
            rowComponent={ChatRow}
            rowCount={filteredChats.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ items: filteredChats, typingNumbers, onSelectChat }}
            className="no-scrollbar"
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      )}

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default ChatList;
